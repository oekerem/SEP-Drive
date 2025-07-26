package sepdrive.gruppen.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sepdrive.gruppen.backend.dto.*;
import sepdrive.gruppen.backend.entity.*;
import sepdrive.gruppen.backend.repository.DriveOfferRepository;
import sepdrive.gruppen.backend.repository.DriveRepository;
import sepdrive.gruppen.backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class DriveOfferService {

    private final DriveOfferRepository driveOfferRepository;
    private final DriveRepository driveRepository;
    private final UserRepository userRepository;
    private final NotificationSocketService notificationSocketService;
    private final DriveService driveService;
    private final ChatService chatService;

    @Autowired
    public DriveOfferService(DriveOfferRepository driveOfferRepository,
                             DriveRepository driveRepository,
                             UserRepository userRepository,
                             NotificationSocketService notificationSocketService,
                             DriveService driveService,
                             ChatService chatService) {
        this.driveOfferRepository = driveOfferRepository;
        this.driveRepository = driveRepository;
        this.userRepository = userRepository;
        this.notificationSocketService = notificationSocketService;
        this.driveService = driveService;
        this.chatService = chatService;
    }

    public DriveOfferResponse createDriveOffer(DriveOfferRequest request) {
        Drive drive = driveRepository.findById(request.getDriveId())
                .orElseThrow(() -> new IllegalArgumentException("Drive not found"));

        User fahrer = userRepository.findByUsername(request.getUsernameFahrer())
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        Optional<DriveOffer> existingOffer = driveOfferRepository.findByDriveAndFahrer(drive, fahrer);
        if (existingOffer.isPresent()) {
            throw new IllegalStateException("This offer already exists");
        }

        if (checkIfFahrerHasPendingOffer(request.getUsernameFahrer())) {
            throw new IllegalStateException("Fahrer has already a pending offer");
        }

        Double totalDistance = driveRepository.findSumDistanceByUserFahrerAndDriveStatus(fahrer,DriveStatus.COMPLETED);
        int totalDrives = driveRepository.findCountByUserFahrerAndDriveStatus(fahrer, DriveStatus.COMPLETED);

        DriveOffer offer = new DriveOffer();
        offer.setFahrer(fahrer);
        offer.setDrive(drive);
        offer.setStatus(DriveOfferStatus.PENDING);
        offer.setTotalDistance(totalDistance != null ? totalDistance : 0.0);
        offer.setTotalDrives(totalDrives);
        driveOfferRepository.save(offer);
        notificationSocketService.sendDriveOfferToKunde(
                drive.getUserKunde().getUsername(),
                new DriveOfferNotificationResponse(
                        fahrer.getUsername(),
                        totalDrives,
                        totalDistance != null ? totalDistance : 0.0,
                        drive.getId()
                )
        );

        return mapDriveOfferToDriveOfferResponse(offer);
    }

    public List<DriveOfferResponse> getOffersForDrive(Long driveId) {
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new IllegalArgumentException("Fahrt nicht gefunden"));

        return driveOfferRepository.findByDrive(drive).stream()
                .map(this::mapDriveOfferToDriveOfferResponse)
                .toList();
    }

    @Transactional
    public DriveOfferResponse acceptOffer(Long driveId, Long offerId) {
        Drive drive = driveRepository.getDriveById(driveId)
                .orElseThrow(() -> new IllegalArgumentException("Drive not found"));
        DriveOffer offer = driveOfferRepository.findDriveOfferById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        if (!offer.getDrive().getId().equals(drive.getId())) {
            throw new IllegalArgumentException("Offer does not belong to this drive");
        }

        List<DriveOffer> allOffers = driveOfferRepository.findByDrive(drive);
        for (DriveOffer o : allOffers) {
            if (o.getId() == offerId) {
                o.setStatus(DriveOfferStatus.ACCEPTED);
            } else {
                o.setStatus(DriveOfferStatus.REJECTED);
            }
        }

        drive.setUserFahrer(offer.getFahrer());
        driveRepository.save(drive);
        driveOfferRepository.saveAll(allOffers);

        return mapDriveOfferToDriveOfferResponse(offer);
    }

    @Transactional
    public DriveOfferResponse rejectOffer(Long offerId) {
        DriveOffer offer = driveOfferRepository.findDriveOfferById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        offer.setStatus(DriveOfferStatus.REJECTED);
        driveOfferRepository.save(offer);

        return mapDriveOfferToDriveOfferResponse(offer);
    }

    @Transactional
    public DriveOfferResponse withdrawOffer(Long offerId, String usernameFahrer) {
        DriveOffer offer = driveOfferRepository.findDriveOfferById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found"));

        if (!offer.getFahrer().getUsername().equals(usernameFahrer)) {
            throw new IllegalArgumentException("You can only withdraw your own offer");
        }
        if (offer.getStatus() == DriveOfferStatus.ACCEPTED) {
            throw new IllegalArgumentException("Offer has already been accepted");
        }

        offer.setStatus(DriveOfferStatus.WITHDRAWN);
        driveOfferRepository.save(offer);

        return mapDriveOfferToDriveOfferResponse(offer);
    }

    public boolean checkIfFahrerHasPendingOffer(String fahrerUsername) {
        Optional<DriveOffer> offer = driveOfferRepository
                .findDriveOfferByFahrer_UsernameAndStatus(fahrerUsername, DriveOfferStatus.PENDING);
        return offer.isPresent();
    }

    public DriveOfferResponse getOfferByFahrerUsername(String usernameFahrer) {
        DriveOffer offer = driveOfferRepository
                .findDriveOfferByFahrer_UsernameAndStatus(usernameFahrer, DriveOfferStatus.PENDING)
                .orElseThrow(() -> new IllegalArgumentException("Fahrer '" + usernameFahrer + "' not found"));
        return mapDriveOfferToDriveOfferResponse(offer);
    }

    public DriveOfferWithDriveResponse getOfferWithDriveByFahrerUsername(String usernameFahrer) {
        Optional<DriveOffer> optionalOffer = driveOfferRepository
                .findDriveOfferByFahrer_UsernameAndStatus(usernameFahrer, DriveOfferStatus.PENDING);

        if (optionalOffer.isEmpty()) {
            optionalOffer = driveOfferRepository
                    .findDriveOfferByFahrer_UsernameAndStatus(usernameFahrer, DriveOfferStatus.ACCEPTED);
        }

        DriveOffer offer = optionalOffer.orElseThrow(() ->
                new IllegalArgumentException("Fahrer '" + usernameFahrer + "' hat kein aktives Angebot."));

        DriveOfferResponse offerDto = mapDriveOfferToDriveOfferResponse(offer);
        DriveRequest driveDto = driveService.mapDriveToDriveRequest(offer.getDrive());

        return new DriveOfferWithDriveResponse(offerDto, driveDto);
    }

    public DriveOfferWithDriveResponse getAcceptedOfferWithDriveByFahrerUsername(String usernameFahrer) {
        DriveOffer offer = driveOfferRepository
                .findDriveOfferByFahrer_UsernameAndStatus(usernameFahrer, DriveOfferStatus.ACCEPTED)
                .orElseThrow(() ->
                        new IllegalArgumentException("Fahrer '" + usernameFahrer + "' hat kein ACCEPTED-Angebot."));

        DriveOfferResponse offerDto = mapDriveOfferToDriveOfferResponse(offer);
        DriveRequest driveDto = driveService.mapDriveToDriveRequest(offer.getDrive());

        return new DriveOfferWithDriveResponse(offerDto, driveDto);
    }

    public DriveOfferResponse mapDriveOfferToDriveOfferResponse(DriveOffer offer) {
        DriveOfferResponse response = new DriveOfferResponse();
        response.setId(offer.getId());
        response.setFahrerUsername(offer.getFahrer().getUsername());
        response.setDriveId(offer.getDrive().getId());
        response.setStatus(offer.getStatus());
        response.setTotalDistance(offer.getTotalDistance());
        response.setTotalDrives(offer.getTotalDrives());
        return response;
    }
}

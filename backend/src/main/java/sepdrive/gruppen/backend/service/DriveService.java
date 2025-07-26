package sepdrive.gruppen.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sepdrive.gruppen.backend.dto.DriveRequest;
import sepdrive.gruppen.backend.entity.*;
import sepdrive.gruppen.backend.repository.DriveOfferRepository;
import sepdrive.gruppen.backend.repository.DriveRepository;
import sepdrive.gruppen.backend.repository.UserRepository;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DriveService {

    private final DriveRepository driveRepository;
    private final UserService userService;
    private final DriveOfferRepository driveOfferRepository;
    private final WalletService walletService;
    private final UserRepository userRepository;

    @Autowired
    public DriveService(DriveRepository driveRepository,
                        UserService userService,
                        DriveOfferRepository driveOfferRepository,
                        WalletService walletService,
                        UserRepository userRepository) {
        this.driveRepository = driveRepository;
        this.userService = userService;
        this.driveOfferRepository = driveOfferRepository;
        this.walletService = walletService;
        this.userRepository = userRepository;
    }

    public Drive createRide(DriveRequest request) {
        if (request.getRoute() == null || request.getRoute().length < 2) {
            throw new IllegalArgumentException("Die Route muss mindestens Start- und Zielpunkt enthalten.");
        }
        if(hasActiveRide(request.getUsernameKunde()))
            throw new IllegalStateException("User already has an active ride");
        if(request.getCost() > walletService.getBalance(request.getUsernameKunde()))
            throw new IllegalStateException("Kunde is too broke for this ride");

        if (request.getCreatedAt() == null)
            request.setCreatedAt(java.time.LocalDateTime.now());
        Drive drive = mapDriveRequestToDrive(request);
        drive.setDriveStatus(DriveStatus.ACTIVE);
        driveRepository.save(drive);
        return drive;
    }

    public void cancelRide(String username) {
        Drive drive = driveRepository.findByUserKunde_UsernameAndDriveStatus(username, DriveStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("The user " + username + " has no active ride"));

        drive.setDriveStatus(DriveStatus.CANCELLED);
        driveRepository.save(drive);

        cancelOffersByDrive(drive);
    }

    public Drive getDriveByUsername(String username) {
        if (!userService.checkIfUsernameExists(username))
            throw new IllegalArgumentException("User '" + username + "' does not exist.");
        return driveRepository.findByUserKunde_UsernameAndDriveStatus(username, DriveStatus.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("User '" + username + "' has no active ride."));
    }

    public List<DriveRequest> getAllOpenDrives() {
        List<Drive> drives = driveRepository.getDriveByDriveStatus(DriveStatus.ACTIVE);
        return drives.stream()
                .map(this::mapDriveToDriveRequest)
                .toList();
    }

    public boolean hasActiveRide(String username) {
        return driveRepository.findByUserKunde_UsernameAndDriveStatus(username, DriveStatus.ACTIVE).isPresent();
    }

    public List<Point> getRouteForDrive(Long driveId) {
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new IllegalArgumentException("Drive not found with ID: " + driveId));
        return drive.getRoute();
    }

    @Transactional
    public void cancelOffersByDrive(Drive drive) {
        List<DriveOffer> offers = driveOfferRepository.findByDrive(drive);
        for (DriveOffer offer : offers) {
            if (offer.getStatus() == DriveOfferStatus.ACCEPTED || offer.getStatus() == DriveOfferStatus.PENDING) {
                offer.setStatus(DriveOfferStatus.WITHDRAWN);
            }
        }
        driveOfferRepository.saveAll(offers);
    }

    @Transactional
    public DriveRequest completeDrive(Long driveId) {
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new IllegalArgumentException("Drive with ID " + driveId + " not found."));

        if (drive.getDriveStatus() != DriveStatus.ACTIVE) {
            throw new IllegalStateException("Drive is not active and cannot be completed.");
        }

        walletService.transfer(drive.getUserKunde().getUsername(),
                drive.getUserFahrer().getUsername(),
                drive.getCost());

        drive.setDriveStatus(DriveStatus.COMPLETED);
        drive.setEndTime(java.time.LocalDateTime.now());
        driveRepository.save(drive);

        List<DriveOffer> offers = driveOfferRepository.findByDrive(drive);
        for (DriveOffer offer : offers) {
            if (offer.getStatus() == DriveOfferStatus.ACCEPTED)
                offer.setStatus(DriveOfferStatus.COMPLETED);
            else if (offer.getStatus() == DriveOfferStatus.PENDING)
                offer.setStatus(DriveOfferStatus.REJECTED);
        }
        driveOfferRepository.saveAll(offers);

        return mapDriveToDriveRequest(drive);
    }

    public boolean updateDrive(Long driveId, DriveRequest request) {
        Optional<Drive> optionalDrive = driveRepository.findById(driveId);
        if (optionalDrive.isEmpty()) {
            return false;
        }
        if(request.getCost() > walletService.getBalance(request.getUsernameKunde()))
            throw new IllegalStateException("Kunde is too broke for this update");

        Drive drive = optionalDrive.get();

        drive.setStartLocation(request.getStartLocation());
        drive.setEndLocation(request.getEndLocation());
        drive.setStartCoordinates(mapArrayDoubleToListDouble(request.getStartCoordinates()));
        drive.setEndCoordinates(mapArrayDoubleToListDouble(request.getEndCoordinates()));
        drive.setDistance(request.getDistance());
        drive.setDuration(request.getDuration());
        drive.setCost(request.getCost());
        drive.setRoute(mapArrayArrayDoubleToPointList(request.getRoute()));
        drive.setStops(mapStopArrayToStopList(request.getStops()));
//        drive.setStopsPoints(request.getStopPoints());

        driveRepository.save(drive);
        return true;
    }

    public Drive mapDriveRequestToDrive(DriveRequest request) {
        if(userService.checkIfUsernameExists(request.getUsernameKunde())){
            Drive drive = new Drive();
            drive.setUserKunde(userService.getUserByUsername(request.getUsernameKunde()));
            drive.setStartLocation(request.getStartLocation());
            drive.setStartCoordinates(mapArrayDoubleToListDouble(request.getStartCoordinates()));
            drive.setEndCoordinates(mapArrayDoubleToListDouble(request.getEndCoordinates()));
            drive.setEndLocation(request.getEndLocation());
            drive.setDriveStatus(request.getStatus());
            drive.setDistance(request.getDistance());
            drive.setDuration(request.getDuration());
            if(request.getCost()== null)
                drive.setCost(request.getDistance());
            else
                drive.setCost(request.getCost());
            drive.setCreatedAt(request.getCreatedAt());
            drive.setRoute(mapArrayArrayDoubleToPointList(request.getRoute()));
            drive.setStops(mapStopArrayToStopList(request.getStops()));
            return drive;
        }
        else{
            throw new IllegalArgumentException("Username does not exist");
        }
    }

    public DriveRequest mapDriveToDriveRequest(Drive drive) {
        DriveRequest request = new DriveRequest();
        request.setId(drive.getId());
        request.setUsernameKunde(drive.getUserKunde().getUsername());
        if (drive.getUserFahrer() != null) {
            request.setUsernameFahrer(drive.getUserFahrer().getUsername());
        }
        request.setStartLocation(drive.getStartLocation());
        request.setStartCoordinates(mapListDoubleToDoubleArray(drive.getStartCoordinates()));
        request.setEndLocation(drive.getEndLocation());
        request.setEndCoordinates(mapListDoubleToDoubleArray(drive.getEndCoordinates()));
        request.setDistance(drive.getDistance());
        request.setDuration(drive.getDuration());
        request.setStatus(drive.getDriveStatus());
        request.setCreatedAt(drive.getCreatedAt());
        request.setCost(drive.getCost());
        request.setRoute(mapPointListToArrayArrayDouble(drive.getRoute()));
        request.setStops(mapStopListToStopArray(drive.getStops()));
        return request;
    }

    public Double[] mapListDoubleToDoubleArray(List<Double> list) {
        if (list == null)
            return new Double[0];
        Double[] doubles = new Double[list.size()];
        for (int i = 0; i < list.size(); i++) {
            doubles[i] = list.get(i);
        }
        return doubles;
    }

    public List<Double> mapArrayDoubleToListDouble(Double[] doubles) {
        List<Double> list = new ArrayList<>();
        for (int i = 0; i < doubles.length; i++) {
            list.add(doubles[i]);
        }
        return list;
    }

    public List<Point> mapArrayArrayDoubleToPointList(Double[][] array) {
        List<Point> points = new ArrayList<>();
        for (Double[] pair : array) {
            if (pair.length >= 2) {
                points.add(new Point(pair[0], pair[1]));
            }
        }
        return points;
    }

    public Double[][] mapPointListToArrayArrayDouble(List<Point> points) {
        Double[][] result = new Double[points.size()][2];
        for (int i = 0; i < points.size(); i++) {
            result[i][0] = points.get(i).getLatitude();
            result[i][1] = points.get(i).getLongitude();
        }
        return result;
    }

    public List<DriveRequest> getDriveHistory(String username) {
        List<Drive> drives = new ArrayList<>();

        drives.addAll(driveRepository.findAllByUserKunde_UsernameAndDriveStatus(username, DriveStatus.COMPLETED));
        drives.addAll(driveRepository.findAllByUserFahrer_UsernameAndDriveStatus(username, DriveStatus.COMPLETED));

        List<DriveRequest> result = new ArrayList<>();
        for (Drive drive : drives) {
            DriveRequest dto = mapDriveToDriveHistoryRequest(drive);
            result.add(dto);
        }
        result.sort((a, b) -> {
            if (a.getEndTime() == null && b.getEndTime() == null) return 0;
            if (a.getEndTime() == null) return 1;
            if (b.getEndTime() == null) return -1;
            return b.getEndTime().compareTo(a.getEndTime());
        });

        return result;
    }

    public DriveRequest mapDriveToDriveHistoryRequest(Drive drive) {
        DriveRequest dto = new DriveRequest();
        dto.setId(drive.getId());
        dto.setStartLocation(drive.getStartLocation());
        dto.setEndLocation(drive.getEndLocation());
        dto.setStatus(drive.getDriveStatus());
        dto.setEndTime(drive.getEndTime());
        dto.setCost(drive.getCost());
        dto.setDuration(drive.getDuration());
        dto.setDistance(drive.getDistance());

        if (drive.getUserKunde() != null) {
            dto.setUsernameKunde(drive.getUserKunde().getUsername());
        }

        if (drive.getUserFahrer() != null) {
            dto.setUsernameFahrer(drive.getUserFahrer().getUsername());
        }

        if (drive.getEndTime() != null) {
            dto.setEndMonth(drive.getEndTime().getMonthValue());
            dto.setEndYear(drive.getEndTime().getYear());
        } else {
            dto.setEndMonth(null);
            dto.setEndYear(null);
        }

        return dto;
    }

    private List<Stop> mapStopArrayToStopList(Stop[] stops) {
        if (stops == null) return List.of();
        List<Stop> stopList = new ArrayList<>(stops.length);
        for (Stop dto : stops) {
            Stop entity = new Stop();
            entity.setAddress(dto.getAddress());
            entity.setCoordinates(dto.getCoordinates());
            stopList.add(entity);
        }
        return stopList;
    }

    private Stop[] mapStopListToStopArray(List<Stop> stopList) {
        if (stopList == null) return new Stop[0];
        Stop[] stopArray = new Stop[stopList.size()];
        for (int i = 0; i < stopList.size(); i++) {
            Stop entity = stopList.get(i);
            Stop dto    = new Stop();
            dto.setAddress(entity.getAddress());
            dto.setCoordinates(entity.getCoordinates());
            stopArray[i] = dto;
        }
        return stopArray;
    }
}

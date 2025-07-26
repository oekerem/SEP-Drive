package service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import sepdrive.gruppen.backend.dto.DriveOfferNotificationResponse;
import sepdrive.gruppen.backend.dto.DriveOfferRequest;
import sepdrive.gruppen.backend.dto.DriveOfferResponse;
import sepdrive.gruppen.backend.entity.*;
import sepdrive.gruppen.backend.repository.DriveOfferRepository;
import sepdrive.gruppen.backend.repository.DriveRepository;
import sepdrive.gruppen.backend.repository.UserRepository;
import sepdrive.gruppen.backend.service.*;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

public class DriveServiceTest {

    private DriveOfferRepository driveOfferRepository;
    private DriveRepository driveRepository;
    private UserRepository userRepository;
    private NotificationSocketService notificationSocketService;
    private DriveService driveService;
    private DriveOfferService driveOfferService;
    private ChatService chatService;

    @BeforeEach
    void setUp() {
        driveOfferRepository = mock(DriveOfferRepository.class);
        driveRepository = mock(DriveRepository.class);
        userRepository = mock(UserRepository.class);
        notificationSocketService = mock(NotificationSocketService.class);
        driveService = mock(DriveService.class);
        chatService = mock(ChatService.class);


        driveOfferService = new DriveOfferService(
                driveOfferRepository,
                driveRepository,
                userRepository,
                notificationSocketService,
                driveService,
                chatService
        );
    }

    @Test
    void createDriveOffer_goodCase_test() {
        // given
        User fahrer = new User();
        fahrer.setUsername("fahrer1");

        User kunde = new User();
        kunde.setUsername("kunde1");

        Drive drive = new Drive();
        drive.setId(1L);
        drive.setUserKunde(kunde);

        DriveOfferRequest request = new DriveOfferRequest();
        request.setDriveId(1L);
        request.setUsernameFahrer("fahrer1");

        when(driveRepository.findById(1L)).thenReturn(Optional.of(drive));
        when(userRepository.findByUsername("fahrer1")).thenReturn(Optional.of(fahrer));
        when(driveOfferRepository.findByDriveAndFahrer(drive, fahrer)).thenReturn(Optional.empty());
        when(driveOfferRepository.findDriveOfferByFahrer_UsernameAndStatus("fahrer1", DriveOfferStatus.PENDING)).thenReturn(Optional.empty());
        when(driveRepository.findSumDistanceByUserFahrerAndDriveStatus(fahrer, DriveStatus.COMPLETED)).thenReturn(50.0);
        when(driveRepository.findCountByUserFahrerAndDriveStatus(fahrer, DriveStatus.COMPLETED)).thenReturn(5);

        // when
        DriveOfferResponse result = driveOfferService.createDriveOffer(request);

        // then
        assertThat(result.getFahrerUsername()).isEqualTo("fahrer1");
        assertThat(result.getStatus()).isEqualTo(DriveOfferStatus.PENDING);
        verify(driveOfferRepository).save(any(DriveOffer.class));
        verify(notificationSocketService).sendDriveOfferToKunde(eq("kunde1"), any(DriveOfferNotificationResponse.class));
    }

    @Test
    void getOffersForDrive_goodCase_test() {
        // given
        Drive drive = new Drive();
        drive.setId(2L);

        User fahrer = new User();
        fahrer.setUsername("fahrer1");

        DriveOffer offer = new DriveOffer();
        offer.setId(10L);
        offer.setDrive(drive);
        offer.setFahrer(fahrer);
        offer.setStatus(DriveOfferStatus.PENDING);

        when(driveRepository.findById(2L)).thenReturn(Optional.of(drive));
        when(driveOfferRepository.findByDrive(drive)).thenReturn(List.of(offer));

        // when
        List<DriveOfferResponse> result = driveOfferService.getOffersForDrive(2L);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFahrerUsername()).isEqualTo("fahrer1");
    }

    @Test
    void acceptOffer_goodCase_test() {
        // given
        Drive drive = new Drive();
        drive.setId(3L);

        User fahrer = new User();
        fahrer.setUsername("fahrer1");

        DriveOffer acceptedOffer = new DriveOffer();
        acceptedOffer.setId(11L);
        acceptedOffer.setDrive(drive);
        acceptedOffer.setFahrer(fahrer);
        acceptedOffer.setStatus(DriveOfferStatus.PENDING);

        DriveOffer rejectedOffer = new DriveOffer();
        rejectedOffer.setId(12L);
        rejectedOffer.setDrive(drive);
        rejectedOffer.setFahrer(new User());
        rejectedOffer.setStatus(DriveOfferStatus.PENDING);

        when(driveRepository.getDriveById(3L)).thenReturn(Optional.of(drive));
        when(driveOfferRepository.findDriveOfferById(11L)).thenReturn(Optional.of(acceptedOffer));
        when(driveOfferRepository.findByDrive(drive)).thenReturn(List.of(acceptedOffer, rejectedOffer));

        // when
        DriveOfferResponse result = driveOfferService.acceptOffer(3L, 11L);

        // then
        assertThat(result.getStatus()).isEqualTo(DriveOfferStatus.ACCEPTED);
        assertThat(drive.getUserFahrer()).isEqualTo(fahrer);
        verify(driveRepository).save(drive);
        verify(driveOfferRepository).saveAll(anyList());
    }
}
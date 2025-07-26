package service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import sepdrive.gruppen.backend.dto.DriveRequest;
import sepdrive.gruppen.backend.entity.Drive;
import sepdrive.gruppen.backend.entity.DriveStatus;
import sepdrive.gruppen.backend.entity.User;
import sepdrive.gruppen.backend.service.DriveService;
import sepdrive.gruppen.backend.service.UserService;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class FahrpreisEinheitstests {

    @Mock
    private UserService userService;

    @InjectMocks
    private DriveService driveService;

    private DriveRequest driveRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        driveRequest = new DriveRequest();
        driveRequest.setId(1L);
        driveRequest.setUsernameKunde("Kunde");
        driveRequest.setUsernameFahrer("Fahrer");
        driveRequest.setStartLocation("Essen");
        driveRequest.setEndLocation("Trinken");
        driveRequest.setEndCoordinates(new Double[]{1.23,2.34});
        driveRequest.setStartCoordinates(new Double[]{3.45,4.56});
        driveRequest.setDistance(5.67);
        driveRequest.setDuration(15);
        driveRequest.setStatus(DriveStatus.ACTIVE);
        driveRequest.setCreatedAt(LocalDateTime.now());
        driveRequest.setEndTime(LocalDateTime.now().plusMinutes(15));
        driveRequest.setRoute(new Double[][]{{1.23,2.34},{3.45,4.56}});
    }

    @Test
    public void mapDriveRequestToDrive_driveRequestCostExistsCase_test() {
        // given
        driveRequest.setCost(5.67);

        User mockUser = new User();
        mockUser.setUsername("Kunde");

        when(userService.checkIfUsernameExists("Kunde")).thenReturn(true);
        when(userService.getUserByUsername("Kunde")).thenReturn(mockUser);

        // when
        Drive result = driveService.mapDriveRequestToDrive(driveRequest);

        // then
        assertEquals(driveRequest.getCost(), result.getCost());
        assertEquals("Kunde", result.getUserKunde().getUsername());
        assertEquals("Essen", result.getStartLocation());
        assertEquals("Trinken", result.getEndLocation());
    }

    @Test
    public void mapDriveRequestToDrive_driveRequestCostDontExistsCase_test() {
        // given

        User mockUser = new User();
        mockUser.setUsername("Kunde");

        when(userService.checkIfUsernameExists("Kunde")).thenReturn(true);
        when(userService.getUserByUsername("Kunde")).thenReturn(mockUser);

        // when
        Drive result = driveService.mapDriveRequestToDrive(driveRequest);

        // then
        assertEquals(driveRequest.getDistance(), result.getCost());
        assertEquals("Kunde", result.getUserKunde().getUsername());
        assertEquals("Essen", result.getStartLocation());
        assertEquals("Trinken", result.getEndLocation());
    }
}

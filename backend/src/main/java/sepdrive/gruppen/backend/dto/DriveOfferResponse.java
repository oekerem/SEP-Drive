package sepdrive.gruppen.backend.dto;

import lombok.Getter;
import lombok.Setter;
import sepdrive.gruppen.backend.entity.DriveOfferStatus;

@Getter
@Setter
public class DriveOfferResponse {
    private Long id;
    private String fahrerUsername;
    private Long driveId;
    private DriveOfferStatus status;
    private double totalDistance;
    private int totalDrives;
}

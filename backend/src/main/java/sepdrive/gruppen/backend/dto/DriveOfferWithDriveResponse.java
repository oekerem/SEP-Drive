package sepdrive.gruppen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriveOfferWithDriveResponse {
    private DriveOfferResponse offer;
    private DriveRequest drive;
}

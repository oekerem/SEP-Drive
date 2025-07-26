package sepdrive.gruppen.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriveOfferNotificationResponse {
    private String fahrerBenutzername;
    private int anzahlFahrten;
    private double gesamtDistanz;
    private Long driveId;
}

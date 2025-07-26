package sepdrive.gruppen.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DriveOfferRequest {
    @NotBlank
    private String usernameFahrer;

    @NotNull
    private Long driveId;
}

package sepdrive.gruppen.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import sepdrive.gruppen.backend.entity.DriveStatus;
import sepdrive.gruppen.backend.entity.Stop;


import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class DriveRequest {

    private Long id;

    @NotBlank
    private String usernameKunde;

    private String usernameFahrer;

    @NotBlank
    private String startLocation;

    private Double[] startCoordinates;

    @NotBlank
    private String endLocation;

    private Double[] endCoordinates;

    private Double distance;

    private Integer duration;

    private DriveStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime endTime;

    private Double cost;

    private Double[][] route;

    private Stop[] stops;

    private Integer endMonth;

    private Integer endYear;
}


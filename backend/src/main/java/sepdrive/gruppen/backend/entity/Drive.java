package sepdrive.gruppen.backend.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "drives")

public class Drive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kunde_id", nullable = false)
    @JsonIgnore
    private User userKunde;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fahrer_id")
    @JsonIgnore
    private User userFahrer;

    @NotBlank
    private String startLocation;

    private List<Double> startCoordinates;

    @NotBlank
    private String endLocation;

    private List<Double> endCoordinates;

    @Enumerated(EnumType.STRING)
    @NotNull
    private DriveStatus driveStatus;

    private Double distance;

    private Integer duration;

    private Double cost;

    private LocalDateTime createdAt;

    private LocalDateTime endTime;

    @ElementCollection
    @CollectionTable(name = "route", joinColumns = @JoinColumn(name = "drive_id"))
    private List<Point> route;

    @ElementCollection
    @CollectionTable(name = "stops", joinColumns = @JoinColumn(name = "drive_id"))
    private List<Stop> stops;

}

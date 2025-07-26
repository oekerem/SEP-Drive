package sepdrive.gruppen.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
public class Stop {
    private String address;
    private Double[] coordinates;
}

package sepdrive.gruppen.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransferRequest {
    private String senderUsername;
    private String receiverUsername;
    private double amount;
}

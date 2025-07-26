package sepdrive.gruppen.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {
    private Long driveOfferId;
    private String senderUsername;
    private String content;
}

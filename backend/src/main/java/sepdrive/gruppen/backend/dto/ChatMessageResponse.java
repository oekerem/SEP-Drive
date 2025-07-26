package sepdrive.gruppen.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessageResponse {
    private Long id;
    private String senderUsername;
    private String content;
    private LocalDateTime createdAt;
    private boolean edited;
}

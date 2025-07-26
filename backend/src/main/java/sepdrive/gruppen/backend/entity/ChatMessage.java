package sepdrive.gruppen.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long driveOfferId;

    @Column(nullable = false)
    private String senderUsername;

    @Column(nullable = false, length = 5000)
    private String content;

    private LocalDateTime createdAt;

    private boolean edited;

    private boolean readByFahrer;

    private boolean readByKunde;
}

package sepdrive.gruppen.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import sepdrive.gruppen.backend.entity.ChatMessage;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findAllByDriveOfferId(Long driveOfferId);
}

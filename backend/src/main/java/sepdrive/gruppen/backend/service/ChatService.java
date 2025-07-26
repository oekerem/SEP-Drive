package sepdrive.gruppen.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sepdrive.gruppen.backend.dto.ChatMessageRequest;
import sepdrive.gruppen.backend.dto.ChatMessageResponse;
import sepdrive.gruppen.backend.entity.ChatMessage;
import sepdrive.gruppen.backend.entity.Role;
import sepdrive.gruppen.backend.entity.User;
import sepdrive.gruppen.backend.repository.ChatMessageRepository;
import sepdrive.gruppen.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Autowired
    public ChatService(ChatMessageRepository chatMessageRepository,
                       UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        ChatMessage message = new ChatMessage();
        message.setDriveOfferId(request.getDriveOfferId());
        message.setSenderUsername(request.getSenderUsername());
        message.setContent(request.getContent());
        message.setCreatedAt(LocalDateTime.now());
        message.setEdited(false);
        message.setReadByKunde(false);
        message.setReadByFahrer(false);
        chatMessageRepository.save(message);
        return mapToResponse(message);
    }

    public List<ChatMessageResponse> getMessages(Long driveOfferId) {
        return chatMessageRepository.findAllByDriveOfferId(driveOfferId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void markChatOpened(Long driveOfferId, String role) {
        List<ChatMessage> messages = chatMessageRepository.findAllByDriveOfferId(driveOfferId);

        for (ChatMessage message : messages) {
            if (!message.getSenderUsername().equalsIgnoreCase(role)) {
                if (role.equalsIgnoreCase("kunde")) {
                    message.setReadByKunde(true);
                } else if (role.equalsIgnoreCase("fahrer")) {
                    message.setReadByFahrer(true);
                }
            }
        }
        chatMessageRepository.saveAll(messages);
    }

    public void editMessage(Long messageId, String username, String newContent) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getSenderUsername().equals(username)) {
            throw new IllegalArgumentException("Cannot edit messages from another user.");
        }

        if (isMessageLocked(message)) {
            throw new IllegalStateException("Editing is no longer allowed. Message has already been read.");
        }

        message.setContent(newContent);
        message.setEdited(true);
        chatMessageRepository.save(message);
    }

    public void deleteMessage(Long messageId, String username) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getSenderUsername().equals(username)) {
            throw new IllegalArgumentException("Cannot delete messages from another user.");
        }

        if (isMessageLocked(message)) {
            throw new IllegalStateException("Deleting is no longer allowed. Message has already been read.");
        }

        chatMessageRepository.delete(message);
    }

    private boolean isMessageLocked(ChatMessage message) {
        User user = userRepository.findByUsername(message.getSenderUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + message.getSenderUsername()));

        Role role = user.getRole();

        if (role == Role.KUNDE) {
            return message.isReadByFahrer();
        } else if (role == Role.FAHRER) {
            return message.isReadByKunde();
        }

        return false;
    }

    private ChatMessageResponse mapToResponse(ChatMessage message) {
        ChatMessageResponse dto = new ChatMessageResponse();
        dto.setId(message.getId());
        dto.setSenderUsername(message.getSenderUsername());
        dto.setContent(message.getContent());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setEdited(message.isEdited());
        return dto;
    }
}

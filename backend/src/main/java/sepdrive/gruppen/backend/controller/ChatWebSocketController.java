package sepdrive.gruppen.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import sepdrive.gruppen.backend.dto.ChatMessageRequest;
import sepdrive.gruppen.backend.dto.ChatMessageResponse;
import sepdrive.gruppen.backend.service.ChatService;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageRequest message) {
        ChatMessageResponse response = chatService.sendMessage(message);

        String destination = "/topic/chat." + message.getDriveOfferId();

        messagingTemplate.convertAndSend(destination, response);

        /*
            WebSocket-Zugriff (für Frontend):

            - Senden:
                - STOMP SEND an /app/chat.sendMessage
                - Body (JSON):
                    {
                        "driveOfferId": 42,
                        "senderUsername": "kunde",
                        "content": "Hallo, wann kannst du losfahren?"
                    }
            - Empfangen:
                - STOMP SUBSCRIBE auf /topic/chat.{driveOfferId}
                - Beispiel-Topic: /topic/chat.42
                - Nachricht (JSON):
                    {
                        "id": 123,
                        "senderUsername": "kunde",
                        "content": "Hallo, wann kannst du losfahren?",
                        "createdAt": "2025-07-06T15:23:12.512",
                        "edited": false
                    }
         */
    }
}
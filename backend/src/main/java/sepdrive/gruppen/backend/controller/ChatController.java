package sepdrive.gruppen.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sepdrive.gruppen.backend.dto.ApiResponse;
import sepdrive.gruppen.backend.dto.ChatMessageRequest;
import sepdrive.gruppen.backend.dto.ChatMessageResponse;
import sepdrive.gruppen.backend.service.ChatService;

import java.util.List;

@RestController
@RequestMapping("api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessageResponse> sendMessage(@RequestBody ChatMessageRequest request) {
        ChatMessageResponse response = chatService.sendMessage(request);
        return ResponseEntity.ok(response);
        /*
          - POST auf http://localhost:8080/api/chat/send
          - Zweck:
                Sendet eine neue Chat-Nachricht.
          - Beispiel JSON:
                {
                  "driveOfferId": 42,
                  "senderUsername": "kunde1",
                  "content": "Hallo, wann kannst du losfahren?"
                }
          - Ergebnis:
                {
                  "id": 123,
                  "senderUsername": "kunde1",
                  "content": "Hallo, wann kannst du losfahren?",
                  "createdAt": "2025-07-06T15:23:12.512",
                  "edited": false
                }
        */
    }

    @GetMapping("/{driveOfferId}")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long driveOfferId) {
        List<ChatMessageResponse> messages = chatService.getMessages(driveOfferId);
        return ResponseEntity.ok(messages);
        /*
          - GET auf http://localhost:8080/api/chat/{driveOfferId}
          - Zweck:
                Holt alle Nachrichten des Chats für das angegebene DriveOffer.
          - Ergebnis:
                [
                  {
                    "id": 123,
                    "senderUsername": "kunde1",
                    "content": "Hallo, ich kann fahren!",
                    "createdAt": "2025-07-06T15:23:12.512",
                    "edited": false
                  }
                ]
        */
    }

    @PostMapping("/{driveOfferId}/opened")
    public ResponseEntity<ApiResponse> markChatOpened(@PathVariable Long driveOfferId,
                                                      @RequestParam String role) {
        chatService.markChatOpened(driveOfferId, role);
        return ResponseEntity.ok(new ApiResponse(true, "Chat marked as opened by " + role));
        /*
          - POST auf http://localhost:8080/api/chat/{driveOfferId}/opened?role=kunde
          - Zweck:
                Meldet dem Backend, dass der Kunde oder Fahrer den Chat geöffnet hat.
                Danach kann der andere User seine Nachrichten nicht mehr ändern oder löschen.
          - Ergebnis:
                {
                  "success": true,
                  "message": "Chat marked as opened by kunde"
                }
        */
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse> editMessage(@PathVariable Long messageId,
                                                   @RequestParam String username,
                                                   @RequestParam String newContent) {
        chatService.editMessage(messageId, username, newContent);
        return ResponseEntity.ok(new ApiResponse(true, "Message edited successfully."));
        /*
          - PUT auf http://localhost:8080/api/chat/{messageId}?username=kunde1&newContent=NeuerText
          - Zweck:
                Ändert den Inhalt einer bestehenden Nachricht.
                Funktioniert nur, solange der andere Chatpartner den Chat noch nicht geöffnet hat.
          - Ergebnis:
                {
                  "success": true,
                  "message": "Message edited successfully."
                }
        */
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse> deleteMessage(@PathVariable Long messageId,
                                                     @RequestParam String username) {
        chatService.deleteMessage(messageId, username);
        return ResponseEntity.ok(new ApiResponse(true, "Message deleted successfully."));
        /*
          - DELETE auf http://localhost:8080/api/chat/{messageId}?username=kunde1
          - Zweck:
                Löscht eine bestehende Nachricht.
                Funktioniert nur, solange der andere Chatpartner den Chat noch nicht geöffnet hat.
          - Ergebnis:
                {
                  "success": true,
                  "message": "Message deleted successfully."
                }
        */
    }
}

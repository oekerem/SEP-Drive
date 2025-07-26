package sepdrive.gruppen.backend.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import sepdrive.gruppen.backend.dto.DriveOfferNotificationResponse;

@Service
public class NotificationSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendDriveOfferToKunde(String kundeUsername, DriveOfferNotificationResponse notification) {
        messagingTemplate.convertAndSend("/topic/offer/" + kundeUsername, notification);
    }
}

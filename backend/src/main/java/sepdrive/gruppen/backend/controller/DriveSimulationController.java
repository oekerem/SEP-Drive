package sepdrive.gruppen.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/api/simulation")
@CrossOrigin(origins = "http://localhost:3000")
public class DriveSimulationController {

    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public DriveSimulationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/simulation/{driveId}")
    public void handleSimulationCommand(@DestinationVariable Long driveId,
                                        @Payload Map<String, Object> message) {
        //System.out.println("Received WS message for drive " + driveId + ": " + message);
        messagingTemplate.convertAndSend("/topic/simulation/" + driveId, message);
    }

}

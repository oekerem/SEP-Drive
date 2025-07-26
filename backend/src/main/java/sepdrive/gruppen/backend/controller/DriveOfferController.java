package sepdrive.gruppen.backend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sepdrive.gruppen.backend.dto.DriveOfferRequest;
import sepdrive.gruppen.backend.dto.DriveOfferResponse;
import sepdrive.gruppen.backend.dto.DriveOfferWithDriveResponse;
import sepdrive.gruppen.backend.service.DriveOfferService;
import sepdrive.gruppen.backend.service.DriveService;

import java.util.List;

@RestController
@RequestMapping("api/driveoffer")
@CrossOrigin(origins = "http://localhost:3000")
public class DriveOfferController {

    private final DriveOfferService driveOfferService;
    private final DriveService driveService;

    @Autowired
    public DriveOfferController(DriveOfferService driveOfferService, DriveService driveService) {
        this.driveOfferService = driveOfferService;
        this.driveService = driveService;
    }

    @PostMapping("/create")
    public ResponseEntity<DriveOfferResponse> createOffer(@RequestBody @Valid DriveOfferRequest request) {
        DriveOfferResponse offer = driveOfferService.createDriveOffer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(offer);
        /*
        POST auf folgende URL:
            http://localhost:8080/api/driveoffer/create
        Beispiel JSON:
            {
                "usernameFahrer": "FAHRER",
                "driveId": 1
            }
        */
    }

    @GetMapping("/drive/{driveId}/offers")
    public ResponseEntity<List<DriveOfferResponse>> getOffersForDrive(@PathVariable Long driveId) {
        List<DriveOfferResponse> offers = driveOfferService.getOffersForDrive(driveId);
        return ResponseEntity.ok(offers);
        /*
        GET auf folgende URL:
            http://localhost:8080/api/driveoffer/drive/1/offers
        */
    }

    @PutMapping("/drive/{driveId}/offers/{offerId}/accept")
    public ResponseEntity<DriveOfferResponse> acceptOffer(@PathVariable Long driveId,
                                                          @PathVariable Long offerId) {
        DriveOfferResponse response = driveOfferService.acceptOffer(driveId, offerId);
        return ResponseEntity.ok(response);
        /*
        PUT auf folgende URL:
            http://localhost:8080/api/driveoffer/drive/{driveId}/offers/{offerId}/accept
        */
    }

    @PutMapping("/offers/{offerId}/reject")
    public ResponseEntity<DriveOfferResponse> rejectOffer(@PathVariable Long offerId) {
        DriveOfferResponse response = driveOfferService.rejectOffer(offerId);
        return ResponseEntity.ok(response);
        /*
        PUT auf folgende URL:
            http://localhost:8080/api/driveoffer/offers/{offerId}/reject
        */
    }

    @PutMapping("/offers/{offerId}/withdraw")
    public ResponseEntity<DriveOfferResponse> withdrawOffer(@PathVariable Long offerId,
                                                            @RequestParam String usernameFahrer) {
        DriveOfferResponse response = driveOfferService.withdrawOffer(offerId, usernameFahrer);
        return ResponseEntity.ok(response);
        /*
        ACHTUNG: Hier braucht das Backend ein RequestParam!
        Am Ende der URL muss "?usernameFahrer={username}" angehängt werden.
        PUT auf folgende URL:
            http://localhost:8080/api/driveoffer/offers/{offerId}/withdraw?usernameFahrer=FAHRER
        */
    }

    @GetMapping("{username}")
    public ResponseEntity<DriveOfferResponse> getOffer(@PathVariable String username) {
        DriveOfferResponse response = driveOfferService.getOfferByFahrerUsername(username);
        return ResponseEntity.ok(response);
        /*
        http://localhost:8080/api/driveoffer/{username}
         */
    }

    @GetMapping("{username}/v2")
    public ResponseEntity<DriveOfferWithDriveResponse> getOfferV2(@PathVariable String username) {
        DriveOfferWithDriveResponse response = driveOfferService.getOfferWithDriveByFahrerUsername(username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("{username}/accepted")
    public ResponseEntity<DriveOfferWithDriveResponse> getOfferAccepted(@PathVariable String username) {
        DriveOfferWithDriveResponse response = driveOfferService.getAcceptedOfferWithDriveByFahrerUsername(username);
        return ResponseEntity.ok(response);
    }
}

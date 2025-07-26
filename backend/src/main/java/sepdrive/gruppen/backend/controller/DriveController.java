package sepdrive.gruppen.backend.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sepdrive.gruppen.backend.dto.DriveRequest;
import sepdrive.gruppen.backend.entity.Drive;
import sepdrive.gruppen.backend.entity.Point;
import sepdrive.gruppen.backend.service.DriveService;

import java.util.List;

@RestController
@RequestMapping("api/drives")
@CrossOrigin(origins = "http://localhost:3000")
public class DriveController {

    @Autowired
    private DriveService driveService;

    public DriveController(DriveService driveService) {
        this.driveService = driveService;
    }

    @PostMapping("/create")
    public ResponseEntity<Drive> createDrive(@RequestBody @Valid DriveRequest request) {
        Drive drive = driveService.createRide(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(drive);
            /*
            Wie greife ich auf "createRide" zu?
        Die API ist zu Dev Environment verfügbar unter folgender URL:
                http://localhost:8080/api/drives/create
        Hier musst du einen POST Request an den Endpunkt senden.

        Beispiel einer korrekten JSON Datei:
            {
              "usernameKunde": "tollerUser1",
              "startLocation": "Dortmund",
              "endLocation": "Bochum"
            }
            Ergebnis-> "Status 201 created", also alles gut.

        Potentielle Fehler:
        Internal Server Error, Status 500, IllegalStateException
        Bedeutung: Benutzer hat schon einen Ride, der ACTIVE ist.
     */
    }

    @PutMapping("/cancel/{username}")
    public ResponseEntity<Void> cancelDrive(@PathVariable String username) {
        driveService.cancelRide(username);
        return ResponseEntity.noContent().build();
                    /*
            Wie greife ich auf "cancelDrive" zu?
        Die API ist zu Dev Environment verfügbar unter folgender URL:
                http://localhost:8080/api/drives/cancel/{username}
        Hier musst du einen PUT Request an den Endpunkt senden.
     */
    }

    @GetMapping("/active/{username}")
    public ResponseEntity<Drive> getActiveDriveByUsername(@PathVariable String username) {
        try {
            Drive drive = driveService.getDriveByUsername(username);
            return ResponseEntity.ok(drive);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        /*
        Wie greife ich auf "getActiveDriveByUsername" zu?
        Die API ist zu Dev Environment verfügbar unter folgender URL:
            http://localhost:8080/api/drives/active/{username}
        Hier musst du einen GET Request an den Endpunkt senden.
        */
    }

    @GetMapping("/active/all")
    public ResponseEntity<List<DriveRequest>> getActiveDrives() {
        List<DriveRequest> drives = driveService.getAllOpenDrives();
        return ResponseEntity.ok().body(drives);
    }

    @GetMapping("/history/{username}")
    public ResponseEntity<List<DriveRequest>> getDriveHistory(@PathVariable String username) {
        return ResponseEntity.ok(driveService.getDriveHistory(username));
    }

    @GetMapping("/route/{driveId}")
    public ResponseEntity<List<Point>> getRoute(@PathVariable Long driveId) {
        try {
            List<Point> route = driveService.getRouteForDrive(driveId);
            return ResponseEntity.ok(route);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{driveId}/complete")
    public ResponseEntity<DriveRequest> completeDrive(@PathVariable Long driveId) {
        try {
            DriveRequest updated = driveService.completeDrive(driveId);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
    @PutMapping("/update/{driveId}")
    public ResponseEntity<Boolean> updateDrive(@PathVariable Long driveId,
                                                    @RequestBody @Valid DriveRequest request) {
        if (driveService.updateDrive(driveId, request))
            return ResponseEntity.ok(true);
        else
            return ResponseEntity.notFound().build();
    }
}

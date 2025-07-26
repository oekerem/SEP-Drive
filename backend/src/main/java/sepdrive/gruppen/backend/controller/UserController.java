package sepdrive.gruppen.backend.controller;


import org.springframework.web.bind.annotation.*;
import sepdrive.gruppen.backend.dto.UserLoginRequest;
import sepdrive.gruppen.backend.dto.UserProfileRequest;
import sepdrive.gruppen.backend.dto.UserRegistrationRequest;
import sepdrive.gruppen.backend.entity.User;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import sepdrive.gruppen.backend.service.UserService;

@RestController
@RequestMapping("api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody @Valid UserRegistrationRequest request) {
        userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();

        /*
        Wie greife ich auf "register" zu?
        Die API ist zu Dev Environment verfügbar unter folgender URL:
                http://localhost:8080/api/users/register
        Hier musst du einen POST Request an den Endpunkt senden.

        Beispiel einer korrekten JSON Datei:
            {
                "username":"tollerUser",
                "email":"tollerUser@gmail.com",
                "password":"tollesPasswort",
                "firstName":"Toller",
                "lastName":"User",
                "dob":"2000-12-01",
                "role":"FAHRER"
            }
            Ergebnis-> "Status 201 created", also alles gut.

        Potentielle Fehler:
        Internal Server Error, Status 500, CredentialAllreadyInUseException
        Bedeutung: Username oder Email bereits vergeben. User wurde nicht angelegt.
        */

    }

    @PostMapping("/login")
    public ResponseEntity<User> loginUser(@RequestBody @Valid UserLoginRequest request) {
        User givenUser = userService.loginUser(request);
        return ResponseEntity.ok(givenUser);
        /*
        Wie greife ich auf "login" zu?
        Die API ist zu Dev Environment verfügbar unter folgender URL:
                http://localhost:8080/api/users/login
        Hier musst du einen POST Request an den Endpunkt senden.

        Beispiel einer korrekten JSON Datei:
            {
                "username":"tollerUser",
                "password":"tollesPasswort"
            }
            Ergebnis-> "Status 200 OK", also alles gut.
            Nach aktuellem Stand gibt dies den gesamten User zurück (mitsamt Passwort, was nicht toll ist.)

            Potentielle Fehler:
            Internal Server Error, Status 500, InvalidCredentialsException
            Bedeutung: Falsches Passwort oder Username.
         */
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileRequest> getProfile(@PathVariable String username) {
        UserProfileRequest profile = userService.getProfile(username);
        return ResponseEntity.ok(profile);
        /*
        Wie greife ich auf "getProfile" zu?
        Die API ist zu Dev Environment verfügbar unter folgender URL:
            http://localhost:8080/api/users/profile/{username}
        Hier musst du einen GET Request an den Endpunkt senden.

        Ergebnis:
            {
                "username": "tollerUser",
                "role": "FAHRER",
                "firstName": "Toller",
                "lastName": "User",
                "email": "tollerUser@gmail.com",
                "dob": "2000-12-01",
                "base64Image": null,
                "totalDrives": 0
            }
         */
    }
}
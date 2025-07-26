package sepdrive.gruppen.backend.service;


import sepdrive.gruppen.backend.dto.UserLoginRequest;
import sepdrive.gruppen.backend.dto.UserProfileRequest;
import sepdrive.gruppen.backend.dto.UserRegistrationRequest;
import sepdrive.gruppen.backend.entity.DriveStatus;
import sepdrive.gruppen.backend.entity.User;
import sepdrive.gruppen.backend.exception.CredentialAllreadyInUseException;
import sepdrive.gruppen.backend.exception.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sepdrive.gruppen.backend.repository.DriveRepository;
import sepdrive.gruppen.backend.repository.UserRepository;

import java.util.Base64;

@Service
public class UserService {

    @Autowired
    private WalletService walletService;
    private final UserRepository userRepository;
    private final DriveRepository driveRepository;

    @Autowired
    public UserService(UserRepository userRepository, DriveRepository driveRepository,
                       WalletService walletService) {
        this.userRepository = userRepository;
        this.driveRepository = driveRepository;
        this.walletService = walletService;
    }

    public boolean checkIfEmailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public boolean checkIfUsernameExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public User mapRegistrationRequestToUser(UserRegistrationRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setDob(request.getDob());
        String base64Image = request.getBase64Image();
        if (base64Image != null) {
            byte[] decodedBytes = Base64.getDecoder().decode(base64Image);
            user.setProfileImage(decodedBytes);
        }

        return user;
    }

    public User registerUser(UserRegistrationRequest request) {

        if(checkIfEmailExists(request.getEmail())){
            throw new CredentialAllreadyInUseException("Email is already in use");
        }
        if(checkIfUsernameExists(request.getUsername())){
            throw new CredentialAllreadyInUseException("Username is already in use");
        }
        if(     request.getUsername().isEmpty() ||
                request.getPassword().isEmpty() ||
                request.getEmail().isEmpty() ||
                request.getFirstName().isEmpty() ||
                request.getLastName().isEmpty() ||
                request.getDob() == null ||
                request.getRole() == null
        ){
            throw new IllegalArgumentException("One or more fields are empty");
        }
        User user = mapRegistrationRequestToUser(request);
        userRepository.save(user);

        walletService.createWalletForUser(user);


        return user;
    }

    public User loginUser(UserLoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Username could not be found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new InvalidCredentialsException("Wrong password");
        }
        return user;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("Username not found"));
    }

    public UserProfileRequest getProfile(String username) { // es wird ein dto zurückgeben
        User user = getUserByUsername(username);
        return mapUserToUserProfileRequest(user);
    }

    public UserProfileRequest mapUserToUserProfileRequest(User user) {
        UserProfileRequest userProfile = new UserProfileRequest();
        userProfile.setUsername(user.getUsername());
        userProfile.setFirstName(user.getFirstName());
        userProfile.setLastName(user.getLastName());
        userProfile.setEmail(user.getEmail());
        userProfile.setDob(user.getDob());
        userProfile.setRole(user.getRole());

        if (user.getProfileImage() != null && user.getProfileImage().length > 0) {
            String base64 = Base64
                    .getEncoder()
                    .encodeToString(user.getProfileImage());
            userProfile.setBase64Image(base64);
        }
        long kundeDrives = driveRepository.countByUserKundeAndDriveStatus(user, DriveStatus.COMPLETED);
        long fahrerDrives = driveRepository.countByUserFahrerAndDriveStatus(user, DriveStatus.COMPLETED);
        userProfile.setTotalDrives(kundeDrives + fahrerDrives);
        return userProfile;
    }
}

package sepdrive.gruppen.backend.dto;

import sepdrive.gruppen.backend.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class UserProfileRequest {
    @NotBlank
    private String username;

    @NotNull
    private Role role;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email @NotBlank
    private String email;

    @NotNull
    private LocalDate dob;

    private String base64Image;

    private long totalDrives;


}

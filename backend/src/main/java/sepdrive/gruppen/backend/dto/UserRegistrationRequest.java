package sepdrive.gruppen.backend.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
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
public class UserRegistrationRequest {

    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull
    private LocalDate dob;

    @NotNull
    private Role role;

    private String base64Image;
}

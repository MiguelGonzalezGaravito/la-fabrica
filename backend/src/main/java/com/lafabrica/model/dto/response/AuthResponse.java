package com.lafabrica.model.dto.response;

import com.lafabrica.model.enums.BusinessType;
import com.lafabrica.model.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private BusinessType businessType;
}

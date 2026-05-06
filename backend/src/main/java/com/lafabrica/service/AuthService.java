package com.lafabrica.service;

import com.lafabrica.model.dto.request.LoginRequest;
import com.lafabrica.model.dto.request.RegisterRequest;
import com.lafabrica.model.dto.response.AuthResponse;
import com.lafabrica.model.entity.User;
import com.lafabrica.model.enums.Role;
import com.lafabrica.repository.UserRepository;
import com.lafabrica.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe una cuenta con este email");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .role(Role.CUSTOMER)
                .businessType(request.getBusinessType())
                .build();

        userRepository.save(user);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, Map.of(
                "role", user.getRole(),
                "businessType", user.getBusinessType(),
                "userId", user.getId()
        ));

        return buildAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, Map.of(
                "role", user.getRole(),
                "businessType", user.getBusinessType(),
                "userId", user.getId()
        ));

        return buildAuthResponse(user, token);
    }

    public AuthResponse adminLogin(LoginRequest request) {
        AuthResponse response = login(request);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Acceso no autorizado");
        }
        return response;
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .businessType(user.getBusinessType())
                .build();
    }
}

package com.example.thanhcongvn.service.impl;

import com.example.thanhcongvn.dto.request.login.ChangePasswordRequest;
import com.example.thanhcongvn.dto.request.login.LoginRequest;
import com.example.thanhcongvn.dto.request.login.RegisterRequest;
import com.example.thanhcongvn.dto.request.login.UpdateProfileRequest;
import com.example.thanhcongvn.dto.response.login.AuthResponse;
import com.example.thanhcongvn.entity.AuthToken;
import com.example.thanhcongvn.entity.User;
import com.example.thanhcongvn.entity.enums.TokenType;
import com.example.thanhcongvn.entity.enums.UserRole;
import com.example.thanhcongvn.infrastructure.exception.AppException;
import com.example.thanhcongvn.infrastructure.exception.ErrorCode;
import com.example.thanhcongvn.repository.AuthTokenRepository;
import com.example.thanhcongvn.repository.UserRepository;
import com.example.thanhcongvn.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailService customUserDetailService;
    private final AuthTokenRepository authTokenRepository;
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getFullName())
                .role(UserRole.USER) // mặc định role thường
                .build();

        userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email hoặc mật khẩu không đúng"));

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // kiểm tra JWT có hợp lệ không
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new IllegalArgumentException("Refresh token không hợp lệ");
        }
// kiểm tra token còn tồn tại trong db không
        AuthToken storedToken = authTokenRepository.findByTokenAndTokenType(refreshToken , TokenType.REFRESH)
                .orElseThrow(() -> new IllegalArgumentException("Refresh token không tồn tại hoặc bị thu hồi trong hệ thống"));

        // Kiểm tra thời gian hết hạn của refresh token
        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            authTokenRepository.delete(storedToken); // dọn token hết hạn
            throw new IllegalArgumentException("Refresh token đã hết hạn");
        }
        User user = storedToken.getUser();
        String newAccessToken = jwtService.generateAccessToken(user);
        // cập nhật token mới xóa token cu
       String newRefreshToken = jwtService.generateRefreshToken(user);
       authTokenRepository.delete(storedToken);
       saveRefreshToken(user , newRefreshToken);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    public void saveRefreshToken(User user, String refreshToken) {
        // Xóa refresh token cũ của user này (nếu bạn muốn mỗi user chỉ có 1 refresh token active)
        authTokenRepository.deleteByUser_IdAndTokenType(user.getId(), TokenType.REFRESH);

        AuthToken authToken = AuthToken.builder()
                .user(user)
                .token(refreshToken)
                .tokenType(TokenType.REFRESH)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000))
                .build();

        authTokenRepository.save(authToken);

    }

    @Override
    public void logout(String refreshToken) {
        authTokenRepository.findByTokenAndTokenType(refreshToken, TokenType.REFRESH)
                .ifPresent(authTokenRepository::delete);
    }

    @Override
    @Transactional
    public AuthResponse updateProfile(UpdateProfileRequest request ) {
        User user = getCurrentUser();
        user.setName(request.getFullName());
        user.setDateOfBirth(request.getBirthday());
        user.setGender(request.getGender());
        user.setAvatarUrl(request.getAvatar());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        User savedUser = userRepository.save(user);
        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthResponse getProfile() {
        User user = getCurrentUser();
        return getProfileUser(user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
// Lưu refresh token xuống databse;
        saveRefreshToken(user, refreshToken);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .birthday(user.getDateOfBirth())
                .fullName(user.getName())
                .role(user.getRole().name())
                .build();
    }


    private AuthResponse getProfileUser(User user) {
        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatarUrl())
                .gender(user.getGender())
                .birthday(user.getDateOfBirth())
                .fullName(user.getName())
                .role(user.getRole().name())
                .build();
    }
    private User getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

}

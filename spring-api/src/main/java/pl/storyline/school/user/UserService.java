package pl.storyline.school.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.storyline.school.security.JwtService;

import java.util.Locale;

@Service
public class UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = normalizeUsername(request.username());
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
        }

        AppUser savedUser = userRepository.save(new AppUser(
                username,
                passwordEncoder.encode(request.password())
        ));

        return authResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String username = normalizeUsername(request.username());
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> badCredentials());

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw badCredentials();
        }

        return authResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String username) {
        return userRepository.findByUsername(username)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated"));
    }

    private AuthResponse authResponse(AppUser user) {
        String accessToken = jwtService.generateToken(user.getUsername());
        return AuthResponse.bearer(accessToken, UserResponse.from(user));
    }

    private ResponseStatusException badCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    private String normalizeUsername(String username) {
        return username.strip().toLowerCase(Locale.ROOT);
    }
}

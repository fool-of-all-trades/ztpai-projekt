package pl.storyline.school.user;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        Instant createdAt
) {

    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getCreatedAt());
    }
}

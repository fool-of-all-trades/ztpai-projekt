package pl.storyline.school.story;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StoryUpdateRequest(
        @NotBlank
        @Size(max = 160)
        String title,

        @NotBlank
        @Size(max = 8000)
        String content
) {
}

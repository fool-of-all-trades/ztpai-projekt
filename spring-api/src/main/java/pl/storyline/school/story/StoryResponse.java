package pl.storyline.school.story;

import pl.storyline.school.quote.QuoteResponse;
import pl.storyline.school.user.UserResponse;

import java.time.Instant;
import java.time.LocalDate;

public record StoryResponse(
        Long id,
        String title,
        String content,
        Instant createdAt,
        Instant updatedAt,
        LocalDate promptDate,
        UserResponse author,
        QuoteResponse quote
) {

    public static StoryResponse from(Story story) {
        return new StoryResponse(
                story.getId(),
                story.getTitle(),
                story.getContent(),
                story.getCreatedAt(),
                story.getUpdatedAt(),
                story.getPromptDate(),
                UserResponse.from(story.getAuthor()),
                QuoteResponse.from(story.getQuote())
        );
    }
}

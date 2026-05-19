package pl.storyline.school.storyevent;

public record StoryCreatedEvent(
        Long storyId,
        String username
) {
}

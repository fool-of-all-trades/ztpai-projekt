package pl.storyline.school.storyevent;

import java.time.Instant;

public record StoryEventResponse(
        Long id,
        Long storyId,
        StoryEventType eventType,
        String username,
        Instant createdAt
) {

    public static StoryEventResponse from(StoryEventLog eventLog) {
        return new StoryEventResponse(
                eventLog.getId(),
                eventLog.getStoryId(),
                eventLog.getEventType(),
                eventLog.getUsername(),
                eventLog.getCreatedAt()
        );
    }
}

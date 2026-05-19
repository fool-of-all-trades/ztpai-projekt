package pl.storyline.school.storyevent;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class StoryEventListener {

    private final StoryEventLogRepository eventLogRepository;

    public StoryEventListener(StoryEventLogRepository eventLogRepository) {
        this.eventLogRepository = eventLogRepository;
    }

    @EventListener
    public void onStoryCreated(StoryCreatedEvent event) {
        eventLogRepository.save(new StoryEventLog(
                event.storyId(),
                StoryEventType.CREATED,
                event.username()
        ));
    }
}

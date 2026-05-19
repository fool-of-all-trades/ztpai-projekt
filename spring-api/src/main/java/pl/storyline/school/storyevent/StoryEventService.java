package pl.storyline.school.storyevent;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StoryEventService {

    private final StoryEventLogRepository eventLogRepository;

    public StoryEventService(StoryEventLogRepository eventLogRepository) {
        this.eventLogRepository = eventLogRepository;
    }

    @Transactional(readOnly = true)
    public List<StoryEventResponse> findAll() {
        return eventLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(StoryEventResponse::from)
                .toList();
    }
}

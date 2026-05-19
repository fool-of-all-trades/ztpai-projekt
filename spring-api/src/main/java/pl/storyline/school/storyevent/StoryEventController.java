package pl.storyline.school.storyevent;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/events/stories")
public class StoryEventController {

    private final StoryEventService eventService;

    public StoryEventController(StoryEventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<StoryEventResponse> findAll() {
        return eventService.findAll();
    }
}

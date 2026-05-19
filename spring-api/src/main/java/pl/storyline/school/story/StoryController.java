package pl.storyline.school.story;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping
    public List<StoryResponse> findAll(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String date
    ) {
        return storyService.findAll(query, date);
    }

    @GetMapping("/me")
    public List<StoryResponse> findMine(Authentication authentication) {
        return storyService.findMine(authentication.getName());
    }

    @GetMapping("/{id}")
    public StoryResponse findById(@PathVariable Long id) {
        return storyService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StoryResponse create(
            @Valid @RequestBody StoryCreateRequest request,
            Authentication authentication
    ) {
        return storyService.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public StoryResponse update(
            @PathVariable Long id,
            @Valid @RequestBody StoryUpdateRequest request,
            Authentication authentication
    ) {
        return storyService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        storyService.delete(id, authentication.getName());
    }
}

package pl.storyline.school.story;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.storyline.school.quote.Quote;
import pl.storyline.school.quote.QuoteService;
import pl.storyline.school.storyevent.StoryCreatedEvent;
import pl.storyline.school.user.AppUser;
import pl.storyline.school.user.AppUserRepository;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.List;

@Service
public class StoryService {

    private static final int MAX_CONTENT_WORDS = 500;

    private final StoryRepository storyRepository;
    private final QuoteService quoteService;
    private final AppUserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public StoryService(
            StoryRepository storyRepository,
            QuoteService quoteService,
            AppUserRepository userRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.storyRepository = storyRepository;
        this.quoteService = quoteService;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public List<StoryResponse> findAll(String query, String date) {
        boolean hasQuery = hasText(query);
        boolean hasDate = hasText(date);

        List<Story> stories;
        if (hasDate && hasQuery) {
            stories = storyRepository.searchByPromptDateAndTitleOrContent(parseDate(date), query.strip());
        } else if (hasDate) {
            stories = storyRepository.findByPromptDateOrderByCreatedAtDesc(parseDate(date));
        } else if (hasQuery) {
            stories = storyRepository.searchByTitleOrContent(query.strip());
        } else {
            stories = storyRepository.findAllByOrderByCreatedAtDesc();
        }

        return stories.stream()
                .map(StoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public StoryResponse findById(Long id) {
        return StoryResponse.from(findStory(id));
    }

    @Transactional(readOnly = true)
    public List<StoryResponse> findMine(String username) {
        return storyRepository.findByAuthorUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(StoryResponse::from)
                .toList();
    }

    @Transactional
    public StoryResponse create(StoryCreateRequest request, String username) {
        AppUser author = findUser(username);
        LocalDate promptDate = LocalDate.now();
        Quote quote = quoteService.quoteForDate(promptDate);
        String content = normalizeContent(request.content());
        validateQuoteIncluded(content, quote);
        checkDailyStoryLimit(author, promptDate);

        Story story = new Story(
                request.title().strip(),
                content,
                author,
                quote,
                promptDate
        );

        Story savedStory = storyRepository.save(story);
        eventPublisher.publishEvent(new StoryCreatedEvent(savedStory.getId(), author.getUsername()));

        return StoryResponse.from(savedStory);
    }

    @Transactional
    public StoryResponse update(Long id, StoryUpdateRequest request, String username) {
        Story story = findStory(id);
        checkOwner(story, username);
        String content = normalizeContent(request.content());
        validateQuoteIncluded(content, story.getQuote());

        story.update(
                request.title().strip(),
                content
        );

        return StoryResponse.from(story);
    }

    @Transactional
    public void delete(Long id, String username) {
        Story story = findStory(id);
        checkOwner(story, username);
        storyRepository.delete(story);
    }

    private Story findStory(Long id) {
        return storyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story was not found"));
    }

    private AppUser findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated"));
    }

    private void checkOwner(Story story, String username) {
        if (!story.getAuthor().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the story owner can change this story");
        }
    }

    private void checkDailyStoryLimit(AppUser author, LocalDate promptDate) {
        if (storyRepository.existsByAuthorIdAndPromptDate(author.getId(), promptDate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already published a story for today's quote");
        }
    }

    private void validateQuoteIncluded(String content, Quote quote) {
        if (!normalizeForQuoteMatch(content).contains(normalizeForQuoteMatch(quote.getText()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Story content must include today's quote");
        }
    }

    private String normalizeContent(String content) {
        String normalizedContent = content.strip();
        if (countWords(normalizedContent) > MAX_CONTENT_WORDS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Story content must be 500 words or fewer");
        }
        return normalizedContent;
    }

    private int countWords(String content) {
        if (content.isBlank()) {
            return 0;
        }
        return content.split("\\s+").length;
    }

    private LocalDate parseDate(String date) {
        try {
            return LocalDate.parse(date.strip());
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date must use ISO format: yyyy-MM-dd");
        }
    }

    private String normalizeForQuoteMatch(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}

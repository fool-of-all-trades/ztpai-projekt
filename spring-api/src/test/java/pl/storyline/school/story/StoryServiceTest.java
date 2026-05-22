package pl.storyline.school.story;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import pl.storyline.school.quote.Quote;
import pl.storyline.school.quote.QuoteService;
import pl.storyline.school.storyevent.StoryCreatedEvent;
import pl.storyline.school.user.AppUser;
import pl.storyline.school.user.AppUserRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class StoryServiceTest {

    private StoryRepository storyRepository;
    private QuoteService quoteService;
    private AppUserRepository userRepository;
    private ApplicationEventPublisher eventPublisher;
    private StoryService storyService;

    @BeforeEach
    void setUp() {
        storyRepository = mock(StoryRepository.class);
        quoteService = mock(QuoteService.class);
        userRepository = mock(AppUserRepository.class);
        eventPublisher = mock(ApplicationEventPublisher.class);
        storyService = new StoryService(storyRepository, quoteService, userRepository, eventPublisher);
    }

    @Test
    void createSavesStoryAndPublishesCreatedEvent() {
        AppUser author = user(1L, "alice");
        Quote quote = quote(10L);

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(author));
        when(quoteService.quoteForDate(any(LocalDate.class))).thenReturn(quote);
        when(storyRepository.save(any(Story.class))).thenAnswer(invocation -> {
            Story story = invocation.getArgument(0);
            ReflectionTestUtils.setField(story, "id", 100L);
            ReflectionTestUtils.setField(story, "createdAt", Instant.parse("2026-05-12T10:00:00Z"));
            ReflectionTestUtils.setField(story, "updatedAt", Instant.parse("2026-05-12T10:00:00Z"));
            return story;
        });

        StoryResponse response = storyService.create(
                new StoryCreateRequest("  First Story  ", "  A test quote. Once upon a test.  "),
                "alice"
        );

        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.title()).isEqualTo("First Story");
        assertThat(response.content()).isEqualTo("A test quote. Once upon a test.");
        assertThat(response.author().username()).isEqualTo("alice");
        assertThat(response.quote().id()).isEqualTo(10L);

        verify(eventPublisher).publishEvent(new StoryCreatedEvent(100L, "alice"));
    }

    @Test
    void createRejectsContentWithoutDailyQuote() {
        AppUser author = user(1L, "alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(author));
        when(quoteService.quoteForDate(any(LocalDate.class))).thenReturn(quote(10L));

        assertThatThrownBy(() -> storyService.create(
                new StoryCreateRequest("Missing Quote", "This story avoids the required prompt."),
                "alice"
        ))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verify(storyRepository, never()).save(any(Story.class));
    }

    @Test
    void createRejectsSecondStoryForSamePromptDate() {
        AppUser author = user(1L, "alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(author));
        when(quoteService.quoteForDate(any(LocalDate.class))).thenReturn(quote(10L));
        when(storyRepository.existsByAuthorIdAndPromptDate(any(Long.class), any(LocalDate.class))).thenReturn(true);

        assertThatThrownBy(() -> storyService.create(
                new StoryCreateRequest("Again", "A test quote. Another story for today."),
                "alice"
        ))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        verify(storyRepository, never()).save(any(Story.class));
    }

    @Test
    void findAllFiltersByPromptDate() {
        Story story = story(5L, user(1L, "alice"), quote(10L));
        LocalDate promptDate = LocalDate.parse("2026-05-12");
        when(storyRepository.findByPromptDateOrderByCreatedAtDesc(promptDate)).thenReturn(List.of(story));

        List<StoryResponse> responses = storyService.findAll(null, "2026-05-12");

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().promptDate()).isEqualTo(promptDate);
        verify(storyRepository).findByPromptDateOrderByCreatedAtDesc(promptDate);
    }

    @Test
    void findAllFiltersByPromptDateAndQuery() {
        Story story = story(5L, user(1L, "alice"), quote(10L));
        LocalDate promptDate = LocalDate.parse("2026-05-12");
        when(storyRepository.searchByPromptDateAndTitleOrContent(promptDate, "needle")).thenReturn(List.of(story));

        List<StoryResponse> responses = storyService.findAll("  needle  ", "2026-05-12");

        assertThat(responses).hasSize(1);
        verify(storyRepository).searchByPromptDateAndTitleOrContent(promptDate, "needle");
    }

    @Test
    void findAllRejectsInvalidPromptDate() {
        assertThatThrownBy(() -> storyService.findAll(null, "12-05-2026"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(ex -> ((ResponseStatusException) ex).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        verifyNoInteractions(storyRepository);
    }


}

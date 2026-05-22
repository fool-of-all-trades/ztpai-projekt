package pl.storyline.school.storyevent;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class StoryEventListenerTest {

    @Test
    void onStoryCreatedSavesCreatedEventLog() {
        StoryEventLogRepository repository = mock(StoryEventLogRepository.class);
        StoryEventListener listener = new StoryEventListener(repository);

        listener.onStoryCreated(new StoryCreatedEvent(42L, "alice"));

        ArgumentCaptor<StoryEventLog> captor = ArgumentCaptor.forClass(StoryEventLog.class);
        verify(repository).save(captor.capture());

        StoryEventLog eventLog = captor.getValue();
        assertThat(eventLog.getStoryId()).isEqualTo(42L);
        assertThat(eventLog.getEventType()).isEqualTo(StoryEventType.CREATED);
        assertThat(eventLog.getUsername()).isEqualTo("alice");
    }
}

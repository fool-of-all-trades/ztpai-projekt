package pl.storyline.school.storyevent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoryEventLogRepository extends JpaRepository<StoryEventLog, Long> {

    List<StoryEventLog> findAllByOrderByCreatedAtDesc();
}

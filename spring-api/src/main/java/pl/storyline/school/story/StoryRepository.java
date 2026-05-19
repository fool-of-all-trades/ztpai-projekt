package pl.storyline.school.story;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StoryRepository extends JpaRepository<Story, Long> {

    @Override
    @EntityGraph(attributePaths = {"author", "quote"})
    Optional<Story> findById(Long id);

    @EntityGraph(attributePaths = {"author", "quote"})
    List<Story> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"author", "quote"})
    List<Story> findByPromptDateOrderByCreatedAtDesc(LocalDate promptDate);

    @EntityGraph(attributePaths = {"author", "quote"})
    List<Story> findByAuthorUsernameOrderByCreatedAtDesc(String username);

    boolean existsByAuthorIdAndPromptDate(Long authorId, LocalDate promptDate);

    @EntityGraph(attributePaths = {"author", "quote"})
    Optional<Story> findByIdAndAuthorUsername(Long id, String username);

    @EntityGraph(attributePaths = {"author", "quote"})
    @Query("""
            select story from Story story
            where lower(story.title) like lower(concat('%', :query, '%'))
               or lower(story.content) like lower(concat('%', :query, '%'))
            order by story.createdAt desc
            """)
    List<Story> searchByTitleOrContent(@Param("query") String query);

    @EntityGraph(attributePaths = {"author", "quote"})
    @Query("""
            select story from Story story
            where story.promptDate = :promptDate
              and (
                    lower(story.title) like lower(concat('%', :query, '%'))
                 or lower(story.content) like lower(concat('%', :query, '%'))
              )
            order by story.createdAt desc
            """)
    List<Story> searchByPromptDateAndTitleOrContent(
            @Param("promptDate") LocalDate promptDate,
            @Param("query") String query
    );
}

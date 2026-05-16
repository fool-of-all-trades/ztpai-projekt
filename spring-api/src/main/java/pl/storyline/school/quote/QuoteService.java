package pl.storyline.school.quote;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class QuoteService {

    private static final LocalDate QUOTE_ROTATION_START = LocalDate.of(2025, 1, 1);

    private final QuoteRepository quoteRepository;

    public QuoteService(QuoteRepository quoteRepository) {
        this.quoteRepository = quoteRepository;
    }

    @Transactional(readOnly = true)
    public List<QuoteResponse> findAll() {
        return quoteRepository.findAllByOrderByAuthorAscTextAsc()
                .stream()
                .map(QuoteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuoteResponse random() {
        return today(null);
    }

    @Transactional(readOnly = true)
    public QuoteResponse today(String date) {
        return QuoteResponse.from(quoteForDate(parseDate(date)));
    }

    @Transactional(readOnly = true)
    public Quote todayQuote() {
        return quoteForDate(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public Quote quoteForDate(LocalDate targetDate) {
        List<Quote> quotes = quoteRepository.findAllByOrderByIdAsc();

        if (quotes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No quotes are available");
        }

        long days = ChronoUnit.DAYS.between(QUOTE_ROTATION_START, targetDate);
        int index = Math.floorMod(days, quotes.size());

        return quotes.get(index);
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank() || "today".equalsIgnoreCase(date.strip())) {
            return LocalDate.now();
        }

        try {
            return LocalDate.parse(date.strip());
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date must use YYYY-MM-DD format");
        }
    }
}

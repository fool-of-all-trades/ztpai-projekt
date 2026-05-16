package pl.storyline.school.quote;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @GetMapping
    public List<QuoteResponse> findAll() {
        return quoteService.findAll();
    }

    @GetMapping("/random")
    public QuoteResponse random() {
        return quoteService.random();
    }

    @GetMapping("/today")
    public QuoteResponse today(@RequestParam(required = false) String date) {
        return quoteService.today(date);
    }
}

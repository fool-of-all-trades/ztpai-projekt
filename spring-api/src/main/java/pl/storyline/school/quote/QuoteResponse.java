package pl.storyline.school.quote;

public record QuoteResponse(
        Long id,
        String text,
        String author,
        String source
) {

    public static QuoteResponse from(Quote quote) {
        return new QuoteResponse(
                quote.getId(),
                quote.getText(),
                quote.getAuthor(),
                quote.getSource()
        );
    }
}

export default function QuoteSection({ quote }) {
  return (
    <section className="quote-section">
      <p className="quote-text">"{quote.text}"</p>
      <span className="quote-author">— {quote.author}</span>
    </section>
  );
}

export default function NotesPage({ notes, onAddNote, onDeleteNote }) {
  return (
    <div id="section-notes" className="page-section active">
      <header className="section-header">
        <h3 className="section-title">Nápady a poznámky</h3>
        <button className="btn-primary-small" onClick={onAddNote}>
          + Nový
        </button>
      </header>

      <div className="notes-grid">
        {notes.length === 0 ? (
          <p style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginTop: '40px'
          }}>
            Zatím žádné nápady.
          </p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-card">
              <div className="note-content">{note.content}</div>
              <div className="note-footer">
                <span className="note-date">{note.date}</span>
                <button
                  className="delete-note"
                  onClick={() => onDeleteNote(note.id)}
                >
                  Smazat
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

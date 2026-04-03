import { useState, useMemo } from 'react';

export default function NotesPage({ notes, onAddNote, onDeleteNote }) {
  const [activeTab, setActiveTab] = useState('Obecné');

  const uniqueSections = useMemo(() => {
    const sections = ['Obecné'];
    notes.forEach(n => {
      if (n.section && !sections.includes(n.section)) {
        sections.push(n.section);
      }
    });
    return sections;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => (n.section || 'Obecné') === activeTab);
  }, [notes, activeTab]);

  return (
    <div id="section-notes" className="page-section active">
      <header className="section-header">
        <h3 className="section-title">Zápisník</h3>
        <button className="btn-primary-small" onClick={onAddNote}>
          + Nový
        </button>
      </header>

      {/* Tabs pro sekce */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px', paddingLeft: '2px' }}>
        {uniqueSections.map(sec => (
          <button 
            key={sec}
            onClick={() => setActiveTab(sec)}
            className={`tab-item ${activeTab === sec ? 'active' : ''}`}
            style={{ whiteSpace: 'nowrap', padding: '8px 16px', flex: '0 0 auto' }}
          >
            {sec}
          </button>
        ))}
      </div>

      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <p style={{
            gridColumn: '1/-1',
            textAlign: 'center',
            color: 'var(--text-muted)',
            marginTop: '40px'
          }}>
            V této sekci zatím nejsou žádné záznamky.
          </p>
        ) : (
          filteredNotes.map(note => (
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

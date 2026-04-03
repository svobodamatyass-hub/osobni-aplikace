import { useState, useEffect, useRef } from 'react';

export default function NoteModal({ isOpen, onClose, onSave, existingSections = [] }) {
  const [text, setText] = useState('');
  const [section, setSection] = useState('Obecné');
  const [isNewSection, setIsNewSection] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      // Keep section as last selected unless we want to reset it
      // setSection('Obecné');
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  function handleSave() {
    const content = text.trim();
    if (content) {
      onSave(content, section.trim() || 'Obecné');
      onClose();
    }
  }

  return (
    <div className={`note-input-container ${isOpen ? 'active' : ''}`}>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sekce:</span>
        {isNewSection ? (
          <input 
            type="text" 
            value={section} 
            onChange={e => setSection(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
            placeholder="Nová sekce..."
          />
        ) : (
          <select 
            value={section} 
            onChange={e => {
              if (e.target.value === 'NEW') {
                setIsNewSection(true);
                setSection('');
              } else {
                setSection(e.target.value);
              }
            }}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
          >
            {existingSections.includes('Obecné') ? null : <option value="Obecné">Obecné</option>}
            {existingSections.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="NEW">+ Vytvořit novou sekci</option>
          </select>
        )}
        {isNewSection && (
          <button 
            onClick={() => { setIsNewSection(false); setSection('Obecné'); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px' }}
          >×</button>
        )}
      </div>

      <textarea
        className="note-text"
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Zapiš si svůj nápad..."
      />
      <div className="note-actions">
        <button className="btn-cancel" onClick={onClose}>
          Zrušit
        </button>
        <button className="btn-save" onClick={handleSave}>
          Uložit nápad
        </button>
      </div>
    </div>
  );
}

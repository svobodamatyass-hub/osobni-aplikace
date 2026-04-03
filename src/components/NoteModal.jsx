import { useState, useEffect, useRef } from 'react';

export default function NoteModal({ isOpen, onClose, onSave }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  function handleSave() {
    const content = text.trim();
    if (content) {
      onSave(content);
      onClose();
    }
  }

  return (
    <div className={`note-input-container ${isOpen ? 'active' : ''}`}>
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

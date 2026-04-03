export default function ActionSheet({ isOpen, onClose, onChoosePriority, onChooseNote }) {
  return (
    <div className={`action-sheet ${isOpen ? 'active' : ''}`}>
      <h4 className="sheet-title">Co chceš vytvořit?</h4>
      <div className="action-options">
        <button className="action-btn" onClick={onChoosePriority}>
          <span className="action-icon">🎯</span>
          <span className="action-text">Nová Priorita</span>
        </button>
        <button className="action-btn" onClick={onChooseNote}>
          <span className="action-icon">💡</span>
          <span className="action-text">Zapsat Nápad</span>
        </button>
      </div>
      <button className="btn-cancel-sheet" onClick={onClose}>
        Zrušit
      </button>
    </div>
  );
}

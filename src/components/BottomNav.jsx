export default function BottomNav({ currentView, onNavigate, onAdd }) {
  return (
    <nav className="app-nav">
      <button
        className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
        onClick={() => onNavigate('home')}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Domů</span>
      </button>

      <button
        className={`nav-item ${currentView === 'notes' ? 'active' : ''}`}
        onClick={() => onNavigate('notes')}
      >
        <span className="nav-icon">📝</span>
        <span className="nav-label">Zápisník</span>
      </button>

      <button className="nav-item fab" onClick={onAdd}>
        <span className="nav-icon">+</span>
      </button>

      <button 
        className={`nav-item ${currentView === 'timer' ? 'active' : ''}`} 
        onClick={() => onNavigate('timer')}
      >
        <span className="nav-icon">⌛</span>
        <span className="nav-label">Časovač</span>
      </button>

      <button className="nav-item" onClick={() => {}}>
        <span className="nav-icon">⚙️</span>
        <span className="nav-label">Nastavení</span>
      </button>
    </nav>
  );
}

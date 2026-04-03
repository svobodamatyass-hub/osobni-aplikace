import { useState, useEffect, useRef } from 'react';
import { PROGRESS_LABELS } from '../constants';

const playRhythmicSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playBeep = (time, frequency, duration) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, time);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.5, time + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, time + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(time);
      oscillator.stop(time + duration);
    };
    const now = audioCtx.currentTime;
    // Rytmická melodie: Ding (0s), Ding (0.6s), Ding-Ding (1.2s - 1.5s)
    playBeep(now, 523.25, 0.4); 
    playBeep(now + 0.6, 523.25, 0.4); 
    playBeep(now + 1.2, 523.25, 0.2); 
    playBeep(now + 1.5, 659.25, 0.6); 
  } catch (e) {
    console.warn('AudioContext není podporován nebo byl zablokován', e);
  }
};

export default function TimerPage() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('deep'); // 'deep' or 'light'
  const timerRef = useRef(null);

  // Constants for visual ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const initialTotalSeconds = minutes * 60;
  const currentTotalSeconds = minutes * 60 + seconds;
  const percentage = Math.max(0, Math.min(100, Math.round(((minutes * 60 + seconds) / (initialTotalSeconds || 1)) * 100)));
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            if (minutes === 0) {
              clearInterval(timerRef.current);
              setIsActive(false);
              playRhythmicSound();
              if (Notification.permission === 'granted') {
                new Notification('Časovač vypršel!', {
                  body: mode === 'deep' ? 'Hluboká práce dokončena.' : 'Lehká práce dokončena.',
                });
              }
              return 0;
            }
            setMinutes((prevMin) => prevMin - 1);
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, minutes]);

  const toggleTimer = () => {
    if (!isActive && typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'deep' ? 45 : 25);
    setSeconds(0);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setMinutes(newMode === 'deep' ? 45 : 25);
    setSeconds(0);
  };

  const adjustMinutes = (amount) => {
    if (isActive) return;
    setMinutes((prev) => Math.max(1, prev + amount));
    setSeconds(0);
  };

  return (
    <div className="page-section active">
      <header className="section-header">
        <h3 className="section-title">Soustředění</h3>
      </header>

      {/* Mode Selector */}
      <div className="timeframe-tabs" style={{ marginBottom: '32px' }}>
        <button 
          className={`tab-item ${mode === 'deep' ? 'active' : ''}`}
          onClick={() => handleModeChange('deep')}
        >
          Deep Work
        </button>
        <button 
          className={`tab-item ${mode === 'light' ? 'active' : ''}`}
          onClick={() => handleModeChange('light')}
        >
          Light Work
        </button>
      </div>

      {/* Timer Visual */}
      <section className="progress-section card-glass" style={{ flexDirection: 'column', gap: '24px', padding: '40px 24px' }}>
        <div className="progress-visual" style={{ width: '180px', height: '180px' }}>
          <svg className="progress-ring" width="180" height="180">
            <circle
              className="progress-ring__circle-bg"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
              fill="transparent"
              r="80"
              cx="90"
              cy="90"
            />
            <circle
              className="progress-ring__circle"
              stroke={mode === 'deep' ? 'url(#deep-gradient)' : 'url(#light-gradient)'}
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={(2 * Math.PI * 80) - (percentage / 100) * (2 * Math.PI * 80)}
              strokeLinecap="round"
              fill="transparent"
              r="80"
              cx="90"
              cy="90"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="deep-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF416C" />
                <stop offset="100%" stopColor="#FF4B2B" />
              </linearGradient>
              <linearGradient id="light-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00B4DB" />
                <stop offset="100%" stopColor="#0083B0" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '42px', fontWeight: '700', margin: 0 }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {mode === 'deep' ? 'Hluboká práce' : 'Lehká práce'}
            </p>
          </div>
        </div>

        {/* Custom Logic Note: 
            Tato sekce bude v budoucnu omezovat přístup k Instagramu a notifikacím.
            Při Deep Work módu budou notifikace zcela potlačeny.
        */}

        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          <button 
            className="btn-save" 
            onClick={toggleTimer}
            style={{ 
              background: isActive ? 'rgba(255,255,255,0.1)' : (mode === 'deep' ? 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)' : 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)'),
              boxShadow: isActive ? 'none' : (mode === 'deep' ? '0 6px 20px rgba(255, 65, 108, 0.3)' : '0 6px 20px rgba(0, 180, 219, 0.3)')
            }}
          >
            {isActive ? 'Pozastavit' : 'Spustit'}
          </button>
          <button className="btn-cancel" onClick={resetTimer}>Reset</button>
        </div>
      </section>

      {/* Adjuster */}
      {!isActive && (
        <div className="card-glass" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="section-label">Nastavení minut</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="day-dot-btn" onClick={() => adjustMinutes(-5)}>-5</button>
            <span style={{ fontSize: '20px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>{minutes}</span>
            <button className="day-dot-btn" onClick={() => adjustMinutes(5)}>+5</button>
          </div>
        </div>
      )}

      {/* Blocking concept visualization */}
      <div style={{ marginTop: '24px', opacity: mode === 'deep' ? 1 : 0.4, transition: 'opacity 0.3s' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic', padding: '0 10px' }}>
          {mode === 'deep' 
            ? '🔒 Deep work zapne režim nerušit. Pokud budeš mít telefonát, bude zvonit, ale nebudou chodit žádné notifikace.' 
            : '🔔 Light Work: Budou povoleny důležité notifikace pro běžnou práci.'}
        </p>
      </div>
    </div>
  );
}

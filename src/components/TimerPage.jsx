import { useState, useEffect, useRef } from 'react';
import { PROGRESS_LABELS } from '../constants';

const playRhythmicSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playBeep = (time, frequency, duration, volume = 0.5) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, time);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(volume, time + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, time + duration);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(time);
      oscillator.stop(time + duration);
    };
    const now = audioCtx.currentTime;
    playBeep(now, 523.25, 0.4); 
    playBeep(now + 0.6, 523.25, 0.4); 
    playBeep(now + 1.2, 523.25, 0.2); 
    playBeep(now + 1.5, 659.25, 0.6); 
  } catch (e) {}
};

const playTickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {}
};

function WheelPicker({ value, min, max, onChange, label }) {
  const itemHeight = 45;
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  // Trojitý seznam pro efekt nekonečného kolečka
  const infiniteRange = [...range, ...range, ...range];
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Inicializace na střední sadu čísel
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = (range.length + value - min) * itemHeight;
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollY = containerRef.current.scrollTop;
    const centerOffset = range.length * itemHeight;
    
    // "Nekonečná" logika: pokud jsme moc nahoře nebo dole, skočíme doprostřed
    if (scrollY < centerOffset - (itemHeight * 2)) {
      containerRef.current.scrollTop = scrollY + centerOffset;
    } else if (scrollY > centerOffset * 2) {
      containerRef.current.scrollTop = scrollY - centerOffset;
    }

    const index = Math.round(containerRef.current.scrollTop / itemHeight) % range.length;
    const newValue = range[index];
    
    if (newValue !== value) {
      onChange(newValue);
      playTickSound();
      if (window.navigator.vibrate) window.navigator.vibrate(5);
    }
  };

  return (
    <div className="wheel-picker-container">
      <div className="wheel-picker-label">{label}</div>
      <div className="wheel-picker-view" ref={containerRef} onScroll={handleScroll}>
        <div className="wheel-picker-spacer" style={{ height: itemHeight }} />
        {infiniteRange.map((num, idx) => (
          <div 
            key={`${num}-${idx}`} 
            className={`wheel-item ${value === num ? 'active' : ''}`}
            style={{ height: itemHeight, lineHeight: `${itemHeight}px` }}
          >
            {String(num).padStart(2, '0')}
          </div>
        ))}
        <div className="wheel-picker-spacer" style={{ height: itemHeight }} />
      </div>
      <div className="wheel-picker-selection-overlay" style={{ height: itemHeight, top: itemHeight }} />
    </div>
  );
}

export default function TimerPage() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(45);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('deep'); // 'deep' or 'light'
  const [totalSecondsAtStart, setTotalSecondsAtStart] = useState(45 * 60);
  const timerRef = useRef(null);

  // Constants for visual ring
  const currentTotalSeconds = hours * 3600 + minutes * 60 + seconds;
  const percentage = totalSecondsAtStart === 0 ? 0 : Math.max(0, Math.min(100, Math.round((currentTotalSeconds / totalSecondsAtStart) * 100)));

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s > 0) return s - 1;
          
          setMinutes((m) => {
            if (m > 0) {
              setSeconds(59);
              return m - 1;
            }
            
            setHours((h) => {
              if (h > 0) {
                setMinutes(59);
                setSeconds(59);
                return h - 1;
              }
              
              // End reached
              clearInterval(timerRef.current);
              setIsActive(false);
              playRhythmicSound();
              if (Notification.permission === 'granted') {
                new Notification('Časovač vypršel!', {
                  body: mode === 'deep' ? 'Hluboká práce dokončena.' : 'Lehká práce dokončena.',
                });
              }
              return 0;
            });
            return 0;
          });
          return 0;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, mode]);

  const toggleTimer = () => {
    if (!isActive) {
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      setTotalSecondsAtStart(hours * 3600 + minutes * 60 + seconds);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'deep') {
      setHours(0); setMinutes(45); setSeconds(0);
    } else {
      setHours(0); setMinutes(25); setSeconds(0);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'deep') {
      setHours(0); setMinutes(45); setSeconds(0);
    } else {
      setHours(0); setMinutes(25); setSeconds(0);
    }
  };

  const updateTime = (type, val) => {
    if (isActive) return;
    const v = parseInt(val) || 0;
    if (type === 'h') setHours(Math.max(0, Math.min(23, v)));
    if (type === 'm') setMinutes(Math.max(0, Math.min(59, v)));
    if (type === 's') setSeconds(Math.max(0, Math.min(59, v)));
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
            <h2 style={{ fontSize: '36px', fontWeight: '700', margin: 0 }}>
              {hours > 0 ? `${String(hours).padStart(2, '0')}:` : ''}{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {mode === 'deep' ? 'Hluboká práce' : 'Lehká práce'}
            </p>
          </div>
        </div>

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

      {/* Manual Adjuster Wheel Picker */}
      {!isActive && (
        <div className="card-glass" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <span className="section-label" style={{ marginBottom: '8px' }}>Nastavení času</span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', width: '100%' }}>
            <WheelPicker label="HOD" value={hours} min={0} max={23} onChange={(v) => updateTime('h', v)} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', paddingTop: '55px', color: 'rgba(255,255,255,0.2)' }}>:</div>
            <WheelPicker label="MIN" value={minutes} min={0} max={59} onChange={(v) => updateTime('m', v)} />
            <div style={{ fontSize: '24px', fontWeight: 'bold', paddingTop: '55px', color: 'rgba(255,255,255,0.2)' }}>:</div>
            <WheelPicker label="SEK" value={seconds} min={0} max={59} onChange={(v) => updateTime('s', v)} />
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

import { PROGRESS_LABELS } from '../constants';

export default function ProgressCard({ percentage, total, completed, timeframe }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  let subtext;
  if (total === 0) {
    subtext = 'Žádné úkoly k plnění';
  } else if (total === completed) {
    subtext = 'Všechny cíle splněny! 🔥';
  } else {
    const rem = total - completed;
    subtext = `Zbývá ${rem} úkol${rem > 1 ? 'ů' : ''} k dosažení limitu`;
  }

  return (
    <section className="progress-section card-glass">
      <div className="progress-info">
        <span className="section-label">{PROGRESS_LABELS[timeframe]}</span>
        <h2 className="progress-percentage">{percentage}%</h2>
        <p className="progress-subtext">{subtext}</p>
      </div>
      <div className="progress-visual">
        <svg className="progress-ring" width="100" height="100">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8E2DE2" />
              <stop offset="100%" stopColor="#4A00E0" />
            </linearGradient>
          </defs>
          <circle
            className="progress-ring__circle-bg"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          <circle
            className="progress-ring__circle"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
        </svg>
      </div>
    </section>
  );
}

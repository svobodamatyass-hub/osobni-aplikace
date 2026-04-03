export default function TimeframeTabs({ currentTimeframe, onChange }) {
  const tabs = [
    { key: 'day', label: 'Dnes' },
    { key: 'week', label: 'Týden' },
    { key: 'month', label: 'Měsíc' },
  ];

  return (
    <div className="timeframe-tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`tab-item ${currentTimeframe === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

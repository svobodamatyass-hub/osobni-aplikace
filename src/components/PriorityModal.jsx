import { useState, useEffect, useRef } from 'react';

function CustomSelect({ options, value, onChange, id }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`custom-select ${isOpen ? 'open' : ''}`} id={id} ref={ref}>
      <div
        className="select-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {selectedOption?.label || ''}
      </div>
      <div className="select-dropdown">
        {options.map(option => (
          <div
            key={option.value}
            className={`select-option ${value === option.value ? 'selected' : ''}`}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PriorityModal({
  isOpen,
  onClose,
  onSave,
  currentTimeframe,
}) {
  const [taskName, setTaskName] = useState('');
  const [timeframe, setTimeframe] = useState(currentTimeframe);
  const [category, setCategory] = useState('discipline');
  const [recurringDays, setRecurringDays] = useState([]);
  const inputRef = useRef(null);

  const timeframeOptions = [
    { value: 'day', label: 'Dnešní' },
    { value: 'week', label: 'Týdenní' },
    { value: 'month', label: 'Měsíční' },
  ];

  const categoryOptions = [
    { value: 'discipline', label: '⚡ Vůle' },
    { value: 'work', label: '💼 Práce' },
    { value: 'health', label: '🧘 Zdraví' },
    { value: 'personal', label: '👤 Osobní' },
  ];

  const dayButtons = [
    { day: 1, label: 'Po' },
    { day: 2, label: 'Út' },
    { day: 3, label: 'St' },
    { day: 4, label: 'Čt' },
    { day: 5, label: 'Pá' },
    { day: 6, label: 'So' },
    { day: 0, label: 'Ne' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeframe(currentTimeframe);
      setCategory('discipline');
      setTaskName('');
      setRecurringDays([]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, currentTimeframe]);

  function toggleDay(day) {
    setRecurringDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  function handleSave() {
    const name = taskName.trim();
    if (name) {
      onSave(name, timeframe, category, recurringDays);
      onClose();
    }
  }

  return (
    <div className={`priority-modal card-glass ${isOpen ? 'active' : ''}`}>
      <h3 className="modal-title">Nová Priorita</h3>

      <div className="form-group">
        <label>Název úkolu</label>
        <input
          type="text"
          ref={inputRef}
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Např. Cvičení 30min"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Časový rámec</label>
          <CustomSelect
            id="select-timeframe"
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
          />
        </div>
        <div className="form-group">
          <label>Kategorie</label>
          <CustomSelect
            id="select-category"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '20px' }}>
        <label>Opakování (každý týden)</label>
        <div className="recurring-days-grid">
          {dayButtons.map(({ day, label }) => (
            <button
              key={day}
              className={`day-dot-btn ${recurringDays.includes(day) ? 'active' : ''}`}
              onClick={() => toggleDay(day)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn-cancel-modal" onClick={onClose}>
          Zrušit
        </button>
        <button className="btn-save-priority" onClick={handleSave}>
          Uložit
        </button>
      </div>
    </div>
  );
}

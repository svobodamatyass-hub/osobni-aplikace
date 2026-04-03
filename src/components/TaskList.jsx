import { useState } from 'react';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../constants';

export default function TaskList({ tasks, selectedDate, onToggle, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);

  const categoryIcons = CATEGORY_ICONS;

  function isTaskCompletedOnDate(task, date) {
    if (!task.completions) return task.completed;
    const dateStr = date.toISOString().split('T')[0];
    return task.completions.includes(dateStr);
  }

  function handleDelete(id) {
    if (confirm('Opravdu smazat tuto prioritu?')) {
      setDeletingId(id);
      setTimeout(() => {
        onDelete(id);
        setDeletingId(null);
      }, 300);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>Žádné priority.</p>
        <p>Klikni na + a přidej svou první!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => {
        const isCompleted = isTaskCompletedOnDate(task, selectedDate);
        const icon = categoryIcons[task.category] || '🎯';

        return (
          <div
            key={task.id}
            className={`task-item card-glass ${isCompleted ? 'completed' : ''} ${deletingId === task.id ? 'deleting' : ''}`}
            onClick={(e) => {
              if (e.target.closest('.delete-task-btn')) return;
              onToggle(task.id);
            }}
          >
            <div className="task-category-icon">{icon}</div>
            <div className="task-details">
              <span className="task-name">{task.name}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span className={`task-tag tag-${task.category}`}>
                  {CATEGORY_LABELS[task.category] || task.category}
                </span>
                {task.recurringDays && (
                  <span style={{ fontSize: '10px', color: 'var(--accent-color)' }}>🔄 Opakování</span>
                )}
              </div>
            </div>
            <div className="task-status">
              <div className={`checkbox ${isCompleted ? 'checked' : ''}`}></div>
            </div>
            <button
              className="delete-task-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task.id);
              }}
              title="Smazat"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

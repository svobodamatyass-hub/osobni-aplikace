import { useState, useMemo, useEffect, useCallback } from 'react';
import { QUOTES, TIMEFRAME_TITLES } from './constants';
import * as api from './api';

import ProgressCard from './components/ProgressCard';
import TimeframeTabs from './components/TimeframeTabs';
import DaySelector from './components/DaySelector';
import TaskList from './components/TaskList';
import QuoteSection from './components/QuoteSection';
import NotesPage from './components/NotesPage';
import BottomNav from './components/BottomNav';
import ActionSheet from './components/ActionSheet';
import PriorityModal from './components/PriorityModal';
import NoteModal from './components/NoteModal';
import TimerPage from './components/TimerPage';

// Pick a random quote once on load
const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

function App() {
  // --- STATE ---
  const [currentView, setCurrentView] = useState('home');
  const [currentTimeframe, setCurrentTimeframe] = useState('day');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // Modal states
  const [showOverlay, setShowOverlay] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Data from server
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LOAD DATA FROM SERVER ---
  const loadData = useCallback(async () => {
    try {
      const [tasksData, notesData] = await Promise.all([
        api.fetchTasks(),
        api.fetchNotes(),
      ]);
      setTasks(tasksData);
      setNotes(notesData);
    } catch (err) {
      console.error('Chyba při načítání dat:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- TASK FILTERING ---
  const filteredTasks = useMemo(() => {
    if (currentTimeframe === 'day') {
      return tasks.filter(t => {
        if (t.timeframe !== 'day') return false;
        if (t.date) {
          const tDate = new Date(t.date);
          tDate.setHours(0, 0, 0, 0);
          return tDate.getTime() === selectedDate.getTime();
        }
        if (t.recurringDays) {
          return t.recurringDays.includes(selectedDate.getDay());
        }
        return false;
      });
    }
    return tasks.filter(t => t.timeframe === currentTimeframe);
  }, [tasks, currentTimeframe, selectedDate]);

  // --- PROGRESS CALCULATION ---
  const { percentage, total, completed } = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => {
      if (!t.completions) return t.completed;
      const dateStr = selectedDate.toISOString().split('T')[0];
      return t.completions.includes(dateStr);
    }).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { percentage, total, completed };
  }, [filteredTasks, selectedDate]);

  // --- TASK TITLE ---
  const tasksTitle = useMemo(() => {
    if (currentTimeframe !== 'day') {
      return TIMEFRAME_TITLES[currentTimeframe];
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate.getTime() === today.getTime()) {
      return 'Dnešní priority';
    }
    return `Priority pro ${selectedDate.getDate()}.${selectedDate.getMonth() + 1}.`;
  }, [currentTimeframe, selectedDate]);

  // --- STREAK ---
  const streak = useMemo(() => {
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const dayTasks = tasks.filter(t => {
        if (t.timeframe !== 'day') return false;
        if (t.date) {
          const tDate = new Date(t.date);
          tDate.setHours(0, 0, 0, 0);
          return tDate.getTime() === checkDate.getTime();
        }
        if (t.recurringDays) {
          return t.recurringDays.includes(checkDate.getDay());
        }
        return false;
      });

      if (dayTasks.length === 0) {
        if (i === 0) continue;
        break;
      }

      const allCompleted = dayTasks.every(t => {
        if (!t.completions) return t.completed;
        const dateStr = checkDate.toISOString().split('T')[0];
        return t.completions.includes(dateStr);
      });

      if (allCompleted) {
        count++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return count;
  }, [tasks]);

  // --- HANDLERS ---
  function hideAllModals() {
    setShowOverlay(false);
    setShowActionSheet(false);
    setShowPriorityModal(false);
    setShowNoteModal(false);
  }

  function handleOpenActionSheet() {
    setShowOverlay(true);
    setShowActionSheet(true);
  }

  function handleChoosePriority() {
    setShowActionSheet(false);
    setShowPriorityModal(true);
  }

  function handleChooseNote() {
    setShowActionSheet(false);
    setShowNoteModal(true);
  }

  async function handleSavePriority(name, timeframe, category, recurringDays) {
    const taskDate = (timeframe === 'day' && recurringDays.length === 0)
      ? selectedDate.toISOString()
      : null;

    try {
      const newTask = await api.createTask({
        name,
        timeframe,
        category,
        date: taskDate,
        recurringDays: recurringDays.length > 0 ? [...recurringDays] : null,
      });
      setTasks(prev => [newTask, ...prev]);
      hideAllModals();

      if (currentTimeframe !== timeframe) {
        setCurrentTimeframe(timeframe);
      }
    } catch (err) {
      console.error('Chyba při ukládání úkolu:', err);
    }
  }

  async function handleToggleTask(id) {
    const dateStr = selectedDate.toISOString().split('T')[0];
    try {
      const updatedTask = await api.toggleTaskCompletion(id, dateStr);
      setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
    } catch (err) {
      console.error('Chyba při přepínání úkolu:', err);
    }
  }

  async function handleDeleteTask(id) {
    try {
      await api.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Chyba při mazání úkolu:', err);
    }
  }

  async function handleSaveNote(content) {
    try {
      const newNote = await api.createNote(content);
      setNotes(prev => [newNote, ...prev]);
      hideAllModals();
      setCurrentView('notes');
    } catch (err) {
      console.error('Chyba při ukládání poznámky:', err);
    }
  }

  async function handleDeleteNote(id) {
    try {
      await api.deleteNoteApi(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Chyba při mazání poznámky:', err);
    }
  }

  function handleTimeframeChange(tf) {
    setCurrentTimeframe(tf);
  }

  function handleSelectDate(date) {
    setSelectedDate(date);
  }

  function handleAddNoteFromPage() {
    setShowOverlay(true);
    setShowNoteModal(true);
  }

  if (loading) {
    return (
      <div className="app-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '18px',
        color: 'var(--text-secondary)',
      }}>
        Načítání...
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="user-greeting">
          <span className="greeting-text">Ahoj Maty,</span>
          <h1 className="welcome-title">Dnešní Disciplína</h1>
        </div>
        <div className="user-profile">
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {/* Home Section */}
        {currentView === 'home' && (
          <div className="page-section active">
            <ProgressCard
              percentage={percentage}
              total={total}
              completed={completed}
              timeframe={currentTimeframe}
            />

            <TimeframeTabs
              currentTimeframe={currentTimeframe}
              onChange={handleTimeframeChange}
            />

            {currentTimeframe === 'day' && (
              <DaySelector
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            )}

            <section className="tasks-section">
              <div className="section-header">
                <h3 className="section-title">{tasksTitle}</h3>
              </div>
              <TaskList
                tasks={filteredTasks}
                selectedDate={selectedDate}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            </section>

            <QuoteSection quote={randomQuote} />
          </div>
        )}

        {/* Notes Section */}
        {currentView === 'notes' && (
          <NotesPage
            notes={notes}
            onAddNote={handleAddNoteFromPage}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {/* Timer Section */}
        {currentView === 'timer' && (
          <TimerPage />
        )}
      </main>

      {/* Modals */}
      <div
        className={`modal-overlay ${showOverlay ? 'active' : ''}`}
        onClick={hideAllModals}
      />

      <ActionSheet
        isOpen={showActionSheet}
        onClose={hideAllModals}
        onChoosePriority={handleChoosePriority}
        onChooseNote={handleChooseNote}
      />

      <PriorityModal
        isOpen={showPriorityModal}
        onClose={hideAllModals}
        onSave={handleSavePriority}
        currentTimeframe={currentTimeframe}
      />

      <NoteModal
        isOpen={showNoteModal}
        onClose={hideAllModals}
        onSave={handleSaveNote}
      />

      {/* Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onAdd={handleOpenActionSheet}
      />
    </div>
  );
}

export default App;

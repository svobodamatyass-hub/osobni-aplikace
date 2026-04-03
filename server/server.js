const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
function initDataFile(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}
initDataFile(TASKS_FILE);
initDataFile(NOTES_FILE);

// Helper: read/write JSON
function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Middleware
app.use(cors());
app.use(express.json());

// --- LOG ---
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('cs-CZ')}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// TASKS API
// ============================================

// GET all tasks
app.get('/api/tasks', (req, res) => {
  const tasks = readJSON(TASKS_FILE);
  res.json(tasks);
});

// POST new task
app.post('/api/tasks', (req, res) => {
  const tasks = readJSON(TASKS_FILE);
  const { name, timeframe, category, date, recurringDays } = req.body;

  if (!name || !timeframe || !category) {
    return res.status(400).json({ error: 'Název, časový rámec a kategorie jsou povinné.' });
  }

  const newTask = {
    id: Date.now(),
    name,
    timeframe,
    category,
    date: date || null,
    recurringDays: recurringDays || null,
    completed: false,
    completions: [],
    created: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  writeJSON(TASKS_FILE, tasks);
  res.status(201).json(newTask);
});

// PATCH toggle task completion for a specific date
app.patch('/api/tasks/:id/toggle', (req, res) => {
  const tasks = readJSON(TASKS_FILE);
  const id = parseInt(req.params.id);
  const { dateStr } = req.body; // e.g. "2026-04-03"

  if (!dateStr) {
    return res.status(400).json({ error: 'dateStr je povinný.' });
  }

  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Úkol nenalezen.' });
  }

  const task = tasks[taskIndex];
  if (!task.completions) task.completions = [];

  if (task.completions.includes(dateStr)) {
    task.completions = task.completions.filter(d => d !== dateStr);
    task.completed = false;
  } else {
    task.completions.push(dateStr);
    task.completed = true;
  }

  tasks[taskIndex] = task;
  writeJSON(TASKS_FILE, tasks);
  res.json(task);
});

// DELETE task
app.delete('/api/tasks/:id', (req, res) => {
  let tasks = readJSON(TASKS_FILE);
  const id = parseInt(req.params.id);

  const exists = tasks.some(t => t.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Úkol nenalezen.' });
  }

  tasks = tasks.filter(t => t.id !== id);
  writeJSON(TASKS_FILE, tasks);
  res.json({ success: true });
});

// ============================================
// NOTES API
// ============================================

// GET all notes
app.get('/api/notes', (req, res) => {
  const notes = readJSON(NOTES_FILE);
  res.json(notes);
});

// POST new note
app.post('/api/notes', (req, res) => {
  const notes = readJSON(NOTES_FILE);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Obsah poznámky je povinný.' });
  }

  const newNote = {
    id: Date.now(),
    content,
    date: new Date().toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }),
    created: new Date().toISOString(),
  };

  notes.unshift(newNote);
  writeJSON(NOTES_FILE, notes);
  res.status(201).json(newNote);
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
  let notes = readJSON(NOTES_FILE);
  const id = parseInt(req.params.id);

  const exists = notes.some(n => n.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'Poznámka nenalezena.' });
  }

  notes = notes.filter(n => n.id !== id);
  writeJSON(NOTES_FILE, notes);
  res.json({ success: true });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`\n🚀 Matyho Discipline API server běží na http://localhost:${PORT}`);
  console.log(`   📋 Tasks:  http://localhost:${PORT}/api/tasks`);
  console.log(`   📝 Notes:  http://localhost:${PORT}/api/notes\n`);
});

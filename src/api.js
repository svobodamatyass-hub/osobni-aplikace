const API_BASE = 'http://localhost:3001/api';

// --- TASKS ---

export async function fetchTasks() {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('Nepodařilo se načíst úkoly');
  return res.json();
}

export async function createTask({ name, timeframe, category, date, recurringDays }) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, timeframe, category, date, recurringDays }),
  });
  if (!res.ok) throw new Error('Nepodařilo se vytvořit úkol');
  return res.json();
}

export async function toggleTaskCompletion(id, dateStr) {
  const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dateStr }),
  });
  if (!res.ok) throw new Error('Nepodařilo se přepnout stav úkolu');
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Nepodařilo se smazat úkol');
  return res.json();
}

// --- NOTES ---

export async function fetchNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  if (!res.ok) throw new Error('Nepodařilo se načíst poznámky');
  return res.json();
}

export async function createNote({ content, section }) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, section }),
  });
  if (!res.ok) throw new Error('Nepodařilo se vytvořit poznámku');
  return res.json();
}

export async function deleteNoteApi(id) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Nepodařilo se smazat poznámku');
  return res.json();
}

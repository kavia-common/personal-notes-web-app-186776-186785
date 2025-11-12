import { generateId } from "../utils/id";
import { getStorageProvider } from "./storageService";

// PUBLIC_INTERFACE
export async function listNotes() {
  /** Returns all notes sorted by updatedAt desc. */
  const provider = getStorageProvider();
  const notes = await provider.list();
  return notes.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

// PUBLIC_INTERFACE
export async function createNote(partial = {}) {
  /**
   * Create a new note with defaults and persist.
   * Returns the created note.
   */
  const now = Date.now();
  const base = {
    id: generateId(),
    title: partial.title || "Untitled",
    content: partial.content || "",
    createdAt: now,
    updatedAt: now,
  };
  const provider = getStorageProvider();
  const list = await provider.list();
  list.unshift(base);
  await provider.saveAll(list);
  return base;
}

// PUBLIC_INTERFACE
export async function updateNote(id, patch) {
  /**
   * Update a note by id, persist changes, and return updated note.
   */
  const provider = getStorageProvider();
  const list = await provider.list();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  const now = Date.now();
  const updated = { ...list[idx], ...patch, updatedAt: now };
  list[idx] = updated;
  await provider.saveAll(list);
  return updated;
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /**
   * Delete note by id and persist.
   * Returns true if deleted.
   */
  const provider = getStorageProvider();
  const list = await provider.list();
  const next = list.filter((n) => n.id !== id);
  await provider.saveAll(next);
  return next.length !== list.length;
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  /** Get a single note by id. */
  const provider = getStorageProvider();
  const list = await provider.list();
  return list.find((n) => n.id === id) || null;
}

// PUBLIC_INTERFACE
export async function searchNotes(query) {
  /**
   * Returns notes filtered by substring in title or content (case-insensitive).
   */
  const q = (query || "").trim().toLowerCase();
  const notes = await listNotes();
  if (!q) return notes;
  return notes.filter((n) => {
    return (
      (n.title || "").toLowerCase().includes(q) ||
      (n.content || "").toLowerCase().includes(q)
    );
  });
}

import React, { useMemo } from "react";
import { useNotesActions, useNotesState } from "../context/NotesContext";

// PUBLIC_INTERFACE
export default function NotesList() {
  /** Sidebar list of notes, with search, add new, and delete. */
  const { notes, selectedId, search } = useNotesState();
  const { createNote, selectNote, deleteNote, setSearch } = useNotesActions();

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => (n.title || "").toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q));
  }, [notes, search]);

  return (
    <>
      <div className="sidebar-actions">
        <button className="btn primary" onClick={() => createNote()} aria-label="Add note">
          + New Note
        </button>
      </div>
      <div className="searchbar">
        <input
          className="input"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="notes-list" role="list" aria-label="Notes">
        {filtered.map((n) => (
          <div
            key={n.id}
            role="listitem"
            className={`note-item ${selectedId === n.id ? "active" : ""}`}
            onClick={() => selectNote(n.id)}
          >
            <div>
              <h4 className="note-title">{n.title || "Untitled"}</h4>
              <p className="note-preview">{(n.content || "").replace(/\n/g, " ").slice(0, 80)}</p>
              <div className="note-meta">
                {new Date(n.updatedAt || n.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <button
                className="btn danger"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Delete this note?")) {
                    deleteNote(n.id);
                  }
                }}
                aria-label="Delete note"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: 12 }}>
            <div>
              <div className="badge"><span className="dot" />No results</div>
              <p>Try a different search term or create a new note.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

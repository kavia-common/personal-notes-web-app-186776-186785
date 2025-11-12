import React, { useEffect, useMemo, useState } from "react";
import { useNotesActions, useNotesState } from "../context/NotesContext";
import { debounce } from "../utils/debounce";

// PUBLIC_INTERFACE
export default function NoteEditor() {
  /** Main editor view for the selected note with autosave. */
  const { notes, selectedId } = useNotesState();
  const { updateNote } = useNotesActions();

  const note = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  useEffect(() => {
    setTitle(note?.title || "");
    setContent(note?.content || "");
  }, [note?.id]);

  const saveTitle = useMemo(
    () =>
      debounce((val) => {
        if (note?.id) updateNote(note.id, { title: val });
      }, 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note?.id]
  );

  const saveContent = useMemo(
    () =>
      debounce((val) => {
        if (note?.id) updateNote(note.id, { content: val });
      }, 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [note?.id]
  );

  if (!note) {
    return null;
  }

  return (
    <>
      <div className="editor-header">
        <input
          className="title-input"
          placeholder="Note title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            saveTitle(e.target.value);
          }}
        />
        <div className="badge" title="Autosave enabled">
          <span className="dot" />
          Autosave
        </div>
      </div>
      <div className="editor-area">
        <textarea
          className="textarea"
          placeholder="Write your note here..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            saveContent(e.target.value);
          }}
        />
      </div>
    </>
  );
}

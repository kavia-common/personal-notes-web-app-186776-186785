import React from "react";
import "./theme.css";
import AppShell from "./components/AppShell";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import EmptyState from "./components/EmptyState";
import { NotesProvider, useNotesActions, useNotesState } from "./context/NotesContext";
import { getStorageInfo } from "./services/storageService";

// Internal view that decides between EmptyState and Editor
function MainView() {
  const { notes, selectedId } = useNotesState();
  const { createNote } = useNotesActions();

  if (!notes.length) {
    return <EmptyState onCreate={createNote} />;
  }

  if (!selectedId) {
    return <EmptyState onCreate={createNote} />;
  }

  return <NoteEditor />;
}

// PUBLIC_INTERFACE
function App() {
  /** Root app component wiring provider, layout, and views. */
  const StorageBadge = (
    <div className="badge" title="Current data storage mode">
      <span className="dot" />
      {getStorageInfo()}
    </div>
  );

  return (
    <NotesProvider>
      <AppShell headerRight={StorageBadge} sidebar={<NotesList />}>
        <MainView />
      </AppShell>
    </NotesProvider>
  );
}

export default App;

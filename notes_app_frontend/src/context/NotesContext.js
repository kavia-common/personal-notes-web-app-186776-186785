import React, { createContext, useContext, useEffect, useReducer } from "react";
import { listNotes, createNote as svcCreate, updateNote as svcUpdate, deleteNote as svcDelete } from "../services/notesService";

const NotesStateContext = createContext(null);
const NotesDispatchContext = createContext(null);

const initialState = {
  notes: [],
  selectedId: null,
  loading: true,
  search: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "set_notes":
      return { ...state, notes: action.notes, loading: false };
    case "select":
      return { ...state, selectedId: action.id };
    case "search":
      return { ...state, search: action.value };
    case "add": {
      return { ...state, notes: [action.note, ...state.notes], selectedId: action.note.id };
    }
    case "update": {
      const notes = state.notes.map((n) => (n.id === action.note.id ? action.note : n));
      return { ...state, notes };
    }
    case "delete": {
      const notes = state.notes.filter((n) => n.id !== action.id);
      const selectedId = state.selectedId === action.id ? (notes[0]?.id || null) : state.selectedId;
      return { ...state, notes, selectedId };
    }
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function NotesProvider({ children }) {
  /** Provides notes state and actions via context. */
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const all = await listNotes();
      dispatch({ type: "set_notes", notes: all });
      if (all.length && !state.selectedId) {
        dispatch({ type: "select", id: all[0].id });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = {
    // PUBLIC_INTERFACE
    async createNote() {
      const note = await svcCreate();
      dispatch({ type: "add", note });
      return note;
    },
    // PUBLIC_INTERFACE
    selectNote(id) {
      dispatch({ type: "select", id });
    },
    // PUBLIC_INTERFACE
    async updateNote(id, patch) {
      const updated = await svcUpdate(id, patch);
      if (updated) dispatch({ type: "update", note: updated });
      return updated;
    },
    // PUBLIC_INTERFACE
    async deleteNote(id) {
      const ok = await svcDelete(id);
      if (ok) dispatch({ type: "delete", id });
      return ok;
    },
    // PUBLIC_INTERFACE
    setSearch(value) {
      dispatch({ type: "search", value });
    },
  };

  return (
    <NotesStateContext.Provider value={state}>
      <NotesDispatchContext.Provider value={actions}>
        {children}
      </NotesDispatchContext.Provider>
    </NotesStateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useNotesState() {
  /** Hook to access notes state. */
  const ctx = useContext(NotesStateContext);
  if (!ctx) throw new Error("useNotesState must be used within NotesProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function useNotesActions() {
  /** Hook to access notes actions. */
  const ctx = useContext(NotesDispatchContext);
  if (!ctx) throw new Error("useNotesActions must be used within NotesProvider");
  return ctx;
}

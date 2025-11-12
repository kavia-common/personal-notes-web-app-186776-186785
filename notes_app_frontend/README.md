# Ocean Notes - React Frontend

A modern, minimalist notes UI built with React. It features a responsive layout with a sidebar (search, list, create) and a main editor with autosave, styled using the Ocean Professional theme.

## Features

- Create, list, edit (autosave), and delete notes
- Search/filter by title and content
- Responsive layout with sidebar and editor area
- Ocean Professional style: primary #2563EB, amber highlights #F59E0B, error #EF4444
- LocalStorage persistence by default
- Supabase-ready storage abstraction (no crashes when env vars missing)

## Getting Started

In the project directory:
- `npm start` to run the app on http://localhost:3000
- `npm test` to run tests
- `npm run build` to build for production

## Storage Abstraction and Supabase

By default, the app uses localStorage via the storage abstraction defined in:
- `src/services/storageService.js`
- `src/services/notesService.js`

To switch to Supabase later:
1. Provide the following environment variables in `.env`:
   - `REACT_APP_SUPABASE_URL=...`
   - `REACT_APP_SUPABASE_KEY=...`
2. Replace the placeholder implementations inside `supabaseProvider` in `storageService.js` with real Supabase client calls.
   - TODOs are marked in that file to guide integration.
3. The UI will show a badge indicating the current storage mode (Local Storage or Supabase placeholder).

The app gracefully falls back to local storage if the Supabase env vars are not present.

## Code Structure

- `src/theme.css` — Ocean Professional theme styles
- `src/context/NotesContext.js` — lightweight state management with reducer
- `src/services/*` — storage abstraction and note CRUD logic
- `src/components/*` — AppShell, NotesList, NoteEditor, EmptyState
- `src/utils/*` — id generation and debounce

No additional configuration is required; the app runs on port 3000 by default.

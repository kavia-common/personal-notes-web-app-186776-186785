# Ocean Notes - React Frontend

A modern, minimalist notes UI built with React. It features a responsive layout with a sidebar (search, list, create) and a main editor with autosave, styled using the Ocean Professional theme.

## Features

- Create, list, edit (autosave), and delete notes
- Search/filter by title and content
- Responsive layout with sidebar and editor area
- Ocean Professional style: primary #2563EB, amber highlights #F59E0B, error #EF4444
- LocalStorage persistence by default
- Supabase-backed storage when env vars are present (with graceful fallback)

## Getting Started

In the project directory:
- `npm start` to run the app on http://localhost:3000
- `npm test` to run tests
- `npm run build` to build for production

## Storage Abstraction and Supabase

By default, the app uses localStorage via the storage abstraction defined in:
- `src/services/storageService.js`
- `src/services/notesService.js`

When the following environment variables exist, the app automatically switches to Supabase:
- `REACT_APP_SUPABASE_URL=...`
- `REACT_APP_SUPABASE_KEY=...`

Note: For compatibility, if `SUPABASE_URL` and `SUPABASE_KEY` are set, they are also read, but `REACT_APP_*` take precedence.

### Supabase Table Schema

Create a `notes` table with the following columns:
- `id` uuid primary key (you may allow client-provided uuids)
- `title` text
- `content` text
- `created_at` timestamp with time zone default now()
- `updated_at` timestamp with time zone

SQL example:

```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
```

Optionally, keep `id` without default if you want to strictly rely on client-provided IDs.

### Row Level Security (RLS)

For a simple, unauthenticated demo, you can disable RLS:

```sql
alter table public.notes disable row level security;
```

If you want authenticated, per-user notes:
- Enable RLS:
  ```sql
  alter table public.notes enable row level security;
  ```
- Add a `user_id uuid` column default `auth.uid()` and create policies restricting access to `user_id = auth.uid()`.
- Ensure the client uses a user session (sign-in) so `auth.uid()` is available.

### How it works

- The storage provider dynamically loads `@supabase/supabase-js` when env vars are present.
- CRUD operations target the `notes` table and adapt DB timestamps to the app’s `updatedAt/createdAt` fields.
- If the Supabase client fails to load or any request errors, the app logs the error and gracefully falls back to localStorage for that operation.
- The header badge shows “Supabase” when active, otherwise “Local Storage”.

The app gracefully falls back to local storage if the Supabase env vars are not present.

## Code Structure

- `src/theme.css` — Ocean Professional theme styles
- `src/context/NotesContext.js` — lightweight state management with reducer
- `src/services/*` — storage abstraction and note CRUD logic
- `src/components/*` — AppShell, NotesList, NoteEditor, EmptyState
- `src/utils/*` — id generation and debounce

No additional configuration is required; the app runs on port 3000 by default.

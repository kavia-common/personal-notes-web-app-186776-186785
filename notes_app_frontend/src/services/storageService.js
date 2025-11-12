const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

// PUBLIC_INTERFACE
export function getStorageProvider() {
  /**
   * Returns the active storage provider.
   * If Supabase env vars are present, returns a Supabase placeholder provider (no-op but API-compatible).
   * Otherwise returns localStorage provider.
   */
  return isSupabaseConfigured ? supabaseProvider : localProvider;
}

// PUBLIC_INTERFACE
export const localProvider = {
  /** Local storage CRUD implementation for notes. */
  async list() {
    const raw = localStorage.getItem("notes:data");
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  },
  async saveAll(notes) {
    localStorage.setItem("notes:data", JSON.stringify(notes));
    return true;
  },
};

// PUBLIC_INTERFACE
export const supabaseProvider = {
  /**
   * Placeholder Supabase provider.
   * TODO: Replace with real Supabase client calls when configured.
   * For now, it uses localStorage to ensure the app remains fully usable without backend.
   */
  async list() {
    // Placeholder: keep local behavior to prevent crashes during early setup.
    const raw = localStorage.getItem("notes:data");
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  },
  async saveAll(notes) {
    // Placeholder: mirror local storage to persist while Supabase is not wired.
    localStorage.setItem("notes:data", JSON.stringify(notes));
    return true;
  },
};

// PUBLIC_INTERFACE
export function getStorageInfo() {
  /** Returns a short descriptor of current storage mode for UI/diagnostics. */
  return isSupabaseConfigured ? "Supabase (placeholder)" : "Local Storage";
}

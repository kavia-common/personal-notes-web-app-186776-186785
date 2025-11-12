/**
 * Storage Service
 * - Provides a storage provider abstraction.
 * - If Supabase env vars are present, uses Supabase CRUD against 'notes' table.
 * - Otherwise falls back to localStorage.
 * - Includes graceful error handling and never throws to UI.
 */

// Env variable mapping: prefer REACT_APP_* then fallback to non-prefixed if present.
const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  undefined;
const SUPABASE_KEY =
  process.env.REACT_APP_SUPABASE_KEY ||
  process.env.SUPABASE_KEY ||
  undefined;

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Lazy module reference to avoid bundling issues when env missing
let supabaseClient = null;

/**
 * Create or get a singleton Supabase client instance.
 * We dynamically import '@supabase/supabase-js' only if env is present.
 */
async function getSupabase() {
  if (!isSupabaseConfigured) return null;
  if (supabaseClient) return supabaseClient;

  try {
    const mod = await import('@supabase/supabase-js');
    supabaseClient = mod.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    // If package is missing or dynamic import fails, disable supabase usage
    console.error('Supabase client load failed; falling back to local storage:', err);
    return null;
  }
}

// PUBLIC_INTERFACE
export function getStorageProvider() {
  /**
   * Returns the active storage provider.
   * If Supabase env vars are present and client loads, returns Supabase provider.
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

// Shape adapters: DB uses updated_at timestamp; UI/services expect updatedAt/createdAt numbers.
function toAppNote(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title || "",
    content: row.content || "",
    // If timestamps are strings, convert to ms for consistent UI sorting
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
  };
}

function toDbPatch(patch) {
  const out = {};
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.content !== undefined) out.content = patch.content;
  // updated_at set server-side with now() through RPC or default trigger; we also set client-side timestamp for immediate consistency if allowed
  out.updated_at = new Date().toISOString();
  return out;
}

// PUBLIC_INTERFACE
export const supabaseProvider = {
  /**
   * Supabase provider using table 'notes':
   * Columns: id (uuid pk), title (text), content (text), updated_at (timestamp), created_at (timestamp default now()).
   */
  async list() {
    const sb = await getSupabase();
    if (!sb) return localProvider.list();

    try {
      const { data, error } = await sb
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(toAppNote);
    } catch (err) {
      console.error('Supabase list failed; falling back to local storage:', err);
      return localProvider.list();
    }
  },

  // Optional direct create used by notesService if present
  async create(note) {
    const sb = await getSupabase();
    if (!sb) return null;
    try {
      const row = {
        id: note.id,
        title: note.title || '',
        content: note.content || '',
        updated_at: new Date(note.updatedAt || Date.now()).toISOString(),
      };
      const { data, error } = await sb.from('notes').insert(row).select('*').single();
      if (error) throw error;
      return toAppNote(data);
    } catch (err) {
      console.error('Supabase create failed:', err);
      return null;
    }
  },

  // Optional direct update used by notesService if present
  async update(id, patch) {
    const sb = await getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb
        .from('notes')
        .update(toDbPatch(patch))
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return toAppNote(data);
    } catch (err) {
      console.error('Supabase update failed:', err);
      return null;
    }
  },

  // Optional direct remove used by notesService if present
  async remove(id) {
    const sb = await getSupabase();
    if (!sb) return false;
    try {
      const { error } = await sb.from('notes').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase delete failed:', err);
      return false;
    }
  },

  /**
   * saveAll: synchronize the entire list.
   * For simplicity, we upsert all provided notes and delete those not present.
   * This is only used by notesService today for create/update/delete flows.
   */
  async saveAll(notes) {
    const sb = await getSupabase();
    if (!sb) {
      return localProvider.saveAll(notes);
    }

    try {
      // 1) Upsert provided rows
      const rows = (notes || []).map((n) => ({
        id: n.id, // string id (we generate client id; DB column is uuid - Supabase can coerce)
        title: n.title || '',
        content: n.content || '',
        updated_at: n.updatedAt ? new Date(n.updatedAt).toISOString() : new Date().toISOString(),
        // created_at: optional; DB can default
      }));

      if (rows.length > 0) {
        const { error: upsertErr } = await sb.from('notes').upsert(rows, { onConflict: 'id' });
        if (upsertErr) throw upsertErr;
      }

      // 2) Delete rows in DB not present in provided list
      const { data: existing, error: listErr } = await sb.from('notes').select('id');
      if (listErr) throw listErr;

      const incomingIds = new Set((notes || []).map((n) => n.id));
      const toDelete = (existing || []).map(r => r.id).filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        const { error: delErr } = await sb.from('notes').delete().in('id', toDelete);
        if (delErr) throw delErr;
      }

      return true;
    } catch (err) {
      console.error('Supabase saveAll failed; falling back to local storage:', err);
      return localProvider.saveAll(notes);
    }
  },
};

// PUBLIC_INTERFACE
export function getStorageInfo() {
  /** Returns a short descriptor of current storage mode for UI/diagnostics. */
  return isSupabaseConfigured ? "Supabase" : "Local Storage";
}

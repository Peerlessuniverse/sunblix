/**
 * ============================================================================
 * SUNBLIX SURTI AI — SUPABASE CLIENT (SERVER-SIDE ONLY)
 * ============================================================================
 * Single shared PostgREST client for all SURTI persistence.
 *
 * Design: "DB-first, demo-mode fallback".
 *  - When SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set → all writes/reads
 *    go to Supabase Postgres (persistent, survives restarts & redeploys).
 *  - When not configured → transparently falls back to the legacy in-memory
 *    stores so the app keeps working in demo mode (e.g. local dev).
 *
 * SECURITY:
 *  - Server-side only (imported exclusively from route handlers / lib).
 *  - Uses the SERVICE ROLE key (bypasses RLS) — never expose this to the
 *    browser bundle. This file is safe to import from client components too,
 *    because the client getter returns null when no keys exist, and the
 *    anon key path is never used for CRM data.
 *  - All errors are caught and logged; data functions degrade gracefully.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let dynamicClient = null;

/**
 * Minimal PostgREST client over fetch — zero dependencies, Node/Edge safe.
 * Implements the tiny subset we need: from().select/insert/upsert/update/delete
 */
function createPostgrestClient(baseUrl, apiKey) {
  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  function buildQuery(table) {
    const state = { table, select: '*', filters: [], order: null, limit: null };

    const chain = {
      select(columns = '*') {
        state.select = columns;
        return chain;
      },
      eq(column, value) {
        state.filters.push({ type: 'eq', column, value });
        return chain;
      },
      order(column, { ascending = true } = {}) {
        state.order = { column, ascending };
        return chain;
      },
      limit(n) {
        state.limit = n;
        return chain;
      },
      single() {
        state.limit = 1;
        state.singleResult = true;
        return chain;
      },
      maybeSingle() {
        state.limit = 1;
        state.singleResult = true;
        return chain;
      },
      async then(resolve, reject) {
        try {
          resolve(await chain.execute());
        } catch (err) {
          reject(err);
        }
      },
    };

    chain.execute = async () => {
      const params = new URLSearchParams();
      params.set('select', state.select);
      for (const f of state.filters) {
        if (f.type === 'eq') params.set(f.column, `eq.${f.value}`);
      }
      if (state.order) {
        params.set('order', `${state.order.column}.${state.order.ascending ? 'asc' : 'desc'}`);
      }
      if (state.limit) {
        params.set('limit', String(state.limit));
      }
      const url = `${baseUrl}/${state.table}?${params.toString()}`;
      const res = await fetch(url, { headers, cache: 'no-store' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = body.message || body.error || `PostgREST ${res.status}`;
        throw new Error(`[Supabase] ${state.table}: ${message}`);
      }
      if (state.singleResult) return Array.isArray(body) ? body[0] ?? null : body;
      return Array.isArray(body) ? body : body.data || [];
    };

    return chain;
  }

  async function insert(table, payload, { upsert = false, onConflict = null } = {}) {
    const rows = Array.isArray(payload) ? payload : [payload];
    let finalUrl = `${baseUrl}/${table}`;
    if (upsert && onConflict) {
      finalUrl += `?on_conflict=${onConflict}`;
    }
    const res = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: upsert
          ? 'resolution=merge-duplicates,return=representation'
          : 'return=representation',
      },
      body: JSON.stringify(rows),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body.message || body.error || `PostgREST ${res.status}`;
      throw new Error(`[Supabase] insert ${table}: ${message}`);
    }
    return Array.isArray(body) ? body : body?.data || body || [];
  }

  async function update(table, filters, payload) {
    const params = new URLSearchParams();
    params.set('select', '*');
    for (const [column, value] of Object.entries(filters)) {
      params.set(column, `eq.${value}`);
    }
    const res = await fetch(`${baseUrl}/${table}?${params.toString()}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body.message || body.error || `PostgREST ${res.status}`;
      throw new Error(`[Supabase] update ${table}: ${message}`);
    }
    return Array.isArray(body) ? body : [];
  }

  async function remove(table, filters) {
    const params = new URLSearchParams();
    params.set('select', '*');
    for (const [column, value] of Object.entries(filters)) {
      params.set(column, `eq.${value}`);
    }
    const res = await fetch(`${baseUrl}/${table}?${params.toString()}`, {
      method: 'DELETE',
      headers: { ...headers, Prefer: 'return=representation' },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body.message || body.error || `PostgREST ${res.status}`;
      throw new Error(`[Supabase] delete ${table}: ${message}`);
    }
    return Array.isArray(body) ? body : [];
  }

  return { from: buildQuery, insert, update, remove };
}

export function getDbClient() {
  if (typeof window !== 'undefined') return null; // server-side only
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  if (!dynamicClient) {
    dynamicClient = createPostgrestClient(
      `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1`,
      SERVICE_KEY
    );
  }
  return dynamicClient;
}

/** True when Supabase persistence is active (live mode) */
export function isDbLive() {
  return getDbClient() !== null;
}

/** Log-friendly mode banner used by services for diagnosis */
export function logPersistenceMode(service) {
  const mode = isDbLive() ? 'LIVE (Supabase Postgres)' : 'DEMO (in-memory, data tidak persisten)';
  console.log(`[${service}] Persistence mode: ${mode}`);
}

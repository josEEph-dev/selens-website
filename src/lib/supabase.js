import { supabase } from './supabaseClient'

export { supabase }
export const isSupabaseConfigured = true

// Default sort for each table (only columns that really exist).
const DEFAULT_ORDER = {
  people: [{ column: 'display_order', ascending: true }],
  faqs: [{ column: 'display_order', ascending: true }],
  news_posts: [{ column: 'published_at', ascending: false }],
  topnotchers: [{ column: 'rank', ascending: true, nullsFirst: false }],
  awards: [{ column: 'date_awarded', ascending: false, nullsFirst: false }],
  accomplishments: [
    { column: 'accomplished_on', ascending: false, nullsFirst: false },
    { column: 'created_at', ascending: false },
  ],
  projects: [{ column: 'created_at', ascending: false }],
  document_requests: [{ column: 'requested_at', ascending: false }],
  teechpoints_ledger: [{ column: 'created_at', ascending: false }],
}
const FALLBACK_ORDER = [{ column: 'created_at', ascending: false }]

// Columns each table can be sorted by. Anything else falls back to the default.
const ORDERABLE = {
  people: ['display_order', 'full_name', 'position', 'created_at'],
  faqs: ['display_order', 'question', 'created_at'],
  news_posts: ['published_at', 'title', 'created_at'],
  topnotchers: ['rank', 'exam_year', 'full_name', 'created_at'],
  awards: ['date_awarded', 'title', 'created_at'],
  accomplishments: ['accomplished_on', 'title', 'created_at'],
  projects: ['created_at', 'name', 'portal_order'],
  document_requests: ['requested_at', 'created_at'],
  teechpoints_ledger: ['created_at'],
}

/**
 * Universal Data Access Layer backed by the real Supabase client (src/lib/supabaseClient.js).
 * list(table, { filter, orderBy, ascending })
 *  - orderBy omitted  -> the table's default order
 *  - orderBy null     -> no ordering
 *  - orderBy invalid for the table (e.g. display_order on news_posts) -> default order
 */
export const dataApi = {
  async list(table, { filter = {}, orderBy, ascending = true } = {}) {
    let query = supabase.from(table).select('*')
    Object.entries(filter).forEach(([k, v]) => {
      query = query.eq(k, v)
    })

    if (orderBy !== null) {
      const allowed = ORDERABLE[table] || ['created_at']
      if (orderBy && allowed.includes(orderBy)) {
        query = query.order(orderBy, { ascending })
      } else {
        const rules = DEFAULT_ORDER[table] || FALLBACK_ORDER
        rules.forEach(({ column, ascending: asc, nullsFirst }) => {
          query = query.order(column, nullsFirst === undefined ? { ascending: asc } : { ascending: asc, nullsFirst })
        })
      }
    }

    const { data, error } = await query
    if (error) {
      console.error(`[dataApi] Supabase error on ${table}:`, error.message)
      throw error
    }
    return data || []
  },

  async getById(table, id) {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
    if (error) {
      console.error(`[dataApi] getById error on ${table}:`, error.message)
      throw error
    }
    return data
  },

  async getBySlug(table, slug) {
    const { data, error } = await supabase.from(table).select('*').eq('slug', slug).single()
    if (error) {
      console.error(`[dataApi] getBySlug error on ${table}:`, error.message)
      throw error
    }
    return data
  },

  async upsert(table, item) {
    const { data, error } = await supabase.from(table).upsert(item).select().single()
    if (error) throw error
    return data
  },

  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return true
  },
}
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { dataApi } from '../../lib/supabase'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import PostedBySelect from '../../components/PostedBySelect'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../../lib/config'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

export default function AdminNews() {
  useNoIndex()
  const { profile } = useAuth()
  const canDelete = ['pubrel', 'admin_affairs', 'admin'].includes(profile?.role)

  const [news, setNews] = useState([])
  const [existingYears, setExistingYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [editingItem, setEditingItem] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reloadData = async () => {
    try {
      const data = await dataApi.list('news_posts', { orderBy: 'published_at', ascending: false })
      setNews(data)
      const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
      setExistingYears(yrs)
    } catch (err) {
      console.error('[AdminNews] reloadData error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload articles.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchNews() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('news_posts', { orderBy: 'published_at', ascending: false })
        if (!ignore) {
          setNews(data)
          const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
          setExistingYears(yrs)
        }
      } catch (err) {
        console.error('[AdminNews] fetchNews error:', err)
        if (!ignore) {
          setError(err.message || 'Failed to load news articles.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    fetchNews()
    return () => {
      ignore = true
    }
  }, [])

  const handleTitleChange = (val) => {
    const updated = { ...editingItem, title: val }
    if (!editingItem.id) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[-\s]+/g, '-')
      updated.slug = generatedSlug || `bulletin-${Date.now()}`
    }
    setEditingItem(updated)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('news_posts', editingItem)
      setFeedback({ type: 'success', message: 'Article record saved successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminNews] handleSave error:', err)
      const isDuplicateSlug =
        err?.code === '23505' ||
        err?.message?.includes('duplicate key') ||
        err?.message?.includes('unique') ||
        err?.message?.toLowerCase().includes('slug')
      const msg = isDuplicateSlug
        ? 'Slug already used. Please choose a unique URL slug.'
        : err.message || 'Failed to save article record.'
      setFeedback({ type: 'error', message: msg })
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (confirm('Are you sure you want to delete this article?')) {
      setFeedback(null)
      try {
        await dataApi.remove('news_posts', id)
        setFeedback({ type: 'success', message: 'Article record deleted.' })
        reloadData()
      } catch (err) {
        console.error('[AdminNews] handleDelete error:', err)
        setFeedback({ type: 'error', message: err.message || 'Failed to delete article.' })
      }
    }
  }

  return (
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
          title="Manage News & Announcements"
          subtitle="Publish official student org announcements and event updates."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Officer Dashboard', href: '/dashboard' },
            { label: 'News & Announcements' },
          ]}
          action={
            <PrimaryButton
              onClick={() =>
                setEditingItem({
                  title: '',
                  slug: `bulletin-${Date.now()}`,
                  category: 'news_events',
                  excerpt: '',
                  body: '',
                  thumbnail_url: '',
                  academic_year: CURRENT_ACADEMIC_YEAR,
                  committee: 'General',
                  published_at: new Date().toISOString(),
                })
              }
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Article</span>
            </PrimaryButton>
          }
        />

        {feedback && (
          <div
            className={`p-4 text-sm font-medium rounded-[4px] border ${
              feedback.type === 'success'
                ? 'bg-selens-ink border-selens-yellow text-selens-yellow'
                : 'bg-selens-ink border-red-500/50 text-red-400'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Compose / Edit Modal or Card */}
        {editingItem && (
          <Card className="border-selens-yellow">
            <div className="border-b border-selens-line pb-4 mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif text-selens-white">
                {editingItem.id ? 'Edit Article' : 'Compose New Article'}
              </h2>
              <span className="text-xs text-neutral-400">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Article Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className={input}
                  >
                    <option value="news_events">News &amp; Events</option>
                    <option value="student_activities">Student Activities</option>
                  </select>
                </div>
                <AcademicYearInput
                  value={editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
                  onChange={(val) => setEditingItem({ ...editingItem, academic_year: val })}
                  existingYears={existingYears}
                />
                <PostedBySelect
                  value={editingItem.committee || 'General'}
                  onChange={(val) => setEditingItem({ ...editingItem, committee: val })}
                  className="sm:col-span-2"
                />
              </div>

              <div>
                <ImageUploader
                  label="Thumbnail Image"
                  value={editingItem.thumbnail_url || ''}
                  onChange={(val) => setEditingItem({ ...editingItem, thumbnail_url: val })}
                  placeholder="https://... or upload article thumbnail"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Excerpt (short preview)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.excerpt || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                  className={input}
                  placeholder="Brief 1-2 sentence preview for news listings"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Article Body Content
                </label>
                <textarea
                  rows={6}
                  value={editingItem.body || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                  className={input}
                  placeholder="Full text of the announcement or event recap"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-selens-line">
                <SecondaryButton
                  type="button"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Save Article
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        {/* Directory List Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-selens-line flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-selens-yellow shrink-0" />
            <h2 className="text-base font-bold font-serif text-selens-white">
              {news.length} Published Articles &amp; Announcements
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-400">Loading articles...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          ) : news.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">No articles published yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse font-sans">
                <thead>
                  <tr className="border-b border-selens-line text-left text-xs uppercase tracking-wider text-neutral-400 bg-selens-black/40">
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Posted By</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Category</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-selens-line">
                  {news.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-selens-black/40 transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-selens-white font-serif text-base">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-1">
                          {item.excerpt}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-neutral-300 text-xs">
                        A.Y. {item.academic_year || '—'}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-neutral-300 text-xs">
                        <span className="text-selens-yellow font-semibold block">
                          {formatCommitteeLabel(item.committee)}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs uppercase px-2.5 py-1 rounded-[4px] border border-selens-line text-neutral-300">
                          {item.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px]"
                            title="Edit Article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
                              title="Delete Article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="pt-4 border-t border-selens-line text-xs text-neutral-500 text-right">
          SELENS News Management • A.Y. 2026–2027 • Maintained by the Executive Secretary
        </div>
      </div>
    </div>
  )
}

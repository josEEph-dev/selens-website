import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { dataApi } from '../../lib/supabase'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import PostedBySelect from '../../components/PostedBySelect'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../../lib/config'

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
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
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

      <div className="selens-container py-8 space-y-6">
        {feedback && (
          <div
            className={`p-4 m-text-6 font-medium rounded-[16px] border ${
              feedback.type === 'success'
                ? 'bg-[#121315] border-[#121315] text-[#FFD100]'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Compose / Edit Card */}
        {editingItem && (
          <div className="m-panel-light m-shadow p-6 sm:p-8 border-t-4 border-[#FFD100]">
            <div className="border-b border-[#cdd0d4] pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="m-text-5 text-[#121315]">
                {editingItem.id ? 'Edit Article' : 'Compose New Article'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="m-field">
                  <label className="m-field__label">Article Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="m-field__control"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingItem.slug}
                    onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                    className="m-field__control"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="m-field__control cursor-pointer"
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

              <ImageUploader
                label="Thumbnail Image"
                value={editingItem.thumbnail_url || ''}
                onChange={(val) => setEditingItem({ ...editingItem, thumbnail_url: val })}
                placeholder="https://... or upload article thumbnail"
              />

              <div className="m-field">
                <label className="m-field__label">Excerpt (short preview)</label>
                <textarea
                  rows={2}
                  value={editingItem.excerpt || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, excerpt: e.target.value })}
                  className="m-field__control !py-3 !min-h-[76px]"
                  placeholder="Brief 1-2 sentence preview for news listings"
                />
              </div>

              <div className="m-field">
                <label className="m-field__label">Article Body Content</label>
                <textarea
                  rows={6}
                  value={editingItem.body || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                  className="m-field__control !py-3 !min-h-[150px]"
                  placeholder="Full text of the announcement or event recap"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#cdd0d4]">
                <SecondaryButton type="button" onClick={() => setEditingItem(null)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Save Article
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}

        {/* Directory List Table */}
        <div className="m-panel-light m-shadow overflow-hidden">
          <div className="px-6 py-4 bg-[#121315] text-white flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#FFD100] shrink-0" />
            <h2 className="m-text-5 text-white">
              {news.length} Published Articles &amp; Announcements
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">Loading articles...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-700 text-sm">{error}</div>
          ) : news.length === 0 ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">No articles published yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#cdd0d4] text-left text-xs font-medium text-[#4d5158] bg-[#e7e8ea]/60">
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Posted By</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Category</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdd0d4]">
                  {news.map((item) => (
                    <tr key={item.id} className="hover:bg-[#e7e8ea]/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#121315] text-base block">
                          {item.title}
                        </span>
                        <p className="text-xs text-[#4d5158] line-clamp-1 mt-0.5">
                          {item.excerpt}
                        </p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-[#4d5158] text-xs">
                        A.Y. {item.academic_year || '—'}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-xs">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#121315] text-[#FFD100] font-medium">
                          {formatCommitteeLabel(item.committee)}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs capitalize px-2.5 py-1 rounded-full bg-[#e7e8ea] text-[#121315] font-medium">
                          {item.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#121315] hover:bg-[#FFD100] transition cursor-pointer"
                            title="Edit Article"
                            aria-label="Edit Article"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                              title="Delete Article"
                              aria-label="Delete Article"
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
        </div>

        <div className="pt-2 text-xs text-[#4d5158] text-right">
          SELENS News Management · A.Y. 2026–2027 · Maintained by the Executive Secretary
        </div>
      </div>
    </div>
  )
}

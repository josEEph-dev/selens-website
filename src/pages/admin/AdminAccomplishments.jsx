import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { dataApi } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import PostedBySelect from '../../components/PostedBySelect'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../../lib/config'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

export default function AdminAccomplishments() {
  useNoIndex()
  const { profile } = useAuth()
  const canDelete = ['pubrel', 'admin_affairs', 'admin'].includes(profile?.role)

  const [items, setItems] = useState([])
  const [existingYears, setExistingYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const reloadData = async () => {
    try {
      const data = await dataApi.list('accomplishments', { orderBy: 'accomplished_on', ascending: false })
      setItems(data)
      const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
      setExistingYears(yrs)
    } catch (err) {
      console.error('[AdminAccomplishments] Reload error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload accomplishments.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('accomplishments', { orderBy: 'accomplished_on', ascending: false })
        if (!ignore) {
          setItems(data)
          const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
          setExistingYears(yrs)
        }
      } catch (err) {
        console.error('[AdminAccomplishments] Fetch error:', err)
        if (!ignore) setError(err.message || 'Failed to load accomplishments.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchData()
    return () => { ignore = true }
  }, [])

  const handleTitleChange = (val) => {
    const updated = { ...editingItem, title: val }
    if (!editingItem.id) {
      // auto-generate slug for new records
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[-\s]+/g, '-')
      updated.slug = generatedSlug || `acc-${Date.now()}`
    }
    setEditingItem(updated)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('accomplishments', editingItem)
      setFeedback({ type: 'success', message: 'Accomplishment record saved successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminAccomplishments] Save error:', err)
      const isDuplicateSlug =
        err?.code === '23505' ||
        err?.message?.includes('duplicate key') ||
        err?.message?.includes('unique') ||
        err?.message?.toLowerCase().includes('slug')
      const msg = isDuplicateSlug
        ? 'Slug already used. Please choose a unique URL slug.'
        : err.message || 'Failed to save accomplishment record.'
      setFeedback({ type: 'error', message: msg })
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (confirm('Delete this accomplishment record?')) {
      setFeedback(null)
      try {
        await dataApi.remove('accomplishments', id)
        setFeedback({ type: 'success', message: 'Accomplishment record deleted.' })
        reloadData()
      } catch (err) {
        console.error('[AdminAccomplishments] Delete error:', err)
        setFeedback({ type: 'error', message: err.message || 'Failed to delete record.' })
      }
    }
  }

  return (
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
          title="Manage Accomplishments"
          subtitle="Publish student competitions, organizational milestones, and community outreach achievements."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Officer Dashboard', href: '/dashboard' },
            { label: 'Accomplishments' },
          ]}
          action={
            <PrimaryButton
              onClick={() =>
                setEditingItem({
                  title: '',
                  slug: `acc-${Date.now()}`,
                  summary: '',
                  body: '',
                  category: 'academic',
                  accomplished_on: new Date().toISOString().split('T')[0],
                  image_url: '',
                  academic_year: CURRENT_ACADEMIC_YEAR,
                  committee: 'General',
                })
              }
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Accomplishment</span>
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
                {editingItem.id ? 'Edit Accomplishment' : 'New Accomplishment'}
              </h2>
              <span className="text-xs text-neutral-400">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Title
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
                    <option value="academic">Academic</option>
                    <option value="competition">Competition</option>
                    <option value="community_outreach">Community Outreach</option>
                    <option value="organizational">Organizational</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Accomplished On (Date)
                  </label>
                  <input
                    type="date"
                    required
                    value={editingItem.accomplished_on || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, accomplished_on: e.target.value })}
                    className={input}
                  />
                </div>
                <AcademicYearInput
                  value={editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
                  onChange={(val) => setEditingItem({ ...editingItem, academic_year: val })}
                  existingYears={existingYears}
                />
                <PostedBySelect
                  value={editingItem.committee || 'General'}
                  onChange={(val) => setEditingItem({ ...editingItem, committee: val })}
                />
                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Accomplishment Image"
                    value={editingItem.image_url || ''}
                    onChange={(val) => setEditingItem({ ...editingItem, image_url: val })}
                    placeholder="https://... or upload image"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Summary (short preview)
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.summary || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  className={input}
                  placeholder="Brief summary of the accomplishment"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Body Content
                </label>
                <textarea
                  rows={6}
                  value={editingItem.body || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                  className={input}
                  placeholder="Full description, participant names, and milestone details"
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
                  Save Accomplishment
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        {/* Directory List Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-selens-line flex items-center gap-3">
            <Trophy className="w-5 h-5 text-selens-yellow shrink-0" />
            <h2 className="text-base font-bold font-serif text-selens-white">
              {items.length} Accomplishments Recorded
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-400">Loading accomplishments...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">No accomplishments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse font-sans">
                <thead>
                  <tr className="border-b border-selens-line text-left text-xs uppercase tracking-wider text-neutral-400 bg-selens-black/40">
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Posted By</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Category</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-selens-line">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-selens-black/40 transition"
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-selens-white font-serif text-base block">
                          {item.title}
                        </span>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                          {item.summary}
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
                      <td className="px-5 py-4 hidden sm:table-cell text-neutral-400 text-xs">
                        {item.accomplished_on}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px]"
                            title="Edit Accomplishment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
                              title="Delete Accomplishment"
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
          SELENS Accomplishments Registry • A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

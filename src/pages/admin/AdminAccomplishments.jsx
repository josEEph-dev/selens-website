import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { dataApi } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import PostedBySelect from '../../components/PostedBySelect'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../../lib/config'

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
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
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

        {editingItem && (
          <div className="m-panel-light m-shadow p-6 sm:p-8 border-t-4 border-[#FFD100]">
            <div className="border-b border-[#cdd0d4] pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="m-text-5 text-[#121315]">
                {editingItem.id ? 'Edit Accomplishment' : 'New Accomplishment'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="m-field">
                  <label className="m-field__label">Title</label>
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
                    <option value="academic">Academic</option>
                    <option value="competition">Competition</option>
                    <option value="community_outreach">Community Outreach</option>
                    <option value="organizational">Organizational</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="m-field">
                  <label className="m-field__label">Accomplished On (Date)</label>
                  <input
                    type="date"
                    required
                    value={editingItem.accomplished_on || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, accomplished_on: e.target.value })}
                    className="m-field__control"
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

              <div className="m-field">
                <label className="m-field__label">Summary (short preview)</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.summary || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  className="m-field__control !py-3 !min-h-[76px]"
                  placeholder="Brief summary of the accomplishment"
                />
              </div>

              <div className="m-field">
                <label className="m-field__label">Body Content</label>
                <textarea
                  rows={6}
                  value={editingItem.body || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                  className="m-field__control !py-3 !min-h-[150px]"
                  placeholder="Full description, participant names, and milestone details"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#cdd0d4]">
                <SecondaryButton type="button" onClick={() => setEditingItem(null)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Save Accomplishment
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}

        <div className="m-panel-light m-shadow overflow-hidden">
          <div className="px-6 py-4 bg-[#121315] text-white flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#FFD100] shrink-0" />
            <h2 className="m-text-5 text-white">
              {items.length} Accomplishments Recorded
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">Loading accomplishments...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-700 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">No accomplishments recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#cdd0d4] text-left text-xs font-medium text-[#4d5158] bg-[#e7e8ea]/60">
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Posted By</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Category</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdd0d4]">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#e7e8ea]/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#121315] text-base block">
                          {item.title}
                        </span>
                        <p className="text-xs text-[#4d5158] line-clamp-1 mt-0.5">
                          {item.summary}
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
                      <td className="px-5 py-4 hidden sm:table-cell text-[#4d5158] text-xs">
                        {item.accomplished_on}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#121315] hover:bg-[#FFD100] transition cursor-pointer"
                            title="Edit Accomplishment"
                            aria-label="Edit Accomplishment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                              title="Delete Accomplishment"
                              aria-label="Delete Accomplishment"
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
          SELENS Accomplishments Registry · A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

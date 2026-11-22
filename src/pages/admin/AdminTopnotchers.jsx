import { useState, useEffect } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import ImageUploader from '../../components/ImageUploader'

export default function AdminTopnotchers() {
  useNoIndex()
  const { profile } = useAuth()
  const canDelete = ['pubrel', 'admin_affairs', 'admin'].includes(profile?.role)

  const [items, setItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const reloadData = async () => {
    try {
      const data = await dataApi.list('topnotchers', { orderBy: 'rank', ascending: true })
      setItems(data)
    } catch (err) {
      console.error('[AdminTopnotchers] Reload error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload topnotchers.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchTopnotchers() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('topnotchers', { orderBy: 'rank', ascending: true })
        if (!ignore) setItems(data)
      } catch (err) {
        console.error('[AdminTopnotchers] Fetch error:', err)
        if (!ignore) setError(err.message || 'Failed to load topnotchers.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchTopnotchers()
    return () => { ignore = true }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('topnotchers', {
        ...editingItem,
        rank: parseInt(editingItem.rank, 10),
        rating: parseFloat(editingItem.rating),
      })
      setFeedback({ type: 'success', message: 'Topnotcher record saved successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminTopnotchers] Save error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to save topnotcher record.' })
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (confirm('Delete this topnotcher entry?')) {
      setFeedback(null)
      try {
        await dataApi.remove('topnotchers', id)
        setFeedback({ type: 'success', message: 'Topnotcher record deleted.' })
        reloadData()
      } catch (err) {
        console.error('[AdminTopnotchers] Delete error:', err)
        setFeedback({ type: 'error', message: err.message || 'Failed to delete topnotcher.' })
      }
    }
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
        title="Legion of Topnotchers Registry"
        subtitle="Honoring MSU-General Santos electrical engineering graduates who placed in the PRC Licensure Examinations."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Officer Dashboard', href: '/dashboard' },
          { label: 'Legion of Topnotchers' },
        ]}
        action={
          <PrimaryButton
            onClick={() =>
              setEditingItem({
                full_name: '',
                exam_year: '',
                rank: 1,
                rating: 90.0,
                photo_url: '',
                batch: '',
              })
            }
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topnotcher</span>
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
                {editingItem.id ? 'Edit Topnotcher Record' : 'New Topnotcher Record'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                A.Y. 2026–2027
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="m-field">
                  <label className="m-field__label">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.full_name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, full_name: e.target.value })}
                    className="m-field__control"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">National Rank (1–10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={editingItem.rank}
                    onChange={(e) => setEditingItem({ ...editingItem, rank: e.target.value })}
                    className="m-field__control"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">Rating (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: e.target.value })}
                    className="m-field__control"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="m-field">
                  <label className="m-field__label">Exam Year / Session</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026 or April 2026"
                    value={editingItem.exam_year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, exam_year: e.target.value })}
                    className="m-field__control"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={editingItem.batch || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, batch: e.target.value })}
                    className="m-field__control"
                  />
                </div>
              </div>
              <ImageUploader
                label="Honoree Photo"
                value={editingItem.photo_url || ''}
                onChange={(val) => setEditingItem({ ...editingItem, photo_url: val })}
                placeholder="https://... or upload honoree portrait"
              />
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#cdd0d4]">
                <SecondaryButton type="button" onClick={() => setEditingItem(null)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Save Entry
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}

        <div className="m-panel-light m-shadow overflow-hidden">
          <div className="px-6 py-4 bg-[#121315] text-white flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#FFD100] shrink-0" />
            <h2 className="m-text-5 text-white">
              {items.length} Registered Topnotchers
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">Loading topnotchers...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-700 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#cdd0d4] text-left text-xs font-medium text-[#4d5158] bg-[#e7e8ea]/60">
                    <th className="px-5 py-3.5 text-center w-20">Rank</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Exam Year</th>
                    <th className="px-5 py-3.5 text-center hidden md:table-cell">Rating</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdd0d4]">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center m-text-6 text-[#4d5158]">
                        No topnotchers recorded.
                      </td>
                    </tr>
                  ) : (
                    items.map((t) => (
                      <tr key={t.id} className="hover:bg-[#e7e8ea]/40 transition-colors">
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-[2.25rem] h-8 px-2 rounded-full font-semibold text-xs ${
                              t.rank === 1
                                ? 'bg-[#FFD100] text-[#121315]'
                                : 'bg-[#121315] text-[#FFD100]'
                            }`}
                          >
                            #{t.rank}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-[#121315] text-base block">
                            {t.full_name}
                          </span>
                          <span className="text-xs text-[#4d5158] sm:hidden block mt-0.5">
                            {t.exam_year} · {t.rating}%
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell text-[#121315]">
                          <div>{t.exam_year}</div>
                          {t.batch && <div className="text-xs text-[#4d5158] mt-0.5">Batch {t.batch}</div>}
                        </td>
                        <td className="px-5 py-4 text-center hidden md:table-cell">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#121315] text-[#FFD100] text-xs font-semibold">
                            {t.rating}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingItem(t)}
                              className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#121315] hover:bg-[#FFD100] transition cursor-pointer"
                              title="Edit Topnotcher"
                              aria-label="Edit Topnotcher"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDelete(t.id)}
                                className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                                title="Delete Topnotcher"
                                aria-label="Delete Topnotcher"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-2 text-xs text-[#4d5158] text-right">
          SELENS Legion of Topnotchers · Official Registry
        </div>
      </div>
    </div>
  )
}

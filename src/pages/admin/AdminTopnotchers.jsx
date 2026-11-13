import { useState, useEffect } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import ImageUploader from '../../components/ImageUploader'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

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
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
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

        {editingItem && (
          <Card className="border-selens-yellow">
            <div className="border-b border-selens-line pb-4 mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif text-selens-white">
                {editingItem.id ? 'Edit Topnotcher Record' : 'New Topnotcher Record'}
              </h2>
              <span className="text-xs text-neutral-400">A.Y. 2026–2027</span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.full_name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, full_name: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    National Rank (1–10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={editingItem.rank}
                    onChange={(e) => setEditingItem({ ...editingItem, rank: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Rating (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.rating}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: e.target.value })}
                    className={input}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Exam Year / Session
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026 or April 2026"
                    value={editingItem.exam_year || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, exam_year: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Batch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={editingItem.batch || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, batch: e.target.value })}
                    className={input}
                  />
                </div>
              </div>
              <div>
                <ImageUploader
                  label="Honoree Photo"
                  value={editingItem.photo_url || ''}
                  onChange={(val) => setEditingItem({ ...editingItem, photo_url: val })}
                  placeholder="https://... or upload honoree portrait"
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
                  Save Entry
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-selens-line flex items-center gap-3">
            <Trophy className="w-5 h-5 text-selens-yellow shrink-0" />
            <h2 className="text-base font-bold font-serif text-selens-white">
              {items.length} Registered Topnotchers
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-400">Loading topnotchers...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse font-sans">
                <thead>
                  <tr className="border-b border-selens-line text-left text-xs uppercase tracking-wider text-neutral-400 bg-selens-black/40">
                    <th className="px-5 py-3.5 text-center w-20">Rank</th>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Exam Year</th>
                    <th className="px-5 py-3.5 text-center hidden md:table-cell">Rating</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-selens-line">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-neutral-400">
                        No topnotchers recorded.
                      </td>
                    </tr>
                  ) : (
                    items.map((t) => (
                      <tr key={t.id} className="hover:bg-selens-black/40 transition">
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-[4px] font-bold text-sm ${
                            t.rank === 1
                              ? 'bg-selens-yellow text-selens-black'
                              : 'bg-selens-ink border border-selens-line text-selens-yellow'
                          }`}>
                            #{t.rank}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-selens-white font-serif text-base">
                          {t.full_name}
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell text-neutral-300">
                          <div>{t.exam_year}</div>
                          {t.batch && <div className="text-xs text-neutral-400 mt-0.5">Batch {t.batch}</div>}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-selens-yellow hidden md:table-cell">
                          {t.rating}%
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingItem(t)}
                              className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px]"
                              title="Edit Topnotcher"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
                                title="Delete Topnotcher"
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
        </Card>

        <div className="pt-4 border-t border-selens-line text-xs text-neutral-500 text-right">
          SELENS Legion of Topnotchers • Official Registry
        </div>
      </div>
    </div>
  )
}

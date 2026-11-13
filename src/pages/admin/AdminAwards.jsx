import { useState, useEffect } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, Award } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR } from '../../lib/config'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

export default function AdminAwards() {
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
      const data = await dataApi.list('awards')
      setItems(data)
      const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
      setExistingYears(yrs)
    } catch (err) {
      console.error('[AdminAwards] Reload error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload awards.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchAwards() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('awards')
        if (!ignore) {
          setItems(data)
          const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
          setExistingYears(yrs)
        }
      } catch (err) {
        console.error('[AdminAwards] Fetch error:', err)
        if (!ignore) setError(err.message || 'Failed to load awards.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchAwards()
    return () => { ignore = true }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('awards', editingItem)
      setFeedback({ type: 'success', message: 'Award record saved successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminAwards] Save error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to save award record.' })
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (confirm('Delete this award entry?')) {
      setFeedback(null)
      try {
        await dataApi.remove('awards', id)
        setFeedback({ type: 'success', message: 'Award record deleted.' })
        reloadData()
      } catch (err) {
        console.error('[AdminAwards] Delete error:', err)
        setFeedback({ type: 'error', message: err.message || 'Failed to delete award.' })
      }
    }
  }

  return (
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
          title="Manage Accreditations & Awards"
          subtitle="Curate the registry of institutional recognitions, board passing performances, and society citations."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Officer Dashboard', href: '/dashboard' },
            { label: 'Accreditations & Awards' },
          ]}
          action={
            <PrimaryButton
              onClick={() =>
                setEditingItem({
                  title: '',
                  description: '',
                  awarding_body: '',
                  date_awarded: '',
                  image_url: '',
                  academic_year: CURRENT_ACADEMIC_YEAR,
                })
              }
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Award</span>
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
                {editingItem.id ? 'Edit Award Record' : 'New Award Record'}
              </h2>
              <span className="text-xs text-neutral-400">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Award Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Awarding Body / Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.awarding_body || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, awarding_body: e.target.value })}
                    className={input}
                    placeholder="e.g. Professional Regulation Commission (PRC)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Date Awarded
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-05-15"
                    value={editingItem.date_awarded || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date_awarded: e.target.value })}
                    className={input}
                  />
                </div>
                <AcademicYearInput
                  value={editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
                  onChange={(val) => setEditingItem({ ...editingItem, academic_year: val })}
                  existingYears={existingYears}
                />
                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Award Seal / Certificate Image"
                    value={editingItem.image_url || ''}
                    onChange={(val) => setEditingItem({ ...editingItem, image_url: val })}
                    placeholder="https://... or upload certificate image"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Description / Details
                </label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className={input}
                  placeholder="Official passing percentage, level of accreditation, or award details"
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
            <Award className="w-5 h-5 text-selens-yellow shrink-0" />
            <h2 className="text-base font-bold font-serif text-selens-white">
              {items.length} Award &amp; Accreditation Entries
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-400">Loading awards...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">No award entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse font-sans">
                <thead>
                  <tr className="border-b border-selens-line text-left text-xs uppercase tracking-wider text-neutral-400 bg-selens-black/40">
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Awarding Body</th>
                    <th className="px-5 py-3.5 text-center w-32">Date Awarded</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-selens-line">
                  {items.map((a) => (
                    <tr key={a.id} className="hover:bg-selens-black/40 transition">
                      <td className="px-5 py-4">
                        <span className="font-bold text-selens-white font-serif text-base block">
                          {a.title}
                        </span>
                        {a.description && (
                          <span className="text-xs text-neutral-400 line-clamp-1 mt-0.5 block">
                            {a.description}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-neutral-300 text-xs">
                        A.Y. {a.academic_year || '—'}
                      </td>
                      <td className="px-5 py-4 text-neutral-300 hidden sm:table-cell">
                        {a.awarding_body}
                      </td>
                      <td className="px-5 py-4 text-center font-bold text-selens-yellow">
                        {a.date_awarded}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(a)}
                            className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px]"
                            title="Edit Award"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(a.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
                              title="Delete Award"
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
          SELENS Accreditations &amp; Awards • Department of Electrical Engineering
        </div>
      </div>
    </div>
  )
}

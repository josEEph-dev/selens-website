import { useState, useEffect } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, Award } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR } from '../../lib/config'

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
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
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
                {editingItem.id ? 'Edit Award Record' : 'New Award Record'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="m-field">
                  <label className="m-field__label">Award Title</label>
                  <input
                    type="text"
                    required
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="m-field__control"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">Awarding Body / Organization</label>
                  <input
                    type="text"
                    required
                    value={editingItem.awarding_body || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, awarding_body: e.target.value })}
                    className="m-field__control"
                    placeholder="e.g. Professional Regulation Commission (PRC)"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">Date Awarded</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-05-15"
                    value={editingItem.date_awarded || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date_awarded: e.target.value })}
                    className="m-field__control"
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
              <div className="m-field">
                <label className="m-field__label">Description / Details</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="m-field__control !py-3 !min-h-[96px]"
                  placeholder="Official passing percentage, level of accreditation, or award details"
                />
              </div>
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
            <Award className="w-5 h-5 text-[#FFD100] shrink-0" />
            <h2 className="m-text-5 text-white">
              {items.length} Award &amp; Accreditation Entries
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">Loading awards...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-700 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">No award entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#cdd0d4] text-left text-xs font-medium text-[#4d5158] bg-[#e7e8ea]/60">
                    <th className="px-5 py-3.5">Title</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Awarding Body</th>
                    <th className="px-5 py-3.5 text-center w-36">Date Awarded</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdd0d4]">
                  {items.map((a) => (
                    <tr key={a.id} className="hover:bg-[#e7e8ea]/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#121315] text-base block">
                          {a.title}
                        </span>
                        {a.description && (
                          <span className="text-xs text-[#4d5158] line-clamp-1 mt-0.5 block">
                            {a.description}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-[#4d5158] text-xs">
                        A.Y. {a.academic_year || '—'}
                      </td>
                      <td className="px-5 py-4 text-[#121315] hidden sm:table-cell">
                        {a.awarding_body}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFD100] text-[#121315] text-xs font-semibold">
                          {a.date_awarded}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(a)}
                            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#121315] hover:bg-[#FFD100] transition cursor-pointer"
                            title="Edit Award"
                            aria-label="Edit Award"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(a.id)}
                              className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                              title="Delete Award"
                              aria-label="Delete Award"
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
          SELENS Accreditations &amp; Awards · Department of Electrical Engineering
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { dataApi } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import PostedBySelect from '../../components/PostedBySelect'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../../lib/config'

export default function AdminProjects() {
  useNoIndex()
  const { profile } = useAuth()
  const canDelete = ['pubrel', 'admin_affairs', 'admin'].includes(profile?.role)

  const [projects, setProjects] = useState([])
  const [existingYears, setExistingYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const reloadData = async () => {
    try {
      const data = await dataApi.list('projects')
      setProjects(data)
      const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
      setExistingYears(yrs)
    } catch (err) {
      console.error('[AdminProjects] Reload error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload projects.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('projects')
        if (!ignore) {
          setProjects(data)
          const yrs = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...(data || []).map((d) => d.academic_year).filter(Boolean)]))
          setExistingYears(yrs)
        }
      } catch (err) {
        console.error('[AdminProjects] Fetch error:', err)
        if (!ignore) setError(err.message || 'Failed to load projects.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchData()
    return () => { ignore = true }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('projects', editingItem)
      setFeedback({ type: 'success', message: 'Project saved successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminProjects] Save error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to save project.' })
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (confirm('Delete this project?')) {
      setFeedback(null)
      try {
        await dataApi.remove('projects', id)
        setFeedback({ type: 'success', message: 'Project record deleted.' })
        reloadData()
      } catch (err) {
        console.error('[AdminProjects] Delete error:', err)
        setFeedback({ type: 'error', message: err.message || 'Failed to delete project.' })
      }
    }
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
        title="Manage Projects & Initiatives"
        subtitle="Curate active programs, academic projects, and organizational initiatives."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Officer Dashboard', href: '/dashboard' },
          { label: 'Projects & Initiatives' },
        ]}
        action={
          <PrimaryButton
            onClick={() =>
              setEditingItem({
                name: '',
                description: '',
                status: 'ongoing',
                cover_image_url: '',
                link_url: '',
                academic_year: CURRENT_ACADEMIC_YEAR,
                committee: 'General',
              })
            }
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
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
                {editingItem.id ? 'Edit Project' : 'New Project Record'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="m-field">
                  <label className="m-field__label">Project Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="m-field__control"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">Status</label>
                  <select
                    value={editingItem.status || 'ongoing'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="m-field__control cursor-pointer"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
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
                />
                <div className="m-field sm:col-span-2">
                  <label className="m-field__label">External Link URL</label>
                  <input
                    type="url"
                    value={editingItem.link_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, link_url: e.target.value })}
                    className="m-field__control"
                    placeholder="https://... (optional external info link)"
                  />
                </div>
                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Cover Image"
                    value={editingItem.cover_image_url || ''}
                    onChange={(val) => setEditingItem({ ...editingItem, cover_image_url: val })}
                    placeholder="https://... or upload project banner"
                  />
                </div>
              </div>

              <div className="m-field">
                <label className="m-field__label">Project Description</label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="m-field__control !py-3 !min-h-[116px]"
                  placeholder="Detailed description of the program goals and activities"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#cdd0d4]">
                <SecondaryButton type="button" onClick={() => setEditingItem(null)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Save Project
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}

        <div className="m-panel-light m-shadow overflow-hidden">
          <div className="px-6 py-4 bg-[#121315] text-white flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#FFD100] shrink-0" />
            <h2 className="m-text-5 text-white">
              {projects.length} Projects &amp; Programs
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">Loading projects...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-700 text-sm">{error}</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">No project records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#cdd0d4] text-left text-xs font-medium text-[#4d5158] bg-[#e7e8ea]/60">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Posted By</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdd0d4]">
                  {projects.map((item) => (
                    <tr key={item.id} className="hover:bg-[#e7e8ea]/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#121315] text-base block">
                          {item.name}
                        </span>
                        <p className="text-xs text-[#4d5158] line-clamp-1 mt-0.5">
                          {item.description}
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
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#121315] hover:bg-[#FFD100] transition cursor-pointer"
                            title="Edit Project"
                            aria-label="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                              title="Delete Project"
                              aria-label="Delete Project"
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
          SELENS Projects Directory · A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { dataApi } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import AcademicYearInput from '../../components/AcademicYearInput'
import PostedBySelect from '../../components/PostedBySelect'
import ImageUploader from '../../components/ImageUploader'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../../lib/config'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

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
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
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
                {editingItem.id ? 'Edit Project' : 'New Project Record'}
              </h2>
              <span className="text-xs text-neutral-400">
                A.Y. {editingItem.academic_year || CURRENT_ACADEMIC_YEAR}
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Status
                  </label>
                  <select
                    value={editingItem.status || 'ongoing'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className={input}
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
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    External Link URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.link_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, link_url: e.target.value })}
                    className={input}
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Project Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className={input}
                  placeholder="Detailed description of the program goals and activities"
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
                  Save Project
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        {/* Directory List Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-selens-line flex items-center gap-3">
            <Layers className="w-5 h-5 text-selens-yellow shrink-0" />
            <h2 className="text-base font-bold font-serif text-selens-white">
              {projects.length} Projects &amp; Programs
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-400">Loading projects...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">No project records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse font-sans">
                <thead>
                  <tr className="border-b border-selens-line text-left text-xs uppercase tracking-wider text-neutral-400 bg-selens-black/40">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Academic Year</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Posted By</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-selens-line">
                  {projects.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-selens-black/40 transition"
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-selens-white font-serif text-base block">
                          {item.name}
                        </span>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                          {item.description}
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
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px]"
                            title="Edit Project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
                              title="Delete Project"
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
          SELENS Projects Directory • A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

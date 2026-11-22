import { useState, useEffect, useRef } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import ImageUploader from '../../components/ImageUploader'

const NAV_OFFSET = 76

const GROUPS = [
  {
    id: 'executive-appointive',
    heading: 'Executive / Appointive Officials',
    subgroups: [
      { category: 'executive_board', label: 'Executive Board' },
      { category: 'undersecretary', label: 'Undersecretaries and Representatives' },
    ],
  },
  {
    id: 'legislative',
    heading: 'Legislative',
    subgroups: [
      { category: 'councilor', label: 'Councilors' },
      { category: 'year_representative', label: 'Year Representatives' },
    ],
  },
  {
    id: 'judiciary-comelec',
    heading: 'Judiciary / COMELEC Representatives',
    subgroups: [
      { category: 'comelec', label: 'COMELEC' },
      { category: 'judiciary', label: 'Judiciary' },
    ],
  },
  {
    id: 'faculty-staff',
    heading: 'Faculty and Staff',
    subgroups: [
      { category: 'adviser', label: null },
    ],
  },
]

const CATEGORY_GROUPS = GROUPS.map((g) => ({
  label: g.heading,
  options: g.subgroups.map((sg) => ({
    value: sg.category,
    label: sg.label || g.heading,
  })),
}))

export default function AdminPeople() {
  useNoIndex()
  const { profile } = useAuth()
  const canDelete = ['pubrel', 'admin_affairs', 'admin'].includes(profile?.role)

  const [people, setPeople] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const lockUntil = useRef(0)

  const categorized = {}
  people.forEach((p) => {
    if (!categorized[p.category]) {
      categorized[p.category] = []
    }
    categorized[p.category].push(p)
  })

  const activeGroups = GROUPS.filter((g) =>
    g.subgroups.some((sg) => (categorized[sg.category] || []).length > 0)
  )

  useEffect(() => {
    if (activeGroups.length === 0) return
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return
      let current = activeGroups[0].id
      for (const g of activeGroups) {
        const el = document.getElementById(`admin-people-${g.id}`)
        if (el && el.getBoundingClientRect().top <= NAV_OFFSET + 130) {
          current = g.id
        }
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = activeGroups[activeGroups.length - 1].id
      }
      setActiveId(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people])

  const reloadData = async () => {
    try {
      const data = await dataApi.list('people', { orderBy: 'display_order', ascending: true })
      setPeople(data)
    } catch (err) {
      console.error('[AdminPeople] Reload error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload people directory.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchPeople() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('people', { orderBy: 'display_order', ascending: true })
        if (!ignore) setPeople(data)
      } catch (err) {
        console.error('[AdminPeople] Fetch error:', err)
        if (!ignore) setError(err.message || 'Failed to load people directory.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchPeople()
    return () => { ignore = true }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('people', {
        ...editingItem,
        display_order: parseInt(editingItem.display_order || 1, 10),
      })
      setFeedback({ type: 'success', message: 'Person record saved successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminPeople] Save error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to save person record.' })
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (confirm('Delete this person record?')) {
      setFeedback(null)
      try {
        await dataApi.remove('people', id)
        setFeedback({ type: 'success', message: 'Person record deleted.' })
        reloadData()
      } catch (err) {
        console.error('[AdminPeople] Delete error:', err)
        setFeedback({ type: 'error', message: err.message || 'Failed to delete person record.' })
      }
    }
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
        title="Manage People Directory"
        subtitle="Maintain the official roster for Executive Board officers, legislative representatives, and faculty advisers for A.Y. 2026–2027."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Officer Dashboard', href: '/dashboard' },
          { label: 'People Directory' },
        ]}
        action={
          <PrimaryButton
            onClick={() =>
              setEditingItem({
                full_name: '',
                position: '',
                committee: '',
                category: 'executive_board',
                photo_url: '',
                display_order: people.length + 1,
              })
            }
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Person</span>
          </PrimaryButton>
        }
      />

      <div className="selens-container py-8 space-y-6">
        {feedback && (
          <div
            role="status"
            className={`fixed bottom-6 left-6 right-6 sm:right-auto z-40 max-w-sm p-4 m-text-6 font-medium rounded-[16px] border m-shadow flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-[#121315] border-[#121315] text-[#FFD100]'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="opacity-70 hover:opacity-100 transition cursor-pointer shrink-0"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {editingItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#121315]/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingItem(null)
            }}
          >
            <div className="m-panel-light m-shadow border-t-4 border-[#FFD100] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="border-b border-[#cdd0d4] pb-4 mb-6 flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="m-text-5 text-[#121315]">
                    {editingItem.id ? 'Edit Person Record' : 'Add New Person Record'}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                    A.Y. 2026–2027
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-[#e7e8ea] hover:text-[#121315] transition cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="m-field">
                    <label className="m-field__label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editingItem.full_name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, full_name: e.target.value })}
                      className="m-field__control"
                      placeholder="e.g. Officer Name"
                    />
                  </div>
                  <div className="m-field">
                    <label className="m-field__label">Position</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. President or Councilor"
                      value={editingItem.position || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, position: e.target.value })}
                      className="m-field__control"
                    />
                  </div>
                  <div className="m-field">
                    <label className="m-field__label">Category</label>
                    <select
                      value={editingItem.category || 'executive_board'}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="m-field__control cursor-pointer"
                    >
                      {CATEGORY_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="m-field">
                    <label className="m-field__label">Committee</label>
                    <input
                      type="text"
                      value={editingItem.committee || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, committee: e.target.value })}
                      className="m-field__control"
                      placeholder="e.g. Academic Affairs, Logistics"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <ImageUploader
                      label="Portrait Photo"
                      value={editingItem.photo_url || ''}
                      onChange={(val) => setEditingItem({ ...editingItem, photo_url: val })}
                      placeholder="https://... or upload officer portrait"
                    />
                  </div>
                  <div className="m-field">
                    <label className="m-field__label">
                      Display Order{' '}
                      <span className="text-[#4d5158] font-normal">(Lower numbers appear first.)</span>
                    </label>
                    <input
                      type="number"
                      value={editingItem.display_order ?? 1}
                      onChange={(e) => setEditingItem({ ...editingItem, display_order: e.target.value })}
                      className="m-field__control"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#cdd0d4]">
                  <SecondaryButton type="button" onClick={() => setEditingItem(null)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton type="submit">
                    Save Record
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="m-panel-light m-shadow p-8 text-center m-text-6 text-[#4d5158]">
            Loading personnel directory...
          </div>
        ) : error ? (
          <div className="m-panel-light m-shadow p-8 text-center text-red-700 text-sm">{error}</div>
        ) : people.length === 0 ? (
          <div className="m-panel-light m-shadow p-8 text-center m-text-6 text-[#4d5158]">
            No officer records entered yet for A.Y. 2026–2027.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#121315] text-[#FFD100] inline-flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </span>
              <span className="m-text-5 text-[#121315]">
                {people.length} Personnel Records (A.Y. 2026–2027)
              </span>
            </div>

            {activeGroups.length > 0 && (
              <nav
                className="sticky z-30 bg-[#e7e8ea]/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 py-2.5 border-b border-[#cdd0d4]"
                style={{ top: NAV_OFFSET }}
                aria-label="Manage People Directory Navigation"
              >
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-1">
                  {activeGroups.map((group) => {
                    const isActive = activeId === group.id
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => {
                          lockUntil.current = Date.now() + 1000
                          setActiveId(group.id)
                          document
                            .getElementById(`admin-people-${group.id}`)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border outline-none transition cursor-pointer ${
                          isActive
                            ? 'bg-[#121315] border-[#121315] text-white'
                            : 'bg-white border-[#cdd0d4] text-[#121315] hover:border-[#121315]'
                        }`}
                      >
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FFD100]" aria-hidden="true" />}
                        <span>{group.heading}</span>
                      </button>
                    )
                  })}
                </div>
              </nav>
            )}

            <div className="space-y-10">
              {activeGroups.map((group) => (
                <section key={group.id} id={`admin-people-${group.id}`} className="space-y-5 scroll-mt-44">
                  <div>
                    <h2 className="m-text-3 text-[#121315]">
                      {group.heading}
                    </h2>
                    <div className="w-12 h-1 rounded-full bg-[#FFD100] mt-2" />
                  </div>

                  <div className="space-y-5">
                    {group.subgroups.map((subgroup) => {
                      const members = categorized[subgroup.category] || []
                      if (members.length === 0) return null

                      return (
                        <div key={subgroup.category} className="m-panel-light m-shadow overflow-hidden">
                          <div className="px-6 py-4 bg-[#121315] text-white flex items-center justify-between gap-3">
                            <h3 className="m-text-5 text-white">
                              {subgroup.label || group.heading}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFD100] text-xs font-medium shrink-0">
                              {members.length} {members.length === 1 ? 'record' : 'records'}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="border-b border-[#cdd0d4] text-left text-xs font-medium text-[#4d5158] bg-[#e7e8ea]/60">
                                  <th className="px-5 py-3.5">Name</th>
                                  <th className="px-5 py-3.5 hidden sm:table-cell">Position</th>
                                  <th className="px-5 py-3.5 hidden md:table-cell">Order</th>
                                  <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#cdd0d4]">
                                {members.map((p) => (
                                  <tr key={p.id} className="hover:bg-[#e7e8ea]/40 transition-colors">
                                    <td className="px-5 py-4">
                                      <span className="font-medium text-[#121315] text-base block">
                                        {p.full_name}
                                      </span>
                                      <span className="text-xs text-[#4d5158] sm:hidden block mt-0.5">
                                        {p.position}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-[#121315] hidden sm:table-cell">
                                      {p.position}
                                      {p.committee && (
                                        <span className="text-xs text-[#4d5158] block mt-0.5">{p.committee}</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#e7e8ea] text-[#121315] text-xs font-medium">
                                        {p.display_order ?? '—'}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => setEditingItem(p)}
                                          className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#121315] hover:bg-[#FFD100] transition cursor-pointer"
                                          title="Edit Person"
                                          aria-label="Edit Person"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        {canDelete && (
                                          <button
                                            type="button"
                                            onClick={() => handleDelete(p.id)}
                                            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                                            title="Delete Person"
                                            aria-label="Delete Person"
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
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 text-xs text-[#4d5158] text-right">
          SELENS Directory Management · A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

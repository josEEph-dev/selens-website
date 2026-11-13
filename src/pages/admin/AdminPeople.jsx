import { useState, useEffect, useRef } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, Users, X } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import ImageUploader from '../../components/ImageUploader'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

const NAV_OFFSET = 80

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
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
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

        {feedback && (
          <div
            role="status"
            className={`fixed bottom-6 left-6 z-40 max-w-sm p-4 text-sm font-medium rounded-[4px] border flex items-center justify-between gap-3 ${
              feedback.type === 'success'
                ? 'bg-selens-ink border-selens-yellow text-selens-yellow'
                : 'bg-selens-ink border-red-500/50 text-red-400'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-neutral-400 hover:text-selens-white transition cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {editingItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingItem(null)
            }}
          >
            <Card className="border-selens-yellow max-w-3xl w-full max-h-[90vh] overflow-y-auto" hover={false}>
              <div className="border-b border-selens-line pb-4 mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold font-serif text-selens-white">
                    {editingItem.id ? 'Edit Person Record' : 'Add New Person Record'}
                  </h2>
                  <span className="text-xs text-neutral-400">A.Y. 2026–2027</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px] cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    placeholder="e.g. Officer Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Position
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. President or Councilor"
                    value={editingItem.position || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, position: e.target.value })}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={editingItem.category || 'executive_board'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className={input}
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
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Committee
                  </label>
                  <input
                    type="text"
                    value={editingItem.committee || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, committee: e.target.value })}
                    className={input}
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
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Display Order <span className="normal-case text-neutral-500 font-normal">(Lower numbers appear first.)</span>
                  </label>
                  <input
                    type="number"
                    value={editingItem.display_order ?? 1}
                    onChange={(e) => setEditingItem({ ...editingItem, display_order: e.target.value })}
                    className={input}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-selens-line">
                <SecondaryButton
                  type="button"
                  onClick={() => setEditingItem(null)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Save Record
                </PrimaryButton>
              </div>
            </form>
            </Card>
          </div>
        )}

        {loading ? (
          <Card className="p-8 text-center text-neutral-400">Loading personnel directory...</Card>
        ) : error ? (
          <Card className="p-8 text-center text-red-400 text-sm">{error}</Card>
        ) : people.length === 0 ? (
          <Card className="p-8 text-center text-neutral-400 text-sm">
            No officer records entered yet for A.Y. 2026–2027.
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-sm font-serif font-bold text-selens-white">
              <Users className="w-5 h-5 text-selens-yellow shrink-0" />
              <span>{people.length} Personnel Records (A.Y. 2026–2027)</span>
            </div>

            {activeGroups.length > 0 && (
              <nav
                className="sticky z-30 bg-selens-black border-b-2 border-selens-yellow"
                style={{ top: NAV_OFFSET }}
                aria-label="Manage People Directory Navigation"
              >
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-3">
                  {activeGroups.map((group) => (
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
                      className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-[4px] border outline-none transition cursor-pointer ${
                        activeId === group.id
                          ? 'bg-selens-yellow border-selens-yellow text-black'
                          : 'bg-selens-ink border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
                      }`}
                    >
                      {group.heading}
                    </button>
                  ))}
                </div>
              </nav>
            )}

            <div className="space-y-12">
              {activeGroups.map((group) => (
                <section key={group.id} id={`admin-people-${group.id}`} className="space-y-6 scroll-mt-44">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-selens-white">
                      {group.heading}
                    </h2>
                    <div className="w-12 h-1 bg-selens-yellow mt-2" />
                  </div>

                  <div className="space-y-6">
                    {group.subgroups.map((subgroup) => {
                      const members = categorized[subgroup.category] || []
                      if (members.length === 0) return null

                      return (
                        <Card key={subgroup.category} className="p-0 overflow-hidden" hover={false}>
                          <div className="px-5 py-3.5 bg-selens-black/60 border-b border-selens-line flex items-center justify-between">
                            <h3 className="font-serif font-bold text-sm text-selens-yellow">
                              {subgroup.label || group.heading}
                            </h3>
                            <span className="text-xs font-sans text-neutral-400">
                              {members.length} {members.length === 1 ? 'record' : 'records'}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse font-sans">
                              <thead>
                                <tr className="border-b border-selens-line text-left text-xs uppercase tracking-wider text-neutral-400 bg-selens-black/40">
                                  <th className="px-5 py-3">Name</th>
                                  <th className="px-5 py-3 hidden sm:table-cell">Position</th>
                                  <th className="px-5 py-3 hidden md:table-cell">Order</th>
                                  <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-selens-line">
                                {members.map((p) => (
                                  <tr key={p.id} className="hover:bg-selens-black/40 transition">
                                    <td className="px-5 py-3.5">
                                      <span className="font-bold text-selens-white font-serif text-base block">
                                        {p.full_name}
                                      </span>
                                      <span className="text-xs text-neutral-400 sm:hidden">{p.position}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-300 hidden sm:table-cell">
                                      {p.position}
                                      {p.committee && (
                                        <span className="text-xs text-neutral-500 block">{p.committee}</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-400 hidden md:table-cell">
                                      {p.display_order ?? '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          onClick={() => setEditingItem(p)}
                                          className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px]"
                                          title="Edit Person"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        {canDelete && (
                                          <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
                                            title="Delete Person"
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
                        </Card>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-selens-line text-xs text-neutral-500 text-right">
          SELENS Directory Management • A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

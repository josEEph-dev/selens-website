import { useState, useEffect } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

export default function AdminFaqs() {
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
      const data = await dataApi.list('faqs', { orderBy: 'display_order', ascending: true })
      setItems(data)
    } catch (err) {
      console.error('[AdminFaqs] Reload error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload FAQs.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchFaqs() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('faqs', { orderBy: 'display_order', ascending: true })
        if (!ignore) setItems(data)
      } catch (err) {
        console.error('[AdminFaqs] Fetch error:', err)
        if (!ignore) setError(err.message || 'Failed to load FAQ entries.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchFaqs()
    return () => { ignore = true }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('faqs', {
        ...editingItem,
        display_order: parseInt(editingItem.display_order || 1, 10),
      })
      setFeedback({ type: 'success', message: 'FAQ entry saved successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminFaqs] Save error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to save FAQ entry.' })
    }
  }

  const handleDelete = async (id) => {
    if (!canDelete) return
    if (confirm('Delete this FAQ entry?')) {
      try {
        await dataApi.remove('faqs', id)
        setFeedback({ type: 'success', message: 'FAQ entry deleted.' })
        reloadData()
      } catch (err) {
        console.error('[AdminFaqs] Delete error:', err)
        setFeedback({ type: 'error', message: err.message || 'Failed to delete FAQ entry.' })
      }
    }
  }

  return (
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
          title="FAQ Knowledge Base"
          subtitle="Manage answers to frequently asked questions about membership, document requests, academics, and events."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Officer Dashboard', href: '/dashboard' },
            { label: 'FAQ Knowledge Base' },
          ]}
          action={
            <PrimaryButton
              onClick={() =>
                setEditingItem({
                  question: '',
                  answer: '',
                  display_order: items.length + 1,
                })
              }
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add FAQ</span>
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
                {editingItem.id ? 'Edit FAQ Entry' : 'New FAQ Entry'}
              </h2>
              <span className="text-xs text-neutral-400">A.Y. 2026–2027</span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Question
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.question}
                    onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                    className={input}
                    placeholder="e.g. How do I request an official endorsement letter?"
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Answer
                </label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.answer}
                  onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                  className={input}
                  placeholder="Clear, helpful response to the question..."
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
            <HelpCircle className="w-5 h-5 text-selens-yellow shrink-0" />
            <h2 className="text-base font-bold font-serif text-selens-white">
              {items.length} FAQ Entries
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-neutral-400">Loading FAQ entries...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">No FAQ entries registered yet.</div>
          ) : (
            <div className="divide-y divide-selens-line">
              {items.map((f) => (
                <div
                  key={f.id}
                  className="p-5 flex items-start justify-between gap-6 hover:bg-selens-black/40 transition"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-selens-white text-base">
                        {f.question}
                      </h3>
                      <span className="text-xs text-neutral-400">
                        Order #{f.display_order}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">
                      {f.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingItem(f)}
                      className="p-1.5 text-neutral-400 hover:text-selens-yellow transition rounded-[4px]"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 transition rounded-[4px]"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="pt-4 border-t border-selens-line text-xs text-neutral-500 text-right">
          SELENS FAQ Management • A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

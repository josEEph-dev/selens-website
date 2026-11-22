import { useState, useEffect } from 'react'
import { dataApi } from '../../lib/supabase'
import { useAuth } from '../../context/useAuth'
import { useNoIndex } from '../portal/useNoIndex'
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'

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
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
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
                {editingItem.id ? 'Edit FAQ Entry' : 'New FAQ Entry'}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                A.Y. 2026–2027
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="sm:col-span-2 m-field">
                  <label className="m-field__label">Question</label>
                  <input
                    type="text"
                    required
                    value={editingItem.question}
                    onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                    className="m-field__control"
                    placeholder="e.g. How do I request an official endorsement letter?"
                  />
                </div>
                <div className="m-field">
                  <label className="m-field__label">
                    Display Order{' '}
                    <span className="text-[#4d5158] font-normal">(Lower first)</span>
                  </label>
                  <input
                    type="number"
                    value={editingItem.display_order ?? 1}
                    onChange={(e) => setEditingItem({ ...editingItem, display_order: e.target.value })}
                    className="m-field__control"
                  />
                </div>
              </div>
              <div className="m-field">
                <label className="m-field__label">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.answer}
                  onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                  className="m-field__control !py-3 !min-h-[120px]"
                  placeholder="Clear, helpful response to the question..."
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
            <HelpCircle className="w-5 h-5 text-[#FFD100] shrink-0" />
            <h2 className="m-text-5 text-white">
              {items.length} FAQ Entries
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">Loading FAQ entries...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-700 text-sm">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center m-text-6 text-[#4d5158]">No FAQ entries registered yet.</div>
          ) : (
            <div className="divide-y divide-[#cdd0d4]">
              {items.map((f) => (
                <div
                  key={f.id}
                  className="p-5 sm:px-6 flex items-start justify-between gap-4 sm:gap-6 hover:bg-[#e7e8ea]/40 transition-colors"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium shrink-0">
                        #{f.display_order}
                      </span>
                      <h3 className="font-medium text-[#121315] text-base">
                        {f.question}
                      </h3>
                    </div>
                    <p className="text-sm text-[#4d5158] leading-relaxed line-clamp-2">
                      {f.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditingItem(f)}
                      className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#121315] hover:bg-[#FFD100] transition cursor-pointer"
                      title="Edit FAQ"
                      aria-label="Edit FAQ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(f.id)}
                        className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                        title="Delete FAQ"
                        aria-label="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 text-xs text-[#4d5158] text-right">
          SELENS FAQ Management · A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

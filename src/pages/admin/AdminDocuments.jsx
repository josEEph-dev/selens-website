import { useState, useEffect } from 'react'
import { dataApi } from '../../lib/supabase'
import { useNoIndex } from '../portal/useNoIndex'
import { FileText, Edit2, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { PageHeader, PrimaryButton, SecondaryButton } from '../../components/SharedUI'

const DOCUMENT_LABELS = {
  good_standing: 'Certificate of Good Standing',
  membership_cert: 'Certificate of Active Membership',
  endorsement_letter: 'Official Endorsement Letter',
  clearance: 'Semester Organization Clearance',
  excuse_letter: 'Official Event Excuse Letter',
}

const renderStatusBadge = (status) => {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-[#121315] text-[#FFD100]">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
        </span>
      )
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-[#e7e8ea] border border-[#cdd0d4] text-[#121315]">
          <Clock className="w-3.5 h-3.5" /> Processing
        </span>
      )
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-red-50 border border-red-200 text-red-700">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      )
    case 'claimed':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-[#e7e8ea] text-[#4d5158]">
          Claimed
        </span>
      )
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#FFD100] text-[#121315]">
          <Clock className="w-3.5 h-3.5" /> Pending
        </span>
      )
  }
}

export default function AdminDocuments() {
  useNoIndex()
  const [requests, setRequests] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [feedback, setFeedback] = useState(null)

  const reloadData = async () => {
    try {
      const data = await dataApi.list('document_requests', { orderBy: 'created_at', ascending: false })
      setRequests(data)
    } catch (err) {
      console.error('[AdminDocuments] Reload error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to reload document requests.' })
    }
  }

  useEffect(() => {
    let ignore = false
    async function fetchRequests() {
      try {
        const data = await dataApi.list('document_requests', { orderBy: 'created_at', ascending: false })
        if (!ignore) setRequests(data)
      } catch (err) {
        console.error('[AdminDocuments] Fetch error:', err)
        if (!ignore) setFeedback({ type: 'error', message: err.message || 'Failed to load document requests.' })
      }
    }
    fetchRequests()
    return () => { ignore = true }
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setFeedback(null)
    try {
      await dataApi.upsert('document_requests', editingItem)
      setFeedback({ type: 'success', message: 'Document request updated successfully.' })
      setEditingItem(null)
      reloadData()
    } catch (err) {
      console.error('[AdminDocuments] Update error:', err)
      setFeedback({ type: 'error', message: err.message || 'Failed to update document request.' })
    }
  }

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus)

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        compactTop
        title="Document Requests Queue"
        subtitle="Review and process member requests for good standing certificates, organizational clearance, and endorsement letters."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Officer Dashboard', href: '/dashboard' },
          { label: 'Document Queue' },
        ]}
        action={
          pendingCount > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD100] text-[#121315] font-semibold text-xs rounded-full">
              <Clock className="w-4 h-4" />
              <span>{pendingCount} Pending Requisition{pendingCount === 1 ? '' : 's'}</span>
            </span>
          )
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'approved', 'rejected', 'claimed'].map((st) => {
            const isActive = filterStatus === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-full border transition cursor-pointer ${
                  isActive
                    ? 'bg-[#121315] border-[#121315] text-[#FFD100]'
                    : 'bg-white border-[#cdd0d4] text-[#121315] hover:border-[#121315]'
                }`}
              >
                {st} {st !== 'all' && <span>({requests.filter((r) => r.status === st).length})</span>}
              </button>
            )
          })}
        </div>

        {/* Update Form Card */}
        {editingItem && (
          <div className="m-panel-light m-shadow p-6 sm:p-8 border-t-4 border-[#FFD100]">
            <div className="border-b border-[#cdd0d4] pb-4 mb-6 flex flex-wrap items-center justify-between gap-2">
              <h2 className="m-text-5 text-[#121315]">
                Process Request: {editingItem.full_name} ({editingItem.student_id})
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                A.Y. 2026–2027
              </span>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="m-field">
                  <label className="m-field__label">Fulfillment Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="m-field__control cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved &amp; Ready</option>
                    <option value="rejected">Rejected</option>
                    <option value="claimed">Claimed</option>
                  </select>
                </div>
                <div className="m-field">
                  <label className="m-field__label">File Attachment URL (PDF)</label>
                  <input
                    type="text"
                    placeholder="/website-assets/sample.pdf or external URL"
                    value={editingItem.file_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, file_url: e.target.value })}
                    className="m-field__control"
                  />
                </div>
              </div>
              <div className="m-field">
                <label className="m-field__label">Officer Notes / Instructions to Student</label>
                <textarea
                  rows={2}
                  value={editingItem.admin_notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, admin_notes: e.target.value })}
                  className="m-field__control !py-3 !min-h-[84px]"
                  placeholder="e.g. Approved. Pick up physical signed copy at the SELENS Council Office during office hours."
                />
              </div>
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#cdd0d4]">
                <SecondaryButton type="button" onClick={() => setEditingItem(null)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton type="submit">
                  Update Request
                </PrimaryButton>
              </div>
            </form>
          </div>
        )}

        {/* Requests Table */}
        <div className="m-panel-light m-shadow overflow-hidden">
          <div className="px-6 py-4 bg-[#121315] text-white flex items-center gap-3">
            <FileText className="w-5 h-5 text-[#FFD100] shrink-0" />
            <h2 className="m-text-5 text-white">
              {filtered.length}{' '}
              {filterStatus === 'all' ? 'Total' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}{' '}
              {filtered.length === 1 ? 'Request' : 'Requests'}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center m-text-6 text-[#4d5158]">
              No document requests match this status filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#cdd0d4] text-left text-xs font-medium text-[#4d5158] bg-[#e7e8ea]/60">
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Document</th>
                    <th className="px-5 py-3.5 hidden md:table-cell">Purpose</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cdd0d4]">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-[#e7e8ea]/40 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-medium text-[#121315] text-base block">
                          {req.full_name}
                        </span>
                        <span className="text-xs text-[#4d5158]">{req.student_id}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-[#121315]">
                        <div>{DOCUMENT_LABELS[req.document_type] || req.document_type}</div>
                        <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-[#e7e8ea] text-[#4d5158] font-medium inline-block mt-1">
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-[#4d5158] max-w-xs">
                        <p className="line-clamp-2">{req.purpose}</p>
                      </td>
                      <td className="px-5 py-4">
                        {renderStatusBadge(req.status)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingItem(req)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#121315] text-[#FFD100] text-xs font-semibold rounded-full hover:bg-[#FFD100] hover:text-[#121315] transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-2 text-xs text-[#4d5158] text-right">
          SELENS Secretariat Queue · A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

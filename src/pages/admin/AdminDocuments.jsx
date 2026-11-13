import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dataApi } from '../../lib/supabase'
import { useNoIndex } from '../portal/useNoIndex'
import { FileText, ArrowLeft, Edit2, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'

const input = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[4px] border border-selens-yellow/40 text-selens-yellow">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
        </span>
      )
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[4px] border border-selens-line text-neutral-300">
          <Clock className="w-3.5 h-3.5" /> Processing
        </span>
      )
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[4px] border border-neutral-700 text-neutral-400">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      )
    case 'claimed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[4px] border border-selens-line text-neutral-400">
          Claimed
        </span>
      )
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[4px] bg-selens-yellow text-selens-black">
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

  const reloadData = async () => {
    const data = await dataApi.list('document_requests', { orderBy: 'created_at', ascending: false })
    setRequests(data)
  }

  useEffect(() => {
    let ignore = false
    async function fetchRequests() {
      const data = await dataApi.list('document_requests', { orderBy: 'created_at', ascending: false })
      if (!ignore) setRequests(data)
    }
    fetchRequests()
    return () => { ignore = true }
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    await dataApi.upsert('document_requests', editingItem)
    setEditingItem(null)
    reloadData()
  }

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus)

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
          title="Document Requests Queue"
          subtitle="Review and process member requests for good standing certificates, organizational clearance, and endorsement letters."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Officer Dashboard', href: '/admin' },
            { label: 'Document Queue' },
          ]}
          action={
            pendingCount > 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-selens-yellow text-selens-black font-semibold text-xs rounded-[4px]">
                <Clock className="w-4 h-4" />
                <span>{pendingCount} Pending Requisition{pendingCount === 1 ? '' : 's'}</span>
              </span>
            )
          }
        />

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'processing', 'approved', 'rejected', 'claimed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[4px] transition ${
                filterStatus === st
                  ? 'bg-selens-yellow text-selens-black'
                  : 'bg-selens-ink border border-selens-line text-neutral-400 hover:text-selens-white hover:border-neutral-500'
              }`}
            >
              {st} {st !== 'all' && <span>({requests.filter((r) => r.status === st).length})</span>}
            </button>
          ))}
        </div>

        {/* Update Modal / Drawer */}
        {editingItem && (
          <Card className="border-selens-yellow">
            <div className="border-b border-selens-line pb-4 mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif text-selens-white">
                Process Request: {editingItem.full_name} ({editingItem.student_id})
              </h2>
              <span className="text-xs text-neutral-400">A.Y. 2026–2027</span>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    Fulfillment Status
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className={input}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="approved">Approved &amp; Ready</option>
                    <option value="rejected">Rejected</option>
                    <option value="claimed">Claimed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                    File Attachment URL (PDF)
                  </label>
                  <input
                    type="text"
                    placeholder="/website-assets/sample.pdf or external URL"
                    value={editingItem.file_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, file_url: e.target.value })}
                    className={input}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Officer Notes / Instructions to Student
                </label>
                <textarea
                  rows={2}
                  value={editingItem.admin_notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, admin_notes: e.target.value })}
                  className={input}
                  placeholder="e.g. Approved. Pick up physical signed copy at the SELENS Council Office during office hours."
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
                  Update Request
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        {/* Requests Table */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-selens-line flex items-center gap-3">
            <FileText className="w-5 h-5 text-selens-yellow shrink-0" />
            <h2 className="text-base font-bold font-serif text-selens-white">
              {filtered.length} {filterStatus === 'all' ? 'Total' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} {filtered.length === 1 ? 'Request' : 'Requests'}
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-neutral-400 text-sm">
              No document requests match this status filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse font-sans">
                <thead>
                  <tr className="border-b border-selens-line text-left text-xs uppercase tracking-wider text-neutral-400 bg-selens-black/40">
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5 hidden sm:table-cell">Document</th>
                    <th className="px-5 py-3.5 hidden md:table-cell">Purpose</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-selens-line">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-selens-black/40 transition">
                      <td className="px-5 py-4">
                        <span className="font-bold text-selens-white font-serif text-base block">
                          {req.full_name}
                        </span>
                        <span className="text-xs text-neutral-400">{req.student_id}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-neutral-300">
                        <div>{DOCUMENT_LABELS[req.document_type] || req.document_type}</div>
                        <span className="text-xs uppercase px-2 py-0.5 rounded-[4px] border border-selens-line text-neutral-400 inline-block mt-1">
                          {req.urgency}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell text-neutral-400 max-w-xs">
                        <p className="line-clamp-2">{req.purpose}</p>
                      </td>
                      <td className="px-5 py-4">
                        {renderStatusBadge(req.status)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setEditingItem(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-selens-yellow text-selens-black text-xs font-semibold rounded-[4px] hover:bg-yellow-400 transition"
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
        </Card>

        <div className="pt-4 border-t border-selens-line text-xs text-neutral-500 text-right">
          SELENS Secretariat Queue • A.Y. 2026–2027
        </div>
      </div>
    </div>
  )
}

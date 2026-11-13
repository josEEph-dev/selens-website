import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { dataApi } from '../../lib/supabase'
import { PageHeader, Card, Section, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  XCircle,
} from 'lucide-react'

const DOCUMENT_TYPES = [
  { id: 'good_standing', label: 'Certificate of Good Standing' },
  { id: 'membership_cert', label: 'Certificate of Active Membership' },
  { id: 'endorsement_letter', label: 'Official Endorsement Letter' },
  { id: 'clearance', label: 'Semester Organization Clearance' },
  { id: 'excuse_letter', label: 'Official Event Excuse Letter' },
]

export default function DocumentRequests() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [docType, setDocType] = useState('good_standing')
  const [urgency, setUrgency] = useState('regular')
  const [purpose, setPurpose] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const loadRequests = async () => {
    try {
      const data = await dataApi.list('document_requests', { orderBy: 'created_at', ascending: false })
      setRequests(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const newReq = {
        user_id: profile?.id || 'usr-student-1',
        student_id: profile?.student_id || '2026-0001',
        full_name: profile?.full_name || 'Member',
        document_type: docType,
        purpose,
        urgency,
        status: 'pending',
        admin_notes: 'Request submitted for review.',
        file_url: '',
      }
      await dataApi.upsert('document_requests', newReq)
      setFeedback({ type: 'success', message: 'Your document request has been submitted successfully.' })
      setPurpose('')
      setShowForm(false)
      loadRequests()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit request.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (confirm('Are you sure you want to cancel this pending request?')) {
      await dataApi.remove('document_requests', id)
      loadRequests()
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[4px] bg-selens-yellow text-selens-black">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[4px] bg-selens-black border border-selens-line text-selens-white">
            <Clock className="w-3.5 h-3.5 text-selens-yellow animate-spin" /> Processing
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[4px] bg-red-950/60 border border-red-700/50 text-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-400" /> Action required
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-[4px] bg-selens-ink border border-selens-line text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-selens-yellow" /> Pending review
          </span>
        )
    }
  }

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <div className="border-b border-selens-line py-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-selens-yellow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to services &amp; portals</span>
          </Link>
        </div>
      </div>

      <PageHeader
        title="Digital Document Requests"
        description="Request official certificates of good standing, membership credentials, and organization clearance for A.Y. 2026–2027."
        action={
          <PrimaryButton
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            {showForm ? 'Close form' : <><Plus className="w-4 h-4" /> New request</>}
          </PrimaryButton>
        }
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {feedback && (
          <div
            className={`p-4 rounded-[4px] text-sm font-medium flex items-start gap-3 border ${
              feedback.type === 'success'
                ? 'bg-selens-ink border-selens-yellow text-selens-white'
                : 'bg-red-950/50 border-red-700 text-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-selens-yellow shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Request Form */}
        {showForm && (
          <Card className="p-6 sm:p-8 space-y-6" hover={false}>
            <div className="border-b border-selens-line pb-3">
              <h2 className="font-serif font-bold text-xl text-selens-white">
                Submit document request
              </h2>
              <p className="text-sm text-neutral-300 mt-1">
                Fill in the details below. Requests are typically reviewed within 3 to 5 school days.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-selens-white">
                    Document type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white focus:outline-none focus:border-selens-yellow transition font-sans"
                  >
                    {DOCUMENT_TYPES.map((d) => (
                      <option key={d.id} value={d.id} className="bg-selens-black text-selens-white">
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-selens-white">
                    Processing timeline
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white focus:outline-none focus:border-selens-yellow transition font-sans"
                  >
                    <option value="regular" className="bg-selens-black text-selens-white">
                      Regular processing (3–5 school days)
                    </option>
                    <option value="urgent" className="bg-selens-black text-selens-white">
                      Urgent review (1–2 school days)
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-selens-white">
                  Purpose / Intended recipient
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Scholarship application, internship endorsement, or semester department clearance..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-4 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-selens-line">
                <SecondaryButton
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit request'}
                </PrimaryButton>
              </div>
            </form>
          </Card>
        )}

        {/* Request History */}
        <Section
          title="Your requests"
          description="Track the status of your submitted certifications and download signed digital files."
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-20 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <Card className="p-12 text-center space-y-3" hover={false}>
              <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-selens-white">
                No document requests on record
              </h3>
              <p className="text-sm text-neutral-300">
                You have not submitted any document requests yet. Click &ldquo;New request&rdquo; above to start.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <Card
                  key={req.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-serif font-bold text-lg text-selens-white">
                        {DOCUMENT_TYPES.find((d) => d.id === req.document_type)?.label || req.document_type}
                      </h3>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                      Purpose: {req.purpose}
                    </p>
                    <div className="text-xs text-neutral-400 font-sans flex items-center gap-4">
                      <span>Submitted: {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US') : 'Recent'}</span>
                      <span>•</span>
                      <span className="capitalize">{req.urgency} processing</span>
                      {req.admin_notes && (
                        <>
                          <span>•</span>
                          <span className="text-selens-yellow italic">{req.admin_notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3 self-end sm:self-center">
                    {req.status === 'approved' && req.file_url && (
                      <PrimaryButton
                        href={req.file_url}
                        download
                        className="gap-1.5 text-xs py-2 px-3.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </PrimaryButton>
                    )}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        className="text-xs font-semibold text-neutral-400 hover:text-red-400 transition cursor-pointer"
                      >
                        Cancel request
                      </button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

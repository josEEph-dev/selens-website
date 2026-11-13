/**
 * Document Request Status Transition State Machine
 * Valid states: 'pending' -> 'processing' -> ('approved' | 'rejected') -> 'claimed'
 */

export const DOCUMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CLAIMED: 'claimed',
}

const ALLOWED_TRANSITIONS = {
  [DOCUMENT_STATUSES.PENDING]: [DOCUMENT_STATUSES.PROCESSING, DOCUMENT_STATUSES.REJECTED],
  [DOCUMENT_STATUSES.PROCESSING]: [DOCUMENT_STATUSES.APPROVED, DOCUMENT_STATUSES.REJECTED],
  [DOCUMENT_STATUSES.APPROVED]: [DOCUMENT_STATUSES.CLAIMED],
  [DOCUMENT_STATUSES.REJECTED]: [DOCUMENT_STATUSES.PENDING], // can resubmit
  [DOCUMENT_STATUSES.CLAIMED]: [], // terminal
}

export function canTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || []
  return allowed.includes(nextStatus)
}

export function canStudentCancel(status) {
  return status === DOCUMENT_STATUSES.PENDING
}

export function isReadyForDownload(request) {
  return request.status === DOCUMENT_STATUSES.APPROVED && Boolean(request.file_url)
}

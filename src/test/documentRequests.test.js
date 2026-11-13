import { describe, it, expect } from 'vitest'
import {
  DOCUMENT_STATUSES,
  canTransition,
  canStudentCancel,
  isReadyForDownload,
} from '../lib/documentWorkflow'

describe('Document Request Status Flow & Validation Rules', () => {
  it('allows valid officer transition from pending to processing', () => {
    expect(canTransition(DOCUMENT_STATUSES.PENDING, DOCUMENT_STATUSES.PROCESSING)).toBe(true)
  })

  it('allows valid transition from processing to approved or rejected', () => {
    expect(canTransition(DOCUMENT_STATUSES.PROCESSING, DOCUMENT_STATUSES.APPROVED)).toBe(true)
    expect(canTransition(DOCUMENT_STATUSES.PROCESSING, DOCUMENT_STATUSES.REJECTED)).toBe(true)
  })

  it('disallows jumping from pending directly to approved without processing', () => {
    expect(canTransition(DOCUMENT_STATUSES.PENDING, DOCUMENT_STATUSES.APPROVED)).toBe(false)
  })

  it('disallows modifying a claimed (terminal) document request', () => {
    expect(canTransition(DOCUMENT_STATUSES.CLAIMED, DOCUMENT_STATUSES.PROCESSING)).toBe(false)
    expect(canTransition(DOCUMENT_STATUSES.CLAIMED, DOCUMENT_STATUSES.PENDING)).toBe(false)
  })

  it('allows student to cancel only when status is pending', () => {
    expect(canStudentCancel(DOCUMENT_STATUSES.PENDING)).toBe(true)
    expect(canStudentCancel(DOCUMENT_STATUSES.PROCESSING)).toBe(false)
    expect(canStudentCancel(DOCUMENT_STATUSES.APPROVED)).toBe(false)
    expect(canStudentCancel(DOCUMENT_STATUSES.CLAIMED)).toBe(false)
  })

  it('identifies document as ready for download only when approved and file_url exists', () => {
    const approvedWithFile = { status: DOCUMENT_STATUSES.APPROVED, file_url: '/cert.pdf' }
    const approvedWithoutFile = { status: DOCUMENT_STATUSES.APPROVED, file_url: '' }
    const pendingWithFile = { status: DOCUMENT_STATUSES.PENDING, file_url: '/cert.pdf' }

    expect(isReadyForDownload(approvedWithFile)).toBe(true)
    expect(isReadyForDownload(approvedWithoutFile)).toBe(false)
    expect(isReadyForDownload(pendingWithFile)).toBe(false)
  })
})

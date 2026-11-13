import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import * as UseAuthModule from '../context/useAuth'

describe('ProtectedRoute Route Guard & Role Gates', () => {
  it('redirects unauthenticated users to /login', () => {
    vi.spyOn(UseAuthModule, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      isOfficer: false,
      isAdmin: false,
    })

    render(
      <MemoryRouter initialEntries={['/services']}>
        <Routes>
          <Route
            path="/services"
            element={
              <ProtectedRoute requireAuth={true}>
                <div>Protected Member Area</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Target</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page Target')).toBeInTheDocument()
    expect(screen.queryByText('Protected Member Area')).not.toBeInTheDocument()
  })

  it('blocks student role from accessing officer-gated routes with warning', () => {
    vi.spyOn(UseAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'usr-student' },
      profile: { role: 'student', full_name: 'Student Member' },
      loading: false,
      isOfficer: false,
      isAdmin: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAuth={true} requireOfficer={true}>
                <div>Secret Officer Console</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/Not authorized/i)).toBeInTheDocument()
    expect(screen.queryByText('Secret Officer Console')).not.toBeInTheDocument()
  })

  it('allows officer role to access officer-gated routes', () => {
    vi.spyOn(UseAuthModule, 'useAuth').mockReturnValue({
      user: { id: 'usr-officer' },
      profile: { role: 'officer', full_name: 'Executive Secretary' },
      loading: false,
      isOfficer: true,
      isAdmin: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAuth={true} requireOfficer={true}>
                <div>Secret Officer Console</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Secret Officer Console')).toBeInTheDocument()
  })
})

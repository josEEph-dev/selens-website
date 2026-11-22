import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import BackToTop from './components/BackToTop'
import ScrollToTop from './components/ScrollToTop'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import People from './pages/People'
import Projects from './pages/Projects'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Accomplishments from './pages/Accomplishments'
import AccomplishmentDetail from './pages/AccomplishmentDetail'
import Awards from './pages/Awards'
import Topnotchers from './pages/Topnotchers'
import Faq from './pages/Faq'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

// Student Portal
import PortalComingSoon from './pages/services/PortalComingSoon'
import PortalHome from './pages/portal/PortalHome'
import PortalSignUp from './pages/portal/PortalSignUp'
import PortalSignIn from './pages/portal/PortalSignIn'
import PortalForgot from './pages/portal/PortalForgot'
import PortalReset from './pages/portal/PortalReset'

// Member Services (Existing code kept, unreachable)
import ServicesHub from './pages/services/ServicesHub'
import TeechPoints from './pages/services/TeechPoints'
import DocumentRequests from './pages/services/DocumentRequests'

// Officer CMS & Management (Officer-Gated)
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNews from './pages/admin/AdminNews'
import AdminAccomplishments from './pages/admin/AdminAccomplishments'
import AdminProjects from './pages/admin/AdminProjects'
import AdminPeople from './pages/admin/AdminPeople'
import AdminTopnotchers from './pages/admin/AdminTopnotchers'
import AdminAwards from './pages/admin/AdminAwards'
import AdminFaqs from './pages/admin/AdminFaqs'
import AdminDocuments from './pages/admin/AdminDocuments'

function DashboardBackBar() {
  const { pathname } = useLocation()
  const { isOfficer } = useAuth()
  if (!isOfficer || !pathname.startsWith('/dashboard/')) return null
  return (
    <div className="bg-[#e7e8ea] pt-20 sm:pt-24 pb-2">
      <div className="selens-container flex items-center justify-between">
        <Link
          to="/dashboard"
          className="m-btn-2"
        >
          <span className="m-btn-2__label">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Officer Dashboard</span>
          </span>
        </Link>
      </div>
    </div>
  )
}

function DashboardBackToTop() {
  const { pathname } = useLocation()
  return pathname.startsWith('/dashboard') ? <BackToTop /> : null
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-selens-black text-selens-white selection:bg-selens-yellow selection:text-selens-black">
          <Navbar />
          <main className="flex-grow">
            <DashboardBackBar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/people" element={<People />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/student-activities" element={<News initialCategory="student_activities" />} />
              <Route path="/news/:slug" element={<NewsDetail />} />
              <Route path="/accomplishments" element={<Accomplishments />} />
              <Route path="/accomplishments/:slug" element={<AccomplishmentDetail />} />
              <Route path="/awards" element={<Awards />} />
              <Route path="/news/awards" element={<Awards />} />
              <Route path="/topnotchers" element={<Topnotchers />} />
              <Route path="/news/topnotchers" element={<Topnotchers />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/news/faq" element={<Faq />} />
              <Route path="/login" element={<Login />} />

              {/* Student Portal */}
              <Route path="/portal" element={<PortalHome />} />
              <Route path="/portal/signup" element={<PortalSignUp />} />
              <Route path="/portal/signin" element={<PortalSignIn />} />
              <Route path="/portal/forgot" element={<PortalForgot />} />
              <Route path="/portal/reset" element={<PortalReset />} />
              <Route path="/portal/teechpoints" element={<PortalComingSoon />} />
              <Route path="/portal/documents" element={<PortalComingSoon />} />

              {/* Legacy services paths redirect to portal */}
              <Route path="/services" element={<Navigate to="/portal" replace />} />
              <Route path="/services/teechpoints" element={<Navigate to="/portal/teechpoints" replace />} />
              <Route path="/services/documents" element={<Navigate to="/portal/documents" replace />} />

              {/* Officer Dashboard Console (Officer-Gated) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/news"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true}>
                    <AdminNews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/accomplishments"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true}>
                    <AdminAccomplishments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/projects"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true}>
                    <AdminProjects />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/people"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true} requireAdmin={true}>
                    <AdminPeople />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/topnotchers"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true} requireAdmin={true}>
                    <AdminTopnotchers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/awards"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true}>
                    <AdminAwards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/faqs"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true}>
                    <AdminFaqs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/documents"
                element={
                  <ProtectedRoute requireAuth={true} requireOfficer={true}>
                    <AdminDocuments />
                  </ProtectedRoute>
                }
              />

              {/* Legacy /admin paths redirect to /dashboard */}
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin/news" element={<Navigate to="/dashboard/news" replace />} />
              <Route path="/admin/accomplishments" element={<Navigate to="/dashboard/accomplishments" replace />} />
              <Route path="/admin/projects" element={<Navigate to="/dashboard/projects" replace />} />
              <Route path="/admin/people" element={<Navigate to="/dashboard/people" replace />} />
              <Route path="/admin/topnotchers" element={<Navigate to="/dashboard/topnotchers" replace />} />
              <Route path="/admin/awards" element={<Navigate to="/dashboard/awards" replace />} />
              <Route path="/admin/faqs" element={<Navigate to="/dashboard/faqs" replace />} />
              <Route path="/admin/documents" element={<Navigate to="/dashboard/documents" replace />} />

              {/* 404 Not Found Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <DashboardBackToTop />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

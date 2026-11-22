import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Eye,
} from 'lucide-react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false)
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false)
  const [contrastHigh, setContrastHigh] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const { user, profile, isOfficer, signOut } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setMobileMenuOpen(false)
      setNewsDropdownOpen(false)
      setServicesDropdownOpen(false)
    }, 0)
    return () => clearTimeout(timer)
  }, [location.pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNewsDropdownOpen(false)
        setServicesDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleContrast = () => {
    setContrastHigh(!contrastHigh)
    document.documentElement.classList.toggle('contrast-high')
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 text-neutral-900"
      ref={dropdownRef}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-selens-yellow focus:text-selens-black focus:font-bold focus:text-sm focus:px-4 focus:py-2.5 focus:rounded-[4px]"
      >
        Skip to main content
      </a>

      {/* University Top Utility Strip */}
      <div className="bg-neutral-950 text-neutral-300 border-b-2 border-selens-yellow">
        <div className="selens-container py-1.5 flex items-center justify-between gap-4 text-[11px] sm:text-xs">
          <span className="truncate font-sans">
            Mindanao State University – General Santos · College of Engineering
          </span>
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <a
              href="/website-assets/constitution-and-by-laws-of-selens.pdf"
              download
              className="hover:text-selens-yellow transition-colors"
            >
              Constitution (PDF)
            </a>
            <a
              href="https://msugensan.edu.ph"
              target="_blank"
              rel="noreferrer"
              className="hover:text-selens-yellow transition-colors"
            >
              msugensan.edu.ph
            </a>
            <button
              type="button"
              onClick={toggleContrast}
              title="Toggle high contrast"
              aria-label="Toggle high contrast"
              className="inline-flex items-center gap-1 hover:text-selens-yellow transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{contrastHigh ? 'Standard' : 'Contrast'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Institutional White Navigation Bar */}
      <div className="selens-container">
        <div className="flex items-center justify-between h-[68px] gap-4">
          {/* Official Seals & Department Masthead */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <img
                src="/website-assets/university-seal.png"
                alt="MSU-GSC Seal"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
              <img
                src="/website-assets/coe-logo.png"
                alt="College of Engineering Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain hidden sm:block"
              />
              <img
                src="/website-assets/selens-logo.png"
                alt="SELENS Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-2.5 sm:pl-3">
              <span className="font-serif text-base sm:text-lg font-bold text-neutral-950 tracking-tight leading-none">
                SELENS
              </span>
              <span className="text-[11px] text-neutral-600 font-sans leading-tight mt-0.5">
                Dept. of Electrical Engineering
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center space-x-1"
          >
            <Link
              to="/"
              data-active={isActive('/') && location.pathname === '/'}
              className="selens-nav-link"
            >
              Home
            </Link>

            <Link
              to="/about"
              data-active={isActive('/about')}
              className="selens-nav-link"
            >
              About
            </Link>

            <Link
              to="/people"
              data-active={isActive('/people')}
              className="selens-nav-link"
            >
              People
            </Link>

            {/* Services & Portals Dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-expanded={servicesDropdownOpen}
                data-active={isActive('/portal') || isActive('/services')}
                onClick={() => {
                  setServicesDropdownOpen(!servicesDropdownOpen)
                  setNewsDropdownOpen(false)
                }}
                className="selens-nav-link gap-1 cursor-pointer"
              >
                <span>Services &amp; Portals</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    servicesDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-neutral-200 rounded-[4px] py-1.5 z-50 shadow-lg">
                  <Link
                    to="/portal"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    Student Portal
                  </Link>
                  <Link
                    to="/portal/teechpoints"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    TEEchPoints Tracking
                  </Link>
                  <Link
                    to="/portal/documents"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    Digital Document Requests
                  </Link>
                </div>
              )}
            </div>

            {/* News & Info Dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-expanded={newsDropdownOpen}
                data-active={
                  isActive('/news') ||
                  isActive('/accomplishments') ||
                  isActive('/awards') ||
                  isActive('/topnotchers') ||
                  isActive('/faq')
                }
                onClick={() => {
                  setNewsDropdownOpen(!newsDropdownOpen)
                  setServicesDropdownOpen(false)
                }}
                className="selens-nav-link gap-1 cursor-pointer"
              >
                <span>News &amp; Info</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    newsDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {newsDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-60 bg-white border border-neutral-200 rounded-[4px] py-1.5 z-50 shadow-lg">
                  <Link
                    to="/news"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    News &amp; Events
                  </Link>
                  <Link
                    to="/news?category=student_activities"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    Student Activities
                  </Link>
                  <Link
                    to="/accomplishments"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    Accomplishments
                  </Link>
                  <Link
                    to="/topnotchers"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    Legion of Topnotchers
                  </Link>
                  <Link
                    to="/awards"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    Accreditations &amp; Awards
                  </Link>
                  <Link
                    to="/faq"
                    className="block px-4 py-2.5 text-sm text-neutral-800 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                  >
                    FAQ
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/projects"
              data-active={isActive('/projects')}
              className="selens-nav-link"
            >
              Projects
            </Link>
          </nav>

          {/* Right Action: Student Portal CTA / Signed-in User */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                {isOfficer ? (
                  <Link
                    to="/dashboard"
                    className="selens-btn-ink text-xs px-3.5 py-2 min-h-[38px]"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    className="selens-btn-ink text-xs px-3.5 py-2 min-h-[38px]"
                  >
                    Student Portal
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-neutral-700 pl-2 border-l border-neutral-200">
                  <Link
                    to="/portal"
                    className="flex items-center gap-1.5 hover:text-neutral-950 font-medium transition-colors"
                    title="Student Portal"
                  >
                    <User className="w-4 h-4 text-neutral-900" />
                    <span>{profile?.full_name?.split(' ')[0] || 'Member'}</span>
                  </Link>
                  <button
                    onClick={signOut}
                    title="Sign Out"
                    aria-label="Sign Out"
                    className="p-1.5 text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/portal"
                className="selens-btn-ink text-sm px-4 py-2 min-h-[40px]"
              >
                Student Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="lg:hidden flex items-center gap-1 shrink-0">
            <button
              onClick={toggleContrast}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-neutral-600 hover:text-neutral-950 transition-colors rounded-[4px]"
              aria-label="Toggle high contrast"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-colors rounded-[4px]"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden py-4 border-t border-neutral-200 bg-white divide-y divide-neutral-200 text-sm font-semibold"
          >
            <div className="pb-3 space-y-0.5">
              <Link
                to="/"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-neutral-950 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-950'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] ${
                  isActive('/about')
                    ? 'text-neutral-950 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-950'
                }`}
              >
                About
              </Link>
              <Link
                to="/people"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] ${
                  isActive('/people')
                    ? 'text-neutral-950 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-950'
                }`}
              >
                People
              </Link>
              <Link
                to="/projects"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] ${
                  isActive('/projects')
                    ? 'text-neutral-950 bg-neutral-100'
                    : 'text-neutral-700 hover:text-neutral-950'
                }`}
              >
                Projects &amp; Initiatives
              </Link>
            </div>

            <div className="py-3 space-y-0.5">
              <span className="px-2 pb-1 text-xs font-sans uppercase tracking-wider text-neutral-500 block">
                Services &amp; Portals
              </span>
              <Link
                to="/portal"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                Student Portal
              </Link>
              <Link
                to="/portal/teechpoints"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                TEEchPoints Tracking
              </Link>
              <Link
                to="/portal/documents"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                Digital Document Requests
              </Link>
            </div>

            <div className="py-3 space-y-0.5">
              <span className="px-2 pb-1 text-xs font-sans uppercase tracking-wider text-neutral-500 block">
                News &amp; Info
              </span>
              <Link
                to="/news"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                News &amp; Events
              </Link>
              <Link
                to="/news?category=student_activities"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                Student Activities
              </Link>
              <Link
                to="/accomplishments"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                Accomplishments
              </Link>
              <Link
                to="/topnotchers"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                Legion of Topnotchers
              </Link>
              <Link
                to="/awards"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                Accreditations &amp; Awards
              </Link>
              <Link
                to="/faq"
                className="min-h-[44px] px-3 flex items-center text-neutral-700 hover:text-neutral-950"
              >
                FAQ
              </Link>
            </div>

            <div className="pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <Link
                      to="/portal"
                      className="min-h-[44px] inline-flex items-center text-sm text-neutral-700 hover:text-neutral-950"
                    >
                      Signed in as {profile?.full_name || 'Member'}
                    </Link>
                    <button
                      onClick={signOut}
                      className="min-h-[44px] px-3 text-sm text-red-700 font-bold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                  {isOfficer ? (
                    <Link
                      to="/dashboard"
                      className="selens-btn-ink min-h-[44px] w-full text-sm"
                    >
                      Officer Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/portal"
                      className="selens-btn-ink min-h-[44px] w-full text-sm"
                    >
                      Student Portal
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  to="/portal"
                  className="selens-btn-ink min-h-[44px] w-full text-sm"
                >
                  Student Portal
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

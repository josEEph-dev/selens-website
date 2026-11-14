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

  const navLinkClass = () => 'selens-nav-link'

  return (
    <header
      className="sticky top-0 z-50 w-full bg-selens-black/85 backdrop-blur-md border-b border-selens-line"
      ref={dropdownRef}
    >
      <div className="selens-container">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Left: MSU-GSC seal + SELENS logo (plain, no glass tile) + org name */}
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <img
                src="/website-assets/university-seal.png"
                alt="MSU-GSC Seal"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
              />
              <img
                src="/website-assets/selens-logo.png"
                alt="SELENS Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-sm sm:text-base lg:text-lg font-bold text-selens-white tracking-tight group-hover:text-selens-yellow transition-colors duration-150 leading-snug truncate">
                Society of Electrical Engineering Students
              </span>
              <span className="text-xs text-neutral-400 font-sans hidden sm:block truncate">
                Mindanao State University - General Santos
              </span>
            </div>
          </Link>

          {/* Center: Desktop Nav Row */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center space-x-1"
          >
            <Link
              to="/"
              data-active={isActive('/') && location.pathname === '/'}
              className={navLinkClass()}
            >
              Home
            </Link>

            <Link
              to="/about"
              data-active={isActive('/about')}
              className={navLinkClass()}
            >
              About
            </Link>

            <Link
              to="/people"
              data-active={isActive('/people')}
              className={navLinkClass()}
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
                className={`${navLinkClass()} gap-1 cursor-pointer`}
              >
                <span>Services &amp; Portals</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    servicesDropdownOpen ? 'rotate-180 text-selens-yellow' : ''
                  }`}
                />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-selens-ink border border-selens-line rounded-[4px] py-1.5 z-50 divide-y divide-selens-line/60">
                  <div className="py-0.5">
                    <Link
                      to="/portal"
                      className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                    >
                      Student Portal
                    </Link>
                    <Link
                      to="/portal/teechpoints"
                      className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                    >
                      TEEchPoints Tracking
                    </Link>
                    <Link
                      to="/portal/documents"
                      className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                    >
                      Digital Document Requests
                    </Link>
                  </div>
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
                className={`${navLinkClass()} gap-1 cursor-pointer`}
              >
                <span>News &amp; Info</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    newsDropdownOpen ? 'rotate-180 text-selens-yellow' : ''
                  }`}
                />
              </button>

              {newsDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-60 bg-selens-ink border border-selens-line rounded-[4px] py-1.5 z-50">
                  <Link
                    to="/news"
                    className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                  >
                    News &amp; Events
                  </Link>
                  <Link
                    to="/news?category=student_activities"
                    className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                  >
                    Student Activities
                  </Link>
                  <Link
                    to="/accomplishments"
                    className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                  >
                    Accomplishments
                  </Link>
                  <Link
                    to="/topnotchers"
                    className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                  >
                    Legion of Topnotchers
                  </Link>
                  <Link
                    to="/awards"
                    className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                  >
                    Accreditations &amp; Awards
                  </Link>
                  <Link
                    to="/faq"
                    className="block px-4 py-2.5 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition-colors"
                  >
                    FAQ
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/projects"
              data-active={isActive('/projects')}
              className={navLinkClass()}
            >
              Projects &amp; Initiatives
            </Link>
          </nav>

          {/* Right Action: Accessibility + Student Portal CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={toggleContrast}
              title="Toggle high contrast"
              className="w-10 h-10 inline-flex items-center justify-center rounded-[4px] border border-transparent hover:border-selens-line text-neutral-400 hover:text-selens-yellow transition-colors cursor-pointer"
              aria-label="Toggle high contrast"
            >
              <Eye className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {isOfficer ? (
                  <Link
                    to="/dashboard"
                    className="selens-btn-primary text-xs px-3.5 py-2"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    className="selens-btn-primary text-xs px-3.5 py-2"
                  >
                    Student Portal
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-neutral-300 pl-2 border-l border-selens-line">
                  <Link
                    to="/portal"
                    className="flex items-center gap-2 hover:text-selens-yellow transition-colors"
                    title="Student Portal"
                  >
                    <User className="w-4 h-4 text-selens-yellow" />
                    <span>{profile?.full_name?.split(' ')[0] || 'Member'}</span>
                  </Link>
                  <button
                    onClick={signOut}
                    title="Sign Out"
                    aria-label="Sign Out"
                    className="p-1.5 text-neutral-400 hover:text-selens-yellow transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/portal"
                className="selens-btn-primary text-sm px-4 py-2"
              >
                Student Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Controls (44px touch targets) */}
          <div className="lg:hidden flex items-center gap-1 shrink-0">
            <button
              onClick={toggleContrast}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-neutral-400 hover:text-selens-yellow transition-colors rounded-[4px]"
              aria-label="Toggle high contrast"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-selens-white hover:text-selens-yellow transition-colors rounded-[4px]"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Polished Mobile Navigation Drawer with 44px touch targets */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="lg:hidden py-4 border-t border-selens-line bg-selens-black/95 divide-y divide-selens-line text-sm font-semibold"
          >
            <div className="pb-3 space-y-0.5">
              <Link
                to="/"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-selens-yellow bg-selens-ink'
                    : 'text-selens-white hover:text-selens-yellow'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] transition-colors ${
                  isActive('/about')
                    ? 'text-selens-yellow bg-selens-ink'
                    : 'text-selens-white hover:text-selens-yellow'
                }`}
              >
                About
              </Link>
              <Link
                to="/people"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] transition-colors ${
                  isActive('/people')
                    ? 'text-selens-yellow bg-selens-ink'
                    : 'text-selens-white hover:text-selens-yellow'
                }`}
              >
                People
              </Link>
              <Link
                to="/projects"
                className={`min-h-[44px] px-2 flex items-center rounded-[4px] transition-colors ${
                  isActive('/projects')
                    ? 'text-selens-yellow bg-selens-ink'
                    : 'text-selens-white hover:text-selens-yellow'
                }`}
              >
                Projects &amp; Initiatives
              </Link>
            </div>

            <div className="py-3 space-y-0.5">
              <span className="px-2 pb-1 text-xs font-sans uppercase tracking-wider text-neutral-400 block">
                Services &amp; Portals
              </span>
              <Link
                to="/portal"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                Student Portal
              </Link>
              <Link
                to="/portal/teechpoints"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                TEEchPoints Tracking
              </Link>
              <Link
                to="/portal/documents"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                Digital Document Requests
              </Link>
            </div>

            <div className="py-3 space-y-0.5">
              <span className="px-2 pb-1 text-xs font-sans uppercase tracking-wider text-neutral-400 block">
                News &amp; Info
              </span>
              <Link
                to="/news"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                News &amp; Events
              </Link>
              <Link
                to="/news?category=student_activities"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                Student Activities
              </Link>
              <Link
                to="/accomplishments"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                Accomplishments
              </Link>
              <Link
                to="/topnotchers"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                Legion of Topnotchers
              </Link>
              <Link
                to="/awards"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
              >
                Accreditations &amp; Awards
              </Link>
              <Link
                to="/faq"
                className="min-h-[44px] px-3 flex items-center text-selens-white hover:text-selens-yellow transition-colors"
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
                      className="min-h-[44px] inline-flex items-center text-sm text-neutral-300 hover:text-selens-yellow"
                    >
                      Signed in as {profile?.full_name || 'Member'}
                    </Link>
                    <button
                      onClick={signOut}
                      className="min-h-[44px] px-3 text-sm text-selens-yellow font-bold cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                  {isOfficer ? (
                    <Link
                      to="/dashboard"
                      className="selens-btn-primary min-h-[44px] w-full text-sm"
                    >
                      Officer Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/portal"
                      className="selens-btn-primary min-h-[44px] w-full text-sm"
                    >
                      Student Portal
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  to="/portal"
                  className="selens-btn-primary min-h-[44px] w-full text-sm"
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

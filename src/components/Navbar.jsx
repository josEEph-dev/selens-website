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
    <header className="sticky top-0 z-50 w-full bg-selens-black border-b border-selens-line" ref={dropdownRef}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Left: MSU-GSC seal + SELENS logo + single-line org name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2 shrink-0">
              <img
                src="/website-assets/university-seal.png"
                alt="MSU-GSC Seal"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
              />
              <img
                src="/website-assets/selens-logo.png"
                alt="SELENS Logo"
                className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-bold text-selens-white tracking-tight group-hover:text-selens-yellow transition leading-snug">
                Society of Electrical Engineering Students
              </span>
              <span className="text-xs text-neutral-400 font-sans hidden sm:block">
                Mindanao State University - General Santos
              </span>
            </div>
          </Link>

          {/* Center: Nav Row */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-semibold tracking-wide">
            <Link
              to="/"
              className={`px-3 py-2 transition relative ${
                isActive('/') && location.pathname === '/'
                  ? 'text-selens-yellow after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-selens-yellow'
                  : 'text-selens-white hover:text-selens-yellow'
              }`}
            >
              Home
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 transition relative ${
                isActive('/about')
                  ? 'text-selens-yellow after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-selens-yellow'
                  : 'text-selens-white hover:text-selens-yellow'
              }`}
            >
              About
            </Link>

            <Link
              to="/people"
              className={`px-3 py-2 transition relative ${
                isActive('/people')
                  ? 'text-selens-yellow after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-selens-yellow'
                  : 'text-selens-white hover:text-selens-yellow'
              }`}
            >
              People
            </Link>

            {/* Services & Portals Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setServicesDropdownOpen(!servicesDropdownOpen)
                  setNewsDropdownOpen(false)
                }}
                className={`px-3 py-2 flex items-center gap-1 transition relative ${
                  isActive('/portal') || isActive('/services')
                    ? 'text-selens-yellow after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-selens-yellow'
                    : 'text-selens-white hover:text-selens-yellow'
                }`}
              >
                <span>Services &amp; Portals</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-selens-ink border border-selens-line rounded-[4px] py-1.5 shadow-none z-50">
                  <Link
                    to="/portal"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    Student Portal
                  </Link>
                  <Link
                    to="/portal/teechpoints"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    TEEchPoints Tracking
                  </Link>
                  <Link
                    to="/portal/documents"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
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
                onClick={() => {
                  setNewsDropdownOpen(!newsDropdownOpen)
                  setServicesDropdownOpen(false)
                }}
                className={`px-3 py-2 flex items-center gap-1 transition relative ${
                  isActive('/news') || isActive('/accomplishments') || isActive('/awards') || isActive('/topnotchers') || isActive('/faq')
                    ? 'text-selens-yellow after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-selens-yellow'
                    : 'text-selens-white hover:text-selens-yellow'
                }`}
              >
                <span>News &amp; Info</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${newsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {newsDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-selens-ink border border-selens-line rounded-[4px] py-1.5 shadow-none z-50">
                  <Link
                    to="/news"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    News &amp; Events
                  </Link>
                  <Link
                    to="/news?category=student_activities"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    Student Activities
                  </Link>
                  <Link
                    to="/accomplishments"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    Accomplishments
                  </Link>
                  <Link
                    to="/topnotchers"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    Legion of Topnotchers
                  </Link>
                  <Link
                    to="/awards"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    Accreditations &amp; Awards
                  </Link>
                  <Link
                    to="/faq"
                    className="block px-4 py-2 text-sm text-selens-white hover:bg-selens-black hover:text-selens-yellow transition"
                  >
                    FAQ
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/projects"
              className={`px-3 py-2 transition relative ${
                isActive('/projects')
                  ? 'text-selens-yellow after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-selens-yellow'
                  : 'text-selens-white hover:text-selens-yellow'
              }`}
            >
              Projects &amp; Initiatives
            </Link>
          </nav>

          {/* Right Action: Accessibility + Student Portal CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleContrast}
              title="Toggle high contrast"
              className="p-2 text-neutral-400 hover:text-selens-yellow transition"
              aria-label="Toggle high contrast"
            >
              <Eye className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {isOfficer ? (
                  <Link
                    to="/dashboard"
                    className="bg-selens-yellow text-selens-black font-bold text-xs px-3 py-1.5 rounded-[4px] hover:bg-selens-white transition"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    className="bg-selens-yellow text-selens-black font-bold text-xs px-3 py-1.5 rounded-[4px] hover:bg-selens-white transition"
                  >
                    Student Portal
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <Link
                    to="/portal"
                    className="flex items-center gap-2 hover:text-selens-yellow transition"
                    title="Student Portal"
                  >
                    <User className="w-4 h-4 text-selens-yellow" />
                    <span>{profile?.full_name?.split(' ')[0] || 'Member'}</span>
                  </Link>
                  <button
                    onClick={signOut}
                    title="Sign Out"
                    className="text-neutral-400 hover:text-selens-yellow ml-1 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/portal"
                className="bg-selens-yellow text-selens-black font-bold text-sm px-4 py-2 rounded-[4px] hover:bg-selens-white transition"
              >
                Student Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleContrast}
              className="p-2 text-neutral-400 hover:text-selens-yellow"
              aria-label="Toggle high contrast"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-selens-white hover:text-selens-yellow"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-selens-line space-y-2 text-base font-semibold">
            <Link to="/" className="block py-2 text-selens-white hover:text-selens-yellow">Home</Link>
            <Link to="/about" className="block py-2 text-selens-white hover:text-selens-yellow">About</Link>
            <Link to="/people" className="block py-2 text-selens-white hover:text-selens-yellow">People</Link>
            <div className="pt-2 border-t border-selens-line">
              <span className="text-xs uppercase text-neutral-400 block pb-1">Services &amp; Portals</span>
              <Link to="/portal" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">Student Portal</Link>
              <Link to="/portal/teechpoints" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">TEEchPoints Tracking</Link>
              <Link to="/portal/documents" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">Digital Document Requests</Link>
            </div>
            <div className="pt-2 border-t border-selens-line">
              <span className="text-xs uppercase text-neutral-400 block pb-1">News &amp; Info</span>
              <Link to="/news" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">News &amp; Events</Link>
              <Link to="/accomplishments" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">Accomplishments</Link>
              <Link to="/topnotchers" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">Legion of Topnotchers</Link>
              <Link to="/awards" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">Accreditations &amp; Awards</Link>
              <Link to="/faq" className="block py-1.5 pl-2 text-selens-white hover:text-selens-yellow">FAQ</Link>
            </div>
            <Link to="/projects" className="block py-2 text-selens-white hover:text-selens-yellow">Projects &amp; Initiatives</Link>
            <div className="pt-4 border-t border-selens-line">
              {user ? (
                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between">
                    <Link to="/portal" className="text-sm text-neutral-300 hover:text-selens-yellow">
                      Signed in as {profile?.full_name || 'Member'}
                    </Link>
                    <button onClick={signOut} className="text-sm text-selens-yellow font-bold">Sign Out</button>
                  </div>
                  {isOfficer ? (
                    <Link
                      to="/dashboard"
                      className="block w-full text-center bg-selens-yellow text-selens-black font-bold text-sm px-4 py-2 rounded-[4px]"
                    >
                      Officer Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/portal"
                      className="block w-full text-center bg-selens-yellow text-selens-black font-bold text-sm px-4 py-2 rounded-[4px]"
                    >
                      Student Portal
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  to="/portal"
                  className="block text-center bg-selens-yellow text-selens-black font-bold py-2.5 rounded-[4px] hover:bg-selens-white transition"
                >
                  Student Portal
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

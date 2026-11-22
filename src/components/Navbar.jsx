import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ArrowUpRight, Eye, LogOut, User } from 'lucide-react'

const PRIMARY_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'People', to: '/people' },
  { label: 'News', to: '/news' },
  { label: 'Projects', to: '/projects' },
]

const ALL_MENU_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About SELENS', to: '/about' },
  { label: 'People & Leadership', to: '/people' },
  { label: 'News & Events', to: '/news' },
  { label: 'Student Activities', to: '/news/student-activities' },
  { label: 'Accomplishments', to: '/accomplishments' },
  { label: 'Legion of Topnotchers', to: '/topnotchers' },
  { label: 'Accreditations & Awards', to: '/awards' },
  { label: 'Projects & Initiatives', to: '/projects' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Student Portal', to: '/portal' },
]

function MenuBarsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 9h14M5 15h9" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export default function Navbar() {
  const location = useLocation()
  const { user, profile, isOfficer, signOut } = useAuth()
  const [openMenuPath, setOpenMenuPath] = useState(null)
  const [contrastHigh, setContrastHigh] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastYRef = useRef(0)

  const menuOpen = openMenuPath === location.pathname
  const isAdminRoute = location.pathname.startsWith('/dashboard')

  const closeMenu = () => setOpenMenuPath(null)
  const openMenu = () => setOpenMenuPath(location.pathname)

  // Auto-hide floating header on scroll down, reveal on scroll up (public routes)
  useEffect(() => {
    if (isAdminRoute) return undefined
    let rafId = 0
    lastYRef.current = window.scrollY

    const onScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        rafId = 0
        const y = window.scrollY
        const prev = lastYRef.current
        setScrolled(y > 24)
        if (y > 140 && y > prev + 6) {
          setHidden(true)
        } else if (y < prev - 4 || y <= 80) {
          setHidden(false)
        }
        lastYRef.current = y
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [isAdminRoute, location.pathname])

  // Escape key & scroll lock when full-screen menu is open
  useEffect(() => {
    if (!menuOpen) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuPath(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const toggleContrast = () => {
    setContrastHigh((prev) => !prev)
    document.documentElement.classList.toggle('contrast-high')
  }

  // Keep Admin routes on a clean dark sticky header so Admin CMS layout is untouched
  if (isAdminRoute) {
    return (
      <header className="sticky top-0 z-50 w-full bg-[#121315] border-b border-selens-line text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-selens-yellow focus:text-[#121315] focus:font-medium focus:text-sm focus:px-4 focus:py-2.5 focus:rounded-full"
        >
          Skip to main content
        </a>
        <div className="selens-container h-[70px] flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2.5 text-white no-underline">
            <img
              src="/website-assets/selens-logo.png"
              alt="SELENS Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-semibold tracking-[-0.04em] leading-none">
              SELENS<span className="text-selens-yellow">.</span>
            </span>
          </Link>

          <nav aria-label="Officer navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <Link to="/" className="hover:text-selens-yellow transition-colors">Public Site</Link>
            <Link to="/dashboard" className="hover:text-selens-yellow transition-colors">Dashboard</Link>
            <Link to="/portal" className="hover:text-selens-yellow transition-colors">Portal</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="hidden sm:inline text-xs text-neutral-400">
                  {profile?.full_name || user.email}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-full bg-white/10 hover:bg-selens-yellow hover:text-[#121315] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      id="nav"
      className={`hush-nav ${scrolled ? 'is-scrolled' : ''} ${hidden && !menuOpen ? 'is-hidden' : ''}`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:bg-[#ffffff] focus:text-[#121315] focus:font-medium focus:text-sm focus:px-4 focus:py-2.5 focus:rounded-full focus:pointer-events-auto"
      >
        Skip to content
      </a>

      <div className="hush-nav__bar">
        {/* Left: Circular Menu Trigger + 4 Quiet Links */}
        <div className="hush-nav__left">
          <button
            type="button"
            className="m-icon-btn"
            aria-expanded={menuOpen}
            aria-controls="hush-full-menu"
            aria-label="Open navigation menu"
            onClick={openMenu}
          >
            <span className="m-icon-btn__icon" aria-hidden="true">
              <MenuBarsIcon />
            </span>
            <span className="m-icon-btn__icon" aria-hidden="true">
              <MenuBarsIcon />
            </span>
          </button>

          <nav className="hush-nav__links" aria-label="Main navigation">
            {PRIMARY_LINKS.map((item) => {
              const active = location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`m-link m-text-4 ${active ? 'text-[#121315]' : 'text-[#121315]/80 hover:text-[#121315]'}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Center: Official SELENS Mark + Wordmark */}
        <Link to="/" className="hush-nav__logo" aria-label="SELENS Home">
          <img
            src="/website-assets/selens-logo.png"
            alt=""
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
          />
          <span className="hush-nav__word">
            SELENS<span className="text-[#FFD100]">.</span>
          </span>
        </Link>

        {/* Right: Contrast Icon + Student Portal / Dashboard Pill */}
        <div className="hush-nav__right">
          <button
            type="button"
            onClick={toggleContrast}
            title={contrastHigh ? 'Switch to standard contrast' : 'Switch to high contrast'}
            aria-label="Toggle high contrast"
            aria-pressed={contrastHigh}
            className="m-icon-btn m-icon-btn--light hidden sm:inline-grid"
          >
            <span className="m-icon-btn__icon" aria-hidden="true">
              <Eye className="w-[18px] h-[18px]" />
            </span>
            <span className="m-icon-btn__icon" aria-hidden="true">
              <Eye className="w-[18px] h-[18px]" />
            </span>
          </button>

          {user ? (
            <>
              <Link
                to={isOfficer ? '/dashboard' : '/portal'}
                className="m-btn-2"
              >
                <span className="m-btn-2__label">
                  {isOfficer ? 'Dashboard' : profile?.full_name?.split(' ')[0] || 'Portal'}
                </span>
                <span className="m-btn-2__icon" aria-hidden="true">
                  <User className="w-4 h-4" />
                </span>
              </Link>
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                aria-label="Sign out"
                className="m-icon-btn m-icon-btn--light hidden sm:inline-grid"
              >
                <span className="m-icon-btn__icon" aria-hidden="true">
                  <LogOut className="w-[17px] h-[17px]" />
                </span>
                <span className="m-icon-btn__icon" aria-hidden="true">
                  <LogOut className="w-[17px] h-[17px]" />
                </span>
              </button>
            </>
          ) : (
            <Link to="/portal" className="m-btn-2">
              <span className="m-btn-2__label">
                <span className="hidden sm:inline">Student Portal</span>
                <span className="sm:hidden">Portal</span>
              </span>
              <span className="m-btn-2__icon" aria-hidden="true">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Full-Screen Dark Menu Overlay (Hush / 8B Signature) */}
      {menuOpen && (
        <div
          id="hush-full-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="hush-menu hush-dark-scope"
        >
          <div className="hush-menu__top">
            <Link
              to="/"
              onClick={closeMenu}
              className="inline-flex items-center gap-2.5 text-white no-underline"
            >
              <img
                src="/website-assets/selens-logo.png"
                alt=""
                className="h-8 w-8 object-contain"
              />
              <span className="hush-nav__word text-white">
                SELENS<span className="text-[#FFD100]">.</span>
              </span>
            </Link>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleContrast}
                className="m-btn-2 m-btn-2--dark text-xs"
              >
                <span className="m-btn-2__label">
                  {contrastHigh ? 'Standard contrast' : 'High contrast'}
                </span>
              </button>
              <button
                type="button"
                className="m-icon-btn m-icon-btn--light"
                aria-label="Close navigation menu"
                onClick={closeMenu}
              >
                <span className="m-icon-btn__icon" aria-hidden="true">
                  <CloseIcon />
                </span>
                <span className="m-icon-btn__icon" aria-hidden="true">
                  <CloseIcon />
                </span>
              </button>
            </div>
          </div>

          <nav className="hush-menu__list" aria-label="All pages">
            {ALL_MENU_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            {isOfficer && (
              <Link to="/dashboard" onClick={closeMenu} className="!text-[#FFD100]">
                Officer Dashboard
              </Link>
            )}
          </nav>

          <div className="hush-menu__foot m-text-6">
            <a className="m-link text-white" href="mailto:iieeasteeg@msugensan.edu.ph">
              iieeasteeg@msugensan.edu.ph
            </a>
            <a
              className="m-link text-white"
              href="/website-assets/constitution-and-by-laws-of-selens.pdf"
              download
            >
              Constitution &amp; By-Laws (PDF)
            </a>
            <span>DEE Office, College of Engineering, MSU-General Santos</span>
            {user && (
              <button
                type="button"
                onClick={() => {
                  closeMenu()
                  signOut()
                }}
                className="m-link text-[#FFD100] cursor-pointer"
              >
                Sign out ({profile?.full_name?.split(' ')[0] || 'Member'})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

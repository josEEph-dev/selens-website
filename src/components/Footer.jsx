import { Link, useLocation } from 'react-router-dom'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { pathname } = useLocation()
  const isAdminRoute = pathname.startsWith('/dashboard')

  return (
    <div className={isAdminRoute ? 'bg-selens-black pt-8' : 'bg-[#e7e8ea] pt-12 sm:pt-16'}>
      <footer id="footer" className="hush-footer hush-dark-scope">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {/* Column 1: Explore */}
          <div className="grid gap-2.5 content-start">
            <h2 className="m-text-4 text-[#a2a7ae] mb-2">Explore</h2>
            <Link to="/about" className="m-link m-text-6 text-white w-fit">
              About SELENS
            </Link>
            <Link to="/people" className="m-link m-text-6 text-white w-fit">
              People &amp; Leadership
            </Link>
            <Link to="/projects" className="m-link m-text-6 text-white w-fit">
              Projects &amp; Initiatives
            </Link>
            <a
              href="/website-assets/constitution-and-by-laws-of-selens.pdf"
              download
              className="m-link m-text-6 text-white w-fit"
            >
              Constitution (PDF)
            </a>
          </div>

          {/* Column 2: News & Honors */}
          <div className="grid gap-2.5 content-start">
            <h2 className="m-text-4 text-[#a2a7ae] mb-2">News &amp; Honors</h2>
            <Link to="/news" className="m-link m-text-6 text-white w-fit">
              News &amp; Events
            </Link>
            <Link to="/news/student-activities" className="m-link m-text-6 text-white w-fit">
              Student Activities
            </Link>
            <Link to="/accomplishments" className="m-link m-text-6 text-white w-fit">
              Accomplishments
            </Link>
            <Link to="/topnotchers" className="m-link m-text-6 text-white w-fit">
              Legion of Topnotchers
            </Link>
            <Link to="/awards" className="m-link m-text-6 text-white w-fit">
              Accreditations &amp; Awards
            </Link>
            <Link to="/faq" className="m-link m-text-6 text-white w-fit">
              FAQ
            </Link>
          </div>

          {/* Column 3: Portals & Programs */}
          <div className="grid gap-2.5 content-start">
            <h2 className="m-text-4 text-[#a2a7ae] mb-2">Student Portal</h2>
            <Link to="/portal" className="m-link m-text-6 text-white w-fit">
              Portal Home
            </Link>
            <Link to="/portal/teechpoints" className="m-link m-text-6 text-white w-fit">
              TEEchPoints Tracking
            </Link>
            <Link to="/portal/documents" className="m-link m-text-6 text-white w-fit">
              Document Requests
            </Link>
            <Link to="/login" className="m-link m-text-6 text-white w-fit">
              Officer Login
            </Link>
          </div>

          {/* Column 4: Visit & Talk */}
          <div className="col-span-2 lg:col-span-1 grid gap-2.5 content-start min-w-0">
            <h2 className="m-text-4 text-[#a2a7ae] mb-2">Visit &amp; Contact</h2>
            <p className="m-text-6 text-[#a2a7ae]">
              DEE Office, College of Engineering Building<br />
              Mindanao State University – General Santos<br />
              Fatima, General Santos City, 9500
            </p>
            <a
              href="mailto:iieeasteeg@msugensan.edu.ph"
              className="m-link m-text-6 text-white w-fit max-w-full break-all mt-1"
            >
              iieeasteeg@msugensan.edu.ph
            </a>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="https://www.facebook.com/selensmsugsc"
                target="_blank"
                rel="noreferrer"
                className="m-link m-text-6 text-white w-fit"
              >
                Facebook
              </a>
              <a
                href="https://msugensan.edu.ph"
                target="_blank"
                rel="noreferrer"
                className="m-link m-text-6 text-white w-fit"
              >
                msugensan.edu.ph
              </a>
            </div>
          </div>
        </div>

        {/* Giant Edge-to-Edge Wordmark (Hush Signature) */}
        <p className="hush-ft-word" aria-hidden="true">
          SELENS<span className="text-[#FFD100]">.</span>
        </p>

        {/* Bottom Legal & Official Seals */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10 pt-5 m-text-6 text-[#a2a7ae]">
          <div className="flex items-center gap-3">
            <img
              src="/website-assets/university-seal.png"
              alt="MSU-GSC Seal"
              className="h-7 w-7 object-contain"
            />
            <img
              src="/website-assets/coe-logo.png"
              alt="College of Engineering Logo"
              className="h-7 w-7 object-contain"
            />
            <img
              src="/website-assets/selens-logo.png"
              alt="SELENS Logo"
              className="h-7 w-7 object-contain"
            />
            <span className="text-white/90">
              Society of Electrical Engineering Students
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>&copy; {currentYear} SELENS · MSU-General Santos</span>
            <span>A.Y. {CURRENT_ACADEMIC_YEAR}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

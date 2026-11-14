import { Link } from 'react-router-dom'
import { Mail, MapPin, Globe } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

function FacebookIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-selens-surface border-t border-selens-line text-neutral-300 text-sm">
      <div className="selens-container py-12 sm:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 divide-y divide-selens-line md:divide-y-0">
          {/* Org Identity & Contact */}
          <div className="lg:col-span-2 space-y-4 pb-2 md:pb-0">
            <div className="flex items-center gap-3">
              <img
                src="/website-assets/university-seal.png"
                alt="MSU-GSC Seal"
                className="h-10 w-10 object-contain"
              />
              <img
                src="/website-assets/selens-logo.png"
                alt="SELENS Logo"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-selens-white">
                Society of Electrical Engineering Students
              </h3>
              <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
                College of Engineering, Mindanao State University - General Santos<br />
                Fatima, General Santos City, 9500 Philippines
              </p>
            </div>
            <div className="space-y-2 text-xs text-neutral-400 pt-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-selens-yellow shrink-0" />
                <a
                  href="mailto:iieeasteeg@msugensan.edu.ph"
                  className="hover:text-selens-yellow transition-colors"
                >
                  iieeasteeg@msugensan.edu.ph
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-selens-yellow shrink-0" />
                <span>DEE Office, College of Engineering Building</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/selensmsugsc"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 inline-flex items-center justify-center border border-selens-line rounded-[4px] text-neutral-300 hover:text-selens-yellow hover:border-selens-yellow transition-colors"
                aria-label="Facebook Page"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://msugensan.edu.ph"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 inline-flex items-center justify-center border border-selens-line rounded-[4px] text-neutral-300 hover:text-selens-yellow hover:border-selens-yellow transition-colors"
                aria-label="MSU-GSC Official Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1: About */}
          <div className="space-y-3 pt-6 md:pt-0 md:border-l md:border-selens-line md:pl-6">
            <h4 className="font-serif font-bold text-selens-white text-sm">
              About
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link to="/about" className="hover:text-selens-yellow transition-colors">
                  About SELENS
                </Link>
              </li>
              <li>
                <Link to="/people" className="hover:text-selens-yellow transition-colors">
                  People &amp; Advisers
                </Link>
              </li>
              <li>
                <a
                  href="/website-assets/constitution-and-by-laws-of-selens.pdf"
                  download
                  className="hover:text-selens-yellow transition-colors"
                >
                  Constitution (PDF)
                </a>
              </li>
              <li>
                <Link to="/about#mission" className="hover:text-selens-yellow transition-colors">
                  Mission &amp; Vision
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Services & Portals */}
          <div className="space-y-3 pt-6 md:pt-0 lg:border-l lg:border-selens-line lg:pl-6">
            <h4 className="font-serif font-bold text-selens-white text-sm">
              Services &amp; Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link to="/portal" className="hover:text-selens-yellow transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link to="/portal/teechpoints" className="hover:text-selens-yellow transition-colors">
                  TEEchPoints Tracking
                </Link>
              </li>
              <li>
                <Link to="/portal/documents" className="hover:text-selens-yellow transition-colors">
                  Document Requests
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: News & Info */}
          <div className="space-y-3 pt-6 md:pt-0 md:border-l md:border-selens-line md:pl-6">
            <h4 className="font-serif font-bold text-selens-white text-sm">
              News &amp; Info
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link to="/news" className="hover:text-selens-yellow transition-colors">
                  News &amp; Events
                </Link>
              </li>
              <li>
                <Link
                  to="/news?category=student_activities"
                  className="hover:text-selens-yellow transition-colors"
                >
                  Student Activities
                </Link>
              </li>
              <li>
                <Link to="/topnotchers" className="hover:text-selens-yellow transition-colors">
                  Legion of Topnotchers
                </Link>
              </li>
              <li>
                <Link to="/awards" className="hover:text-selens-yellow transition-colors">
                  Accreditations &amp; Awards
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-selens-yellow transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Projects & Initiatives */}
          <div className="space-y-3 pt-6 md:pt-0 lg:border-l lg:border-selens-line lg:pl-6">
            <h4 className="font-serif font-bold text-selens-white text-sm">
              Projects &amp; Initiatives
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link to="/projects#electrostock" className="hover:text-selens-yellow transition-colors">
                  ElectroStock
                </Link>
              </li>
              <li>
                <Link to="/projects#eengiquest" className="hover:text-selens-yellow transition-colors">
                  EEngiquest
                </Link>
              </li>
              <li>
                <Link to="/projects#teechpoints" className="hover:text-selens-yellow transition-colors">
                  TEEchPoints Initiative
                </Link>
              </li>
              <li>
                <Link to="/projects#outreach" className="hover:text-selens-yellow transition-colors">
                  Community Outreach
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="border-t border-selens-line pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
          <div>
            &copy; {currentYear} Society of Electrical Engineering Students, MSU-GSC • A.Y. {CURRENT_ACADEMIC_YEAR}
          </div>
        </div>
      </div>
    </footer>
  )
}

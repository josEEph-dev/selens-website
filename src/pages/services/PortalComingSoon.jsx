import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/SharedUI'

export default function PortalComingSoon() {
  return (
    <div id="main-content" className="selens-paper-page min-h-[75vh]">
      <PageHeader
        eyebrow="Member Services"
        title="Student Portal"
        description="Online student services, TEEchPoints tracking, and digital document requests for SELENS members."
      />

      <div className="selens-container py-16 flex justify-center">
        <div className="max-w-xl w-full border-y-2 border-selens-paper-ink text-center space-y-6 py-12 px-4">
          <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-paper-ink">
            Coming Soon
          </div>
          <div className="w-12 h-1 bg-selens-yellow mx-auto" aria-hidden="true" />
          <p className="text-base text-selens-paper-muted font-sans leading-relaxed max-w-md mx-auto">
            Online student services, TEEchPoints tracking, and document requests will be available soon.
          </p>
          <div className="pt-2">
            <Link to="/" className="selens-btn-ink">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

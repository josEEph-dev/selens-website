import { Link } from 'react-router-dom'
import { PageHeader } from '../components/SharedUI'

export default function NotFound() {
  return (
    <div id="main-content" className="selens-paper-page min-h-[70vh]">
      <PageHeader
        eyebrow="Error 404"
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
      />
      <div className="selens-container py-16">
        <div className="max-w-xl mx-auto border-y-2 border-selens-paper-ink text-center space-y-6 py-12">
          <div className="font-serif font-bold text-6xl text-selens-paper-ink">
            404
          </div>
          <div className="w-12 h-1 bg-selens-yellow mx-auto" aria-hidden="true" />
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-selens-paper-ink">
              Looking for something else?
            </h2>
            <p className="text-sm text-selens-paper-muted max-w-md mx-auto">
              Return to our homepage to explore the latest news, officer directory, or student portal.
            </p>
          </div>
          <div>
            <Link to="/" className="selens-btn-ink">
              Return to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

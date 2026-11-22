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
        <div className="max-w-xl mx-auto border border-neutral-200 bg-neutral-50 rounded-[4px] text-center space-y-5 py-12 px-6">
          <div className="font-serif font-bold text-6xl text-neutral-950">
            404
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-neutral-950">
              Looking for something else?
            </h2>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
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

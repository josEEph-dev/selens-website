import { Link } from 'react-router-dom'
import { PageHeader } from '../components/SharedUI'

export default function NotFound() {
  return (
    <div id="main-content" className="selens-paper-page min-h-[75vh]">
      <PageHeader
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
      />
      <div className="selens-container py-12 sm:py-16">
        <div className="max-w-xl mx-auto m-panel-light m-shadow text-center space-y-5 py-12 px-7">
          <div className="m-text-2 text-[#121315]">
            404<span className="text-[#FFD100]">.</span>
          </div>
          <div className="space-y-2">
            <h2 className="m-text-5 text-[#121315]">
              Looking for something else?
            </h2>
            <p className="m-text-6 text-[#4d5158] max-w-md mx-auto">
              Return to our homepage to explore the latest news, officer directory, or student portal.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/" className="m-btn">
              <span className="m-btn__label">Return to home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

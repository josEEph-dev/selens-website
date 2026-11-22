import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/SharedUI'

export default function PortalComingSoon() {
  return (
    <div id="main-content" className="selens-paper-page min-h-[75vh]">
      <PageHeader
        title="Student Portal"
        description="Online student services, TEEchPoints tracking, and digital document requests for SELENS members."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <div className="max-w-xl w-full m-panel-light m-shadow text-center space-y-5 py-12 px-7">
          <div className="m-text-3 text-[#121315]">
            Coming soon<span className="text-[#FFD100]">.</span>
          </div>
          <p className="m-text text-[#4d5158] max-w-md mx-auto">
            Online student services, TEEchPoints tracking, and document requests will be available soon.
          </p>
          <div className="pt-2">
            <Link to="/" className="m-btn">
              <span className="m-btn__label">Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

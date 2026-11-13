import { PageHeader, PrimaryButton, Card } from '../../components/SharedUI'

export default function PortalComingSoon() {
  return (
    <div className="bg-selens-black text-selens-white min-h-[75vh]">
      <PageHeader
        title="Student Portal"
        description="Online student services, TEEchPoints tracking, and digital document requests for SELENS members."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 flex justify-center">
        <Card className="max-w-xl w-full text-center space-y-6 py-12 px-6 sm:px-10" hover={false}>
          <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
            Coming Soon
          </div>
          <p className="text-base text-neutral-300 font-sans leading-relaxed">
            Online student services, TEEchPoints tracking, and document requests will be available soon.
          </p>
          <div className="pt-2">
            <PrimaryButton to="/">
              Return to Home
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  )
}

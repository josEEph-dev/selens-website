import { PageHeader, Card, PrimaryButton } from '../components/SharedUI'

export default function NotFound() {
  return (
    <div className="bg-selens-black text-selens-white min-h-[70vh]">
      <PageHeader
        title="Page not found"
        description="The page you are looking for does not exist or has been moved."
      />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16">
        <Card className="max-w-xl mx-auto text-center space-y-6 py-12">
          <div className="font-serif font-bold text-6xl text-selens-yellow">
            404
          </div>
          <div className="space-y-2">
            <h2 className="font-serif font-bold text-xl text-selens-white">
              Looking for something else?
            </h2>
            <p className="text-sm text-neutral-300">
              Return to our homepage to explore the latest news, officer directory, or student portal.
            </p>
          </div>
          <PrimaryButton to="/">
            Return to home
          </PrimaryButton>
        </Card>
      </div>
    </div>
  )
}

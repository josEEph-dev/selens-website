import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { PageHeader, Card, PrimaryButton } from '../../components/SharedUI'
import { Sparkles, FileText, ArrowRight, User } from 'lucide-react'

export default function ServicesHub() {
  const { profile } = useAuth()

  const portals = [
    {
      title: 'TEEchPoints engagement tracker',
      desc: 'Track your participation points across general assemblies, technical workshops, EEngiquest, and community outreach. Points reflect active membership standing for A.Y. 2026–2027.',
      link: '/services/teechpoints',
      icon: Sparkles,
      cta: 'View TEEchPoints ledger',
    },
    {
      title: 'Digital document requests',
      desc: 'Request official certificates of good standing, active membership certifications, and semester clearance documents online. Check real-time review status directly from your dashboard.',
      link: '/services/documents',
      icon: FileText,
      cta: 'Request a document',
    },
  ]

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="Services &amp; Portals"
        description="Access your member tools, check active TEEchPoints standing, and request official organization documents."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* User Status Card */}
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6" hover={false}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[4px] bg-selens-black border border-selens-line text-selens-yellow flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-selens-white">
                {profile?.full_name || 'SELENS Member'}
              </h2>
              <p className="text-xs text-neutral-400 font-sans">
                Student ID: {profile?.student_id || 'Not specified'} • Status: Enrolled for A.Y. 2026–2027
              </p>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold px-3 py-1 bg-selens-yellow text-selens-black rounded-[4px] capitalize">
              {profile?.role || 'Member'} account
            </span>
          </div>
        </Card>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon
            return (
              <Card
                key={portal.title}
                className="p-6 sm:p-8 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line text-selens-yellow flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-selens-white">
                    {portal.title}
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                    {portal.desc}
                  </p>
                </div>
                <div className="pt-2">
                  <PrimaryButton to={portal.link} className="gap-2">
                    <span>{portal.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </PrimaryButton>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

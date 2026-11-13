import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { dataApi } from '../../lib/supabase'
import { PageHeader, Card, Section } from '../../components/SharedUI'
import { ArrowLeft, Sparkles, Calendar } from 'lucide-react'

export default function TeechPoints() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await dataApi.list('teechpoints_logs', { orderBy: 'created_at', ascending: false })
        setLogs(data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalPoints = logs.reduce((sum, item) => sum + item.points, 0)

  const getTier = (points) => {
    if (points >= 300) return { name: 'Gold Tier', min: '300+ pts' }
    if (points >= 150) return { name: 'Silver Tier', min: '150–299 pts' }
    return { name: 'Bronze Tier', min: '0–149 pts' }
  }

  const tier = getTier(totalPoints)

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <div className="border-b border-selens-line py-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-selens-yellow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to services &amp; portals</span>
          </Link>
        </div>
      </div>

      <PageHeader
        title="TEEchPoints Engagement Tracker"
        description="Review your active participation score, event attendances, and chapter recognition standing for A.Y. 2026–2027."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Scorecard Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="space-y-2 p-6">
            <span className="text-xs text-neutral-400 font-sans block">Total Points</span>
            <div className="font-serif font-bold text-4xl sm:text-5xl text-selens-yellow">
              {totalPoints}
            </div>
            <p className="text-sm text-neutral-300 font-sans">
              Cumulative engagement points verified this academic year.
            </p>
          </Card>

          <Card className="space-y-2 p-6">
            <span className="text-xs text-neutral-400 font-sans block">Membership Tier</span>
            <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-white">
              {tier.name}
            </div>
            <p className="text-sm text-neutral-300 font-sans">
              Threshold: {tier.min} required for honors recognition.
            </p>
          </Card>

          <Card className="space-y-2 p-6">
            <span className="text-xs text-neutral-400 font-sans block">Member Profile</span>
            <div className="font-serif font-bold text-xl text-selens-white truncate">
              {profile?.full_name || 'Active Student Member'}
            </div>
            <p className="text-sm text-neutral-300 font-sans">
              ID: {profile?.student_id || 'Not specified'} • A.Y. 2026–2027
            </p>
          </Card>
        </div>

        {/* Activity Ledger */}
        <Section
          title="Recorded activities"
          description="A chronological record of verified workshop attendances, competitions, and volunteer sessions."
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400">
              No participation points recorded yet for this semester.
            </div>
          ) : (
            <div className="divide-y divide-selens-line border-y border-selens-line bg-selens-black rounded-[4px]">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 sm:p-6 hover:bg-selens-ink transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-xs text-selens-yellow font-semibold capitalize block">
                      {log.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-selens-white">
                      {log.activity_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(log.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="shrink-0 sm:text-right">
                    <span className="font-serif font-bold text-2xl text-selens-yellow">
                      +{log.points}
                    </span>
                    <span className="text-xs text-neutral-400 block font-sans">points</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

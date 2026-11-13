import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Card, Section } from '../components/SharedUI'
import { Award, User } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

export default function Topnotchers() {
  const [topnotchers, setTopnotchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: queryError } = await supabase
          .from('topnotchers')
          .select('id, full_name, exam_year, rank, rating, photo_url, batch')
          .order('rank', { ascending: true })

        if (queryError) throw queryError
        if (!ignore) setTopnotchers(data || [])
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load topnotchers.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="Legion of Topnotchers"
        description="Celebrating our Electrical Engineering graduates who achieved national top 10 ranks in the Professional Regulation Commission (PRC) Licensure Examinations."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-2">
            <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
              {loading ? '...' : topnotchers.length}
            </div>
            <h3 className="font-serif font-bold text-lg text-selens-white">
              Board topnotchers on record
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Alumni who placed among the top examinees in national licensure exams.
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
              Top 1
            </div>
            <h3 className="font-serif font-bold text-lg text-selens-white">
              Highest national ranking
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Achieved in the PRC Registered Electrical Engineer Licensure Examination.
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
              A.Y. {CURRENT_ACADEMIC_YEAR}
            </div>
            <h3 className="font-serif font-bold text-lg text-selens-white">
              Sustained academic legacy
            </h3>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Continued peer mentorship and review sessions supporting each graduating cohort.
            </p>
          </Card>
        </div>

        {/* Directory of Topnotchers */}
        <Section
          title="Roll of honor"
          description="Honoring MSU-General Santos electrical engineering top examinees."
        >
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-red-400">
              {error}
            </div>
          ) : topnotchers.length === 0 ? (
            <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400">
              No topnotcher records on file currently.
            </div>
          ) : (
            <div className="space-y-4">
              {topnotchers.map((top) => (
                <Card
                  key={top.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                  <div className="flex items-start sm:items-center gap-5">
                    {/* Photo with neutral placeholder fallback */}
                    <div className="w-14 h-14 rounded-[4px] bg-selens-black border border-selens-line overflow-hidden shrink-0 flex items-center justify-center">
                      {top.photo_url ? (
                        <img
                          src={top.photo_url}
                          alt={top.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-selens-yellow font-serif font-bold text-base bg-selens-ink">
                          {top.full_name ? (
                            top.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                          ) : (
                            <User className="w-6 h-6 text-neutral-500" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rank Indicator */}
                    <div className="shrink-0 w-14 h-14 rounded-[4px] bg-selens-black border border-selens-line flex flex-col items-center justify-center">
                      <span className="text-[10px] text-neutral-400 uppercase font-sans">Rank</span>
                      <span className="font-serif font-bold text-2xl text-selens-yellow leading-none">
                        {top.rank}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif font-bold text-lg sm:text-xl text-selens-white">
                        {top.full_name}
                      </h3>
                      <p className="text-sm text-neutral-300 font-sans">
                        {top.exam_year || 'PRC Licensure Examination'}
                        {top.batch && (
                          <span className="ml-2 text-neutral-400">• Batch {top.batch}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Rating Callout */}
                  {top.rating != null && (
                    <div className="shrink-0 sm:text-right border-t sm:border-t-0 border-selens-line pt-3 sm:pt-0">
                      <span className="text-xs text-neutral-400 block font-sans">Rating</span>
                      <span className="font-serif font-bold text-2xl text-selens-yellow">
                        {top.rating}%
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

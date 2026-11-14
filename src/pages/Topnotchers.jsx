import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Card, Section } from '../components/SharedUI'
import { ImageFrame } from '../components/ui'
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
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="Legion of Topnotchers"
        description="Celebrating our Electrical Engineering graduates who achieved national top 10 ranks in the Professional Regulation Commission (PRC) Licensure Examinations."
      />

      <div className="selens-container py-12 sm:py-16 space-y-14">
        {/* Highlight Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-fr gap-5 sm:gap-6">
          <Card className="h-full p-6 flex flex-col justify-between space-y-2">
            <div className="space-y-2">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
                {loading ? '...' : topnotchers.length}
              </div>
              <h3 className="font-serif font-bold text-lg text-selens-white">
                Board topnotchers on record
              </h3>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                Alumni who placed among the top examinees in national licensure exams.
              </p>
            </div>
          </Card>

          <Card className="h-full p-6 flex flex-col justify-between space-y-2">
            <div className="space-y-2">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
                Top 1
              </div>
              <h3 className="font-serif font-bold text-lg text-selens-white">
                Highest national ranking
              </h3>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                Achieved in the PRC Registered Electrical Engineer Licensure Examination.
              </p>
            </div>
          </Card>

          <Card className="h-full p-6 flex flex-col justify-between space-y-2">
            <div className="space-y-2">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
                A.Y. {CURRENT_ACADEMIC_YEAR}
              </div>
              <h3 className="font-serif font-bold text-lg text-selens-white">
                Sustained academic legacy
              </h3>
              <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                Continued peer mentorship and review sessions supporting each graduating cohort.
              </p>
            </div>
          </Card>
        </div>

        {/* Directory of Topnotchers */}
        <Section
          title="Roll of honor"
          description="Honoring MSU-General Santos electrical engineering top examinees."
        >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse"
                />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-5 sm:gap-6">
              {topnotchers.map((top) => (
                <article
                  key={top.id}
                  className="selens-card h-full overflow-hidden flex flex-col"
                >
                  <ImageFrame src={top.photo_url} alt={top.full_name} />

                  <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[2px] bg-selens-black border border-selens-line font-serif font-bold text-xs text-selens-yellow">
                          Rank {top.rank}
                        </span>
                        {top.rating != null && (
                          <span className="font-serif font-bold text-base text-selens-yellow">
                            {top.rating}%
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif selens-fluid-h3 font-bold text-selens-white line-clamp-2 min-h-[2.7em] break-words">
                        {top.full_name}
                      </h3>

                      <p className="text-sm text-neutral-300 font-sans line-clamp-2">
                        {top.exam_year || 'PRC Licensure Examination'}
                        {top.batch && (
                          <span className="text-neutral-400"> • Batch {top.batch}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

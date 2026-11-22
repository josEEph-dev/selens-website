import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Section } from '../components/SharedUI'
import { Reveal } from '../components/ui'
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
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        title="Legion of Topnotchers"
        description="Celebrating our Electrical Engineering graduates who achieved national top 10 ranks in the Professional Regulation Commission (PRC) Licensure Examinations."
      />

      <div className="selens-container py-12 sm:py-16 space-y-14">
        {/* Real MSU-GSC REELE Performance + Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-neutral-200 rounded-[4px] bg-neutral-50 p-5 sm:p-7">
          <div className="lg:col-span-7">
            <img
              src="/website-assets/passing-rates.png"
              alt="MSU-GSC REELE University Passing Rates from April 2022 to April 2026"
              className="w-full h-auto rounded-[4px] border border-neutral-200 bg-white block"
            />
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-1.5">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-neutral-950">
                Sustained National Board Performance
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed">
                MSU-General Santos consistently ranks among the top-performing Electrical Engineering schools in the Philippines in the PRC Registered Electrical Engineer Licensure Examination (REELE).
              </p>
            </div>

            <dl className="divide-y divide-neutral-200 border-t border-b border-neutral-200 text-sm">
              <div className="py-2.5 flex items-baseline justify-between gap-4">
                <dt className="text-neutral-600">April 2025 REELE</dt>
                <dd className="font-bold text-neutral-950 text-right">
                  92.16% · Top 2 National
                </dd>
              </div>
              <div className="py-2.5 flex items-baseline justify-between gap-4">
                <dt className="text-neutral-600">April 2026 REELE</dt>
                <dd className="font-bold text-neutral-950 text-right">
                  90.32% · Top 4 National
                </dd>
              </div>
              <div className="py-2.5 flex items-baseline justify-between gap-4">
                <dt className="text-neutral-600">Topnotchers on record</dt>
                <dd className="font-bold text-neutral-950 tabular-nums">
                  {loading ? '—' : topnotchers.length}
                </dd>
              </div>
              <div className="py-2.5 flex items-baseline justify-between gap-4">
                <dt className="text-neutral-600">Academic Year</dt>
                <dd className="font-semibold text-neutral-900">
                  A.Y. {CURRENT_ACADEMIC_YEAR}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Roll of Honor Table / Ledger */}
        <Section
          tone="paper"
          title="Roll of Honor"
          description="Honoring MSU-General Santos Electrical Engineering board top examinees."
        >
          {loading ? (
            <div className="divide-y divide-neutral-200 border-t border-neutral-200">
              {[1, 2, 3].map((n) => (
                <div key={n} className="py-5 flex items-center gap-6 animate-pulse">
                  <div className="w-16 h-8 bg-neutral-100 rounded-[3px]" />
                  <div className="flex-1 h-8 bg-neutral-100 rounded-[3px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-red-50 rounded-[4px] p-8 text-center text-sm text-red-800">
              {error}
            </div>
          ) : topnotchers.length === 0 ? (
            <div className="border-y border-neutral-200 py-10 text-center text-sm text-neutral-600">
              No topnotcher records on file currently.
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 border-b border-neutral-200">
              {topnotchers.map((top, idx) => {
                const rankLabel = top.rank != null ? `Rank ${top.rank}` : 'Topnotcher'
                const initials = top.full_name
                  ? top.full_name
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                  : 'EE'

                return (
                  <Reveal
                    key={top.id}
                    index={idx}
                    className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors px-2 sm:px-3"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full border border-neutral-200 bg-neutral-950 overflow-hidden shrink-0 flex items-center justify-center">
                        {top.photo_url ? (
                          <img
                            src={top.photo_url}
                            alt={top.full_name}
                            loading="lazy"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="font-serif font-bold text-sm text-selens-yellow">
                            {initials}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold bg-selens-yellow text-neutral-950 px-2 py-0.5 rounded-[2px]">
                            {rankLabel}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {top.exam_year || 'PRC Licensure Examination'}
                            {top.batch ? ` · Batch ${top.batch}` : ''}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-neutral-950 break-words leading-snug">
                          {top.full_name}
                        </h3>
                      </div>
                    </div>

                    {top.rating != null && (
                      <div className="sm:text-right shrink-0 pl-[4.5rem] sm:pl-0">
                        <span className="text-xs text-neutral-500 block">Rating</span>
                        <span className="font-serif font-bold text-xl text-neutral-950 tabular-nums">
                          {top.rating}%
                        </span>
                      </div>
                    )}
                  </Reveal>
                )
              })}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

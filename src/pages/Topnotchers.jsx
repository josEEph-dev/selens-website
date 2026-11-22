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

      <div className="selens-container py-10 sm:py-16 space-y-16">
        {/* Split White Chart + Dark Performance Summary (Hush Twin Panel Pattern) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 m-panel-light p-5 sm:p-7 flex flex-col justify-between gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="m-text-5 text-[#121315]">PRC REELE Passing Rates</h2>
              <span className="m-text-6 text-[#4d5158]">2022 – 2026</span>
            </div>
            <img
              src="/website-assets/passing-rates.png"
              alt="MSU-GSC REELE University Passing Rates from April 2022 to April 2026"
              className="w-full h-auto rounded-[16px] block"
            />
          </div>

          <div className="lg:col-span-5 m-panel-dark hush-dark-scope p-7 sm:p-9 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="m-text-7 text-white">
                92.16%<span className="text-[#FFD100]">.</span>
              </div>
              <h2 className="m-text-5 text-white">
                Sustained national board performance
              </h2>
              <p className="m-text-6 text-[#a2a7ae]">
                MSU-General Santos consistently ranks among the top-performing Electrical Engineering schools in the Philippines in the PRC Registered Electrical Engineer Licensure Examination (REELE).
              </p>
            </div>

            <dl className="divide-y divide-white/15 border-t border-b border-white/15 m-text-6">
              <div className="py-3 flex items-baseline justify-between gap-4">
                <dt className="text-[#a2a7ae]">April 2025 REELE</dt>
                <dd className="font-medium text-white text-right">
                  92.16% · Top 2 National
                </dd>
              </div>
              <div className="py-3 flex items-baseline justify-between gap-4">
                <dt className="text-[#a2a7ae]">April 2026 REELE</dt>
                <dd className="font-medium text-white text-right">
                  90.32% · Top 4 National
                </dd>
              </div>
              <div className="py-3 flex items-baseline justify-between gap-4">
                <dt className="text-[#a2a7ae]">Topnotchers on record</dt>
                <dd className="font-medium text-[#FFD100] tabular-nums">
                  {loading ? '—' : topnotchers.length}
                </dd>
              </div>
              <div className="py-3 flex items-baseline justify-between gap-4">
                <dt className="text-[#a2a7ae]">Academic Year</dt>
                <dd className="font-medium text-white">
                  A.Y. {CURRENT_ACADEMIC_YEAR}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Roll of Honor — Pure White 20px Floating Cards (Hush Wall Pattern) */}
        <Section
          tone="paper"
          title="Roll of Honor."
          description="Honoring MSU-General Santos Electrical Engineering board top examinees."
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 bg-white rounded-[20px] animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="m-surface text-center m-text-6 text-red-700">
              {error}
            </div>
          ) : topnotchers.length === 0 ? (
            <div className="m-surface py-12 text-center m-text-6 text-[#4d5158]">
              No topnotcher records on file currently.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className="m-surface m-shadow flex flex-col justify-between gap-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFD100] text-[#121315] m-text-4">
                        {rankLabel}
                      </span>
                      {top.rating != null && (
                        <div className="text-right">
                          <span className="m-text-7 text-[#121315] tabular-nums block">
                            {top.rating}%
                          </span>
                          <span className="m-text-6 text-[#4d5158]">Rating</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-[#121315] overflow-hidden shrink-0 flex items-center justify-center">
                        {top.photo_url ? (
                          <img
                            src={top.photo_url}
                            alt={top.full_name}
                            loading="lazy"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="m-text-4 text-[#FFD100]">
                            {initials}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h3 className="m-text-5 text-[#121315] break-words">
                          {top.full_name}
                        </h3>
                        <p className="m-text-6 text-[#4d5158]">
                          {top.exam_year || 'PRC Licensure Examination'}
                          {top.batch ? ` · Batch ${top.batch}` : ''}
                        </p>
                      </div>
                    </div>
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

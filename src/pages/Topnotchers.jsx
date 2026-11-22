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
        eyebrow="PRC Licensure Honor Roll"
        title="Legion of Topnotchers"
        description="Celebrating our Electrical Engineering graduates who achieved national top 10 ranks in the Professional Regulation Commission (PRC) Licensure Examinations."
      />

      <div className="selens-container py-12 sm:py-16 space-y-16">
        {/* Editorial Summary Ledger (Hairline-ruled, zero boxed cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-selens-paper-rule border-y-2 border-selens-paper-ink">
          <Reveal index={0} className="py-6 md:pr-8 space-y-2">
            <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-paper-ink tabular-nums">
              {loading ? '—' : topnotchers.length}
            </div>
            <h3 className="font-serif font-bold text-base text-selens-paper-ink">
              Board topnotchers on record
            </h3>
            <p className="text-sm text-selens-paper-muted font-sans leading-relaxed">
              Alumni who placed among the top examinees in national licensure exams.
            </p>
          </Reveal>

          <Reveal index={1} className="py-6 md:px-8 space-y-2">
            <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-paper-ink">
              Top 1
            </div>
            <h3 className="font-serif font-bold text-base text-selens-paper-ink">
              Highest national ranking
            </h3>
            <p className="text-sm text-selens-paper-muted font-sans leading-relaxed">
              Achieved in the PRC Registered Electrical Engineer Licensure Examination.
            </p>
          </Reveal>

          <Reveal index={2} className="py-6 md:pl-8 space-y-2">
            <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-paper-ink">
              A.Y. {CURRENT_ACADEMIC_YEAR}
            </div>
            <h3 className="font-serif font-bold text-base text-selens-paper-ink">
              Sustained academic legacy
            </h3>
            <p className="text-sm text-selens-paper-muted font-sans leading-relaxed">
              Continued peer mentorship and review sessions supporting each graduating cohort.
            </p>
          </Reveal>
        </div>

        {/* Prestigious Honor Roll Ledger */}
        <Section
          tone="paper"
          title="Roll of honor"
          description="Honoring MSU-General Santos electrical engineering top examinees."
        >
          {loading ? (
            <div className="divide-y divide-selens-paper-rule border-t-2 border-selens-paper-ink">
              {[1, 2, 3].map((n) => (
                <div key={n} className="py-6 flex items-center gap-6 animate-pulse">
                  <div className="w-16 h-10 bg-selens-paper-alt rounded-[2px]" />
                  <div className="flex-1 h-8 bg-selens-paper-alt rounded-[2px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border-y border-red-300 bg-red-50 p-8 text-center text-sm text-red-800">
              {error}
            </div>
          ) : topnotchers.length === 0 ? (
            <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted">
              No topnotcher records on file currently.
            </div>
          ) : (
            <div className="divide-y divide-selens-paper-rule border-t-2 border-b border-selens-paper-ink">
              {topnotchers.map((top, idx) => {
                const rankLabel =
                  top.rank != null ? String(top.rank).padStart(2, '0') : '—'
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
                    className="py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 hover:bg-selens-paper-alt/70 transition-colors px-2 sm:px-4"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                      {/* Oversized Editorial Rank Numeral */}
                      <div className="w-14 sm:w-16 shrink-0">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-selens-paper-muted block">
                          Rank
                        </span>
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-selens-paper-ink leading-none block mt-0.5">
                          {rankLabel}
                        </span>
                        <span className="block w-8 h-1 bg-selens-yellow mt-1.5" aria-hidden="true" />
                      </div>

                      {/* Portrait or Crisp Monogram */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-selens-paper-rule bg-selens-paper-ink overflow-hidden shrink-0 flex items-center justify-center">
                        {top.photo_url ? (
                          <img
                            src={top.photo_url}
                            alt={top.full_name}
                            loading="lazy"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <span className="font-serif font-bold text-sm sm:text-base text-selens-yellow">
                            {initials}
                          </span>
                        )}
                      </div>

                      {/* Honoree Name & Exam Details */}
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-selens-paper-ink break-words leading-snug">
                          {top.full_name}
                        </h3>
                        <p className="text-sm text-selens-paper-muted font-sans">
                          {top.exam_year || 'PRC Licensure Examination'}
                          {top.batch && <span> · Batch {top.batch}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Tabular Rating on Right */}
                    {top.rating != null && (
                      <div className="sm:text-right shrink-0 pl-[4.5rem] sm:pl-0">
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-selens-paper-muted block">
                          Rating
                        </span>
                        <span className="font-mono font-bold text-xl sm:text-2xl text-selens-paper-ink tabular-nums">
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

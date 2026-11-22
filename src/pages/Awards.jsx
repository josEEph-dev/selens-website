import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Section } from '../components/SharedUI'
import { ImageFrame, Reveal } from '../components/ui'
import YearSelector from '../components/YearSelector'
import { Archive } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

export default function Awards() {
  const [awards, setAwards] = useState([])
  const [availableYears, setAvailableYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [selectedYear, setSelectedYear] = useState(CURRENT_ACADEMIC_YEAR)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Discover all distinct academic years
  useEffect(() => {
    let ignore = false
    async function loadYears() {
      try {
        const { data, error: yrErr } = await supabase
          .from('awards')
          .select('academic_year')
        if (yrErr) throw yrErr
        if (!ignore && data) {
          const yearsSet = new Set([
            CURRENT_ACADEMIC_YEAR,
            ...data.map((d) => d.academic_year).filter(Boolean),
          ])
          const sorted = Array.from(yearsSet).sort().reverse()
          setAvailableYears(sorted)
        }
      } catch (err) {
        console.error('Error fetching award academic years:', err)
      }
    }
    loadYears()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from('awards')
          .select('id, title, description, awarding_body, date_awarded, image_url, academic_year')
          .order('date_awarded', { ascending: false })

        if (selectedYear) {
          query = query.eq('academic_year', selectedYear)
        }

        const { data, error: queryError } = await query
        if (queryError) throw queryError
        if (!ignore) setAwards(data || [])
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load awards.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [selectedYear])

  const isArchive = selectedYear !== CURRENT_ACADEMIC_YEAR
  const pastYear = availableYears.find((y) => y !== CURRENT_ACADEMIC_YEAR)

  return (
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        eyebrow="Honors Registry"
        title="Accreditations &amp; Awards"
        description="Recognitions, institutional rankings, and chapter citations awarded to the Society of Electrical Engineering Students."
      />

      <div className="selens-container py-12 sm:py-16 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-selens-paper-rule pb-5">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-selens-paper-muted">
            Honors Registry · A.Y. {selectedYear}
          </span>
          <YearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
        </div>

        {isArchive && (
          <div className="p-4 bg-selens-paper-alt border border-selens-paper-rule rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-selens-paper-ink">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow-ink shrink-0" />
              <span>
                Viewing awards archive for <strong>A.Y. {selectedYear}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear(CURRENT_ACADEMIC_YEAR)}
              className="font-bold underline decoration-selens-yellow decoration-2 underline-offset-4 hover:text-selens-paper-muted cursor-pointer"
            >
              Back to current A.Y. {CURRENT_ACADEMIC_YEAR}
            </button>
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-selens-paper-rule border-t-2 border-selens-paper-ink">
            {[1, 2, 3].map((n) => (
              <div key={n} className="py-7 h-28 bg-selens-paper-alt/60 animate-pulse my-2 rounded-[2px]" />
            ))}
          </div>
        ) : error ? (
          <div className="border-y border-red-300 bg-red-50 p-8 text-center text-sm text-red-800">
            {error}
          </div>
        ) : awards.length === 0 ? (
          <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No institutional awards on record for A.Y. ${selectedYear}.`}
            </p>
            {selectedYear === CURRENT_ACADEMIC_YEAR && pastYear && (
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedYear(pastYear)}
                  className="selens-editorial-link text-xs"
                >
                  View archive for A.Y. {pastYear}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Section tone="paper" title="Institutional Honors &amp; Citations">
            <div className="divide-y divide-selens-paper-rule border-t-2 border-b border-selens-paper-ink">
              {awards.map((award, idx) => (
                <Reveal
                  key={award.id}
                  index={idx}
                  className="py-7 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
                >
                  {/* Date & Awarding Body Meta Column */}
                  <div className="lg:col-span-3 space-y-1.5">
                    {award.date_awarded && (
                      <time
                        dateTime={award.date_awarded}
                        className="font-mono text-xs font-bold uppercase tracking-wider text-selens-paper-ink block"
                      >
                        {new Date(award.date_awarded).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                    {award.awarding_body && (
                      <p className="text-xs text-selens-paper-muted font-sans leading-relaxed">
                        {award.awarding_body}
                      </p>
                    )}
                    {award.academic_year && award.academic_year !== CURRENT_ACADEMIC_YEAR && (
                      <span className="inline-block font-mono text-[11px] font-bold bg-selens-paper-ink text-selens-yellow px-2 py-0.5 rounded-[2px]">
                        A.Y. {award.academic_year}
                      </span>
                    )}
                  </div>

                  {/* Citation Title & Description */}
                  <div className={`${award.image_url ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-2`}>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-selens-paper-ink leading-snug">
                      {award.title}
                    </h3>
                    {award.description && (
                      <p className="text-sm sm:text-base text-selens-paper-muted font-sans leading-relaxed">
                        {award.description}
                      </p>
                    )}
                  </div>

                  {/* Optional Citation Image (only rendered when uploaded) */}
                  {award.image_url && (
                    <div className="lg:col-span-3">
                      <ImageFrame
                        tone="paper"
                        src={award.image_url}
                        alt={award.title}
                        aspect="aspect-[4/3]"
                        fit="contain"
                        className="rounded-[3px]"
                      />
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

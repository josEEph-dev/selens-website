import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Section } from '../components/SharedUI'
import { ImageFrame, Reveal } from '../components/ui'
import YearSelector from '../components/YearSelector'
import { Calendar, Building, Archive } from 'lucide-react'
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
    return () => { ignore = true }
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
    return () => { ignore = true }
  }, [selectedYear])

  const isArchive = selectedYear !== CURRENT_ACADEMIC_YEAR
  const pastYear = availableYears.find((y) => y !== CURRENT_ACADEMIC_YEAR)

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="Accreditations &amp; Awards"
        description="Recognitions, institutional rankings, and chapter citations awarded to the Society of Electrical Engineering Students."
      />

      <div className="selens-container py-12 sm:py-16 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-selens-line pb-5">
          <span className="text-sm text-neutral-400 font-serif">
            Honors Registry
          </span>
          <YearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
        </div>

        {isArchive && (
          <div className="p-3.5 bg-selens-ink border border-selens-line rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-300">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow shrink-0" />
              <span>Viewing awards archive for <strong>A.Y. {selectedYear}</strong></span>
            </span>
            <button
              onClick={() => setSelectedYear(CURRENT_ACADEMIC_YEAR)}
              className="text-selens-yellow hover:underline font-semibold"
            >
              Back to current A.Y. {CURRENT_ACADEMIC_YEAR}
            </button>
          </div>
        )}

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
        ) : awards.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400 space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No institutional awards on record for A.Y. ${selectedYear}.`}
            </p>
            {selectedYear === CURRENT_ACADEMIC_YEAR && pastYear && (
              <div>
                <button
                  onClick={() => setSelectedYear(pastYear)}
                  className="text-xs font-semibold text-selens-yellow hover:text-selens-white underline underline-offset-4"
                >
                  View archive for A.Y. {pastYear}
                </button>
              </div>
            )}
          </div>
        ) : (
          <Section title="Institutional Honors &amp; Citations">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-5 sm:gap-6">
              {awards.map((award, idx) => (
                <Reveal as="article" key={award.id} index={idx} className="selens-card h-full overflow-hidden flex flex-col">
                  <ImageFrame src={award.image_url} alt={award.title} fit="contain" />

                  <div className="flex-1 p-5 flex flex-col gap-2.5">
                    {award.academic_year && award.academic_year !== CURRENT_ACADEMIC_YEAR && (
                      <span className="self-start text-[11px] font-semibold text-neutral-400 bg-selens-black border border-selens-line px-2 py-0.5 rounded-[2px]">
                        Archive: A.Y. {award.academic_year}
                      </span>
                    )}
                    <h3 className="font-serif selens-fluid-h3 font-bold text-selens-white line-clamp-2 min-h-[2.7em] break-words">
                      {award.title}
                    </h3>
                    {award.description && (
                      <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                        {award.description}
                      </p>
                    )}

                    {(award.date_awarded || award.awarding_body) && (
                      <div className="mt-auto pt-3 border-t border-selens-line space-y-1 text-xs text-neutral-400">
                        {award.awarding_body && (
                          <p className="flex items-start gap-1.5 min-w-0">
                            <Building className="w-3.5 h-3.5 mt-px text-selens-yellow shrink-0" aria-hidden="true" />
                            <span className="line-clamp-2 break-words">{award.awarding_body}</span>
                          </p>
                        )}
                        {award.date_awarded && (
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-selens-yellow shrink-0" aria-hidden="true" />
                            <time dateTime={award.date_awarded}>
                              {new Date(award.date_awarded).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </time>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

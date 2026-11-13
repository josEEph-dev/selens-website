import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Card, Section } from '../components/SharedUI'
import YearSelector from '../components/YearSelector'
import { Calendar, Building, Award as AwardIcon, Archive } from 'lucide-react'
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

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-selens-line pb-4">
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
          <div className="p-3.5 bg-selens-ink border border-selens-line rounded-[4px] flex items-center justify-between text-xs text-neutral-300">
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
            <div className="space-y-4">
              {awards.map((award) => (
                <Card
                  key={award.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      {award.academic_year && award.academic_year !== CURRENT_ACADEMIC_YEAR && (
                        <span className="text-[11px] font-semibold text-neutral-400 bg-selens-black border border-selens-line px-2 py-0.5 rounded-[2px]">
                          Archive: A.Y. {award.academic_year}
                        </span>
                      )}
                      {award.date_awarded && (
                        <>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-selens-yellow shrink-0" />
                            <span>
                              {new Date(award.date_awarded).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </span>
                          <span>•</span>
                        </>
                      )}
                      {award.awarding_body && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-selens-yellow shrink-0" />
                          <span>{award.awarding_body}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-lg text-selens-white">
                      {award.title}
                    </h3>
                    {award.description && (
                      <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                        {award.description}
                      </p>
                    )}
                  </div>
                  {award.image_url ? (
                    <img
                      src={award.image_url}
                      alt={award.title}
                      className="w-20 h-20 object-contain rounded-[4px] border border-selens-line shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-[4px] border border-selens-line bg-selens-ink flex items-center justify-center shrink-0 text-selens-yellow">
                      <AwardIcon className="w-8 h-8 opacity-70" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

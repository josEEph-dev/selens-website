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
        title="Accreditations &amp; Awards"
        description="Recognitions, institutional rankings, and chapter citations awarded to the Society of Electrical Engineering Students."
      />

      <div className="selens-container py-10 sm:py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cdd0d4] pb-5">
          <span className="m-text-4 text-[#121315]">
            Academic Year {selectedYear}
          </span>
          <YearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
        </div>

        {isArchive && (
          <div className="m-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 m-text-6">
            <span className="flex items-center gap-2 text-[#121315]">
              <Archive className="w-4 h-4 text-[#4d5158] shrink-0" />
              <span>
                Viewing awards archive for <strong className="font-medium">A.Y. {selectedYear}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear(CURRENT_ACADEMIC_YEAR)}
              className="m-link m-text-4 text-[#121315] w-fit cursor-pointer"
            >
              Back to current A.Y. {CURRENT_ACADEMIC_YEAR}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 bg-white rounded-[20px] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="m-surface text-center m-text-6 text-red-700">
            {error}
          </div>
        ) : awards.length === 0 ? (
          <div className="m-surface py-12 text-center m-text-6 text-[#4d5158] space-y-4">
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
                  className="m-btn-2 m-btn-2--mist cursor-pointer"
                >
                  <span className="m-btn-2__label">View archive for A.Y. {pastYear}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Section tone="paper" title="Institutional honors &amp; citations.">
            <div className="grid grid-cols-1 gap-4">
              {awards.map((award, idx) => (
                <Reveal
                  key={award.id}
                  index={idx}
                  className="m-surface grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
                >
                  <div className="lg:col-span-3 space-y-2">
                    {award.date_awarded && (
                      <time
                        dateTime={award.date_awarded}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-[#e7e8ea] text-[#121315] m-text-4"
                      >
                        {new Date(award.date_awarded).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                    {award.awarding_body && (
                      <p className="m-text-6 text-[#4d5158]">
                        {award.awarding_body}
                      </p>
                    )}
                    {award.academic_year && award.academic_year !== CURRENT_ACADEMIC_YEAR && (
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                        A.Y. {award.academic_year}
                      </span>
                    )}
                  </div>

                  <div className={`${award.image_url ? 'lg:col-span-6' : 'lg:col-span-9'} space-y-2`}>
                    <h3 className="m-text-5 text-[#121315]">
                      {award.title}
                    </h3>
                    {award.description && (
                      <p className="m-text text-[#4d5158]">
                        {award.description}
                      </p>
                    )}
                  </div>

                  {award.image_url && (
                    <div className="lg:col-span-3">
                      <ImageFrame
                        tone="paper"
                        src={award.image_url}
                        alt={award.title}
                        aspect="aspect-[4/3]"
                        fit="contain"
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

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import { ImageFrame, Reveal } from '../components/ui'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ExternalLink, Archive } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR, getGroupForCommittee, formatCommitteeLabel } from '../lib/config'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [availableYears, setAvailableYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [selectedYear, setSelectedYear] = useState(CURRENT_ACADEMIC_YEAR)
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedCommittee, setSelectedCommittee] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Discover all distinct academic years
  useEffect(() => {
    let ignore = false
    async function loadYears() {
      try {
        const { data, error: yrErr } = await supabase
          .from('projects')
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
        console.error('Error fetching project academic years:', err)
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
          .from('projects')
          .select('id, name, description, status, cover_image_url, link_url, academic_year, committee')
          .order('created_at', { ascending: false })

        if (selectedYear) {
          query = query.eq('academic_year', selectedYear)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError
        if (!ignore) {
          setProjects((data || []).filter((p) => p.status !== 'archived'))
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load projects.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [selectedYear])

  // Reset group and committee filters when year changes
  useEffect(() => {
    setSelectedGroup('all')
    setSelectedCommittee('all')
  }, [selectedYear])

  // Filter projects by group and committee
  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const itemGroup = getGroupForCommittee(item.committee)
      if (selectedGroup !== 'all' && itemGroup !== selectedGroup) {
        return false
      }
      if (selectedGroup === 'Legislative' && selectedCommittee !== 'all' && item.committee !== selectedCommittee) {
        return false
      }
      return true
    })
  }, [projects, selectedGroup, selectedCommittee])

  const isArchive = selectedYear !== CURRENT_ACADEMIC_YEAR
  const pastYear = availableYears.find((y) => y !== CURRENT_ACADEMIC_YEAR)

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="Projects &amp; Initiatives"
        description="Explore the programs, resources, and community activities created and managed by the Society of Electrical Engineering Students."
      />

      <div className="selens-container py-12 sm:py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-selens-line pb-5">
          <span className="text-sm text-neutral-400 font-serif">
            Initiatives Registry
          </span>
          <YearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
        </div>

        {/* Group and Committee Chips */}
        <CommitteeFilter
          items={projects}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedCommittee={selectedCommittee}
          onCommitteeChange={setSelectedCommittee}
        />

        {isArchive && (
          <div className="p-3.5 bg-selens-ink border border-selens-line rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-300">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow shrink-0" />
              <span>Viewing projects archive for <strong>A.Y. {selectedYear}</strong></span>
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
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-48 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-red-400">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400 space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No project records on file for A.Y. ${selectedYear}.`}
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
        ) : filteredProjects.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400">
            No projects matching the selected committee filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 auto-rows-fr gap-5 sm:gap-6">
            {filteredProjects.map((item, idx) => (
              <Reveal as="article" key={item.id} index={idx} className="selens-card h-full overflow-hidden flex flex-col">
                <ImageFrame src={item.cover_image_url} alt={item.name} />

                <div className="flex-1 p-5 sm:p-6 flex flex-col gap-3">
                  {(item.committee || item.status && item.status !== 'active' || (item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR)) && (
                    <div className="flex flex-wrap items-center gap-2">
                      {item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR && (
                        <span className="text-[11px] font-semibold text-neutral-400 bg-selens-black border border-selens-line px-2 py-0.5 rounded-[2px]">
                          Archive: A.Y. {item.academic_year}
                        </span>
                      )}
                      {item.committee && (
                        <span className="text-[11px] font-semibold text-selens-yellow bg-selens-black border border-selens-line px-2 py-0.5 rounded-[2px]">
                          {formatCommitteeLabel(item.committee)}
                        </span>
                      )}
                      {item.status && item.status !== 'active' && (
                        <span className="text-[11px] font-semibold capitalize px-2 py-0.5 rounded-[2px] border border-selens-line text-neutral-400">
                          {item.status}
                        </span>
                      )}
                    </div>
                  )}

                  <h2 className="font-serif selens-fluid-h3 font-bold text-selens-white line-clamp-2 break-words">
                    {item.name}
                  </h2>

                  {item.description && (
                    <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  )}

                  {item.link_url && (
                    <div className="mt-auto pt-3 border-t border-selens-line">
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-selens-yellow hover:text-selens-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Learn more</span>
                      </a>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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
    return () => {
      ignore = true
    }
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
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        title="Projects &amp; Initiatives"
        description="Explore the programs, resources, and community activities created and managed by the Society of Electrical Engineering Students."
      />

      <div className="selens-container py-10 sm:py-14 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <span className="text-sm font-semibold text-neutral-700">
            Academic Year {selectedYear}
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
          <div className="p-4 bg-selens-paper-alt border border-selens-paper-rule rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-selens-paper-ink">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow-ink shrink-0" />
              <span>
                Viewing projects archive for <strong>A.Y. {selectedYear}</strong>
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
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 bg-selens-paper-alt rounded-[3px] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="border-y border-red-300 bg-red-50 p-8 text-center text-sm text-red-800">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No project records on file for A.Y. ${selectedYear}.`}
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
        ) : filteredProjects.length === 0 ? (
          <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted">
            No projects matching the selected committee filter.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 border-t border-b border-neutral-200">
            {filteredProjects.map((item, idx) => (
              <Reveal
                key={item.id}
                index={idx}
                className="py-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className={`${item.cover_image_url ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-2.5`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.committee && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-[3px] bg-neutral-100 border border-neutral-200 text-neutral-800">
                        {formatCommitteeLabel(item.committee)}
                      </span>
                    )}
                    {item.status && item.status !== 'active' && (
                      <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-[3px] bg-selens-yellow text-neutral-950">
                        {item.status}
                      </span>
                    )}
                    {item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR && (
                      <span className="text-xs text-neutral-500">
                        A.Y. {item.academic_year}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-xl font-bold text-neutral-950 break-words leading-snug">
                    {item.name}
                  </h2>

                  {item.description && (
                    <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans max-w-2xl">
                      {item.description}
                    </p>
                  )}

                  {item.link_url && (
                    <div className="pt-1">
                      <a
                        href={item.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="selens-editorial-link"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Learn more</span>
                      </a>
                    </div>
                  )}
                </div>

                {item.cover_image_url && (
                  <div className="lg:col-span-4">
                    <ImageFrame
                      tone="paper"
                      src={item.cover_image_url}
                      alt={item.name}
                      aspect="aspect-[16/10]"
                      className="rounded-[4px]"
                    />
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import { ImageFrame, Reveal } from '../components/ui'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ArrowUpRight, Archive } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR, getGroupForCommittee, formatCommitteeLabel } from '../lib/config'
import { getSafeAppHref, slugifyProjectId } from '../lib/portalApps'

export default function Projects() {
  const location = useLocation()
  const [projects, setProjects] = useState([])
  const [availableYears, setAvailableYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [selectedYear, setSelectedYear] = useState(CURRENT_ACADEMIC_YEAR)
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedCommittee, setSelectedCommittee] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
          .select('id, name, description, status, cover_image_url, link_url, academic_year, committee, show_in_portal')
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

  useEffect(() => {
    setSelectedGroup('all')
    setSelectedCommittee('all')
  }, [selectedYear])

  useEffect(() => {
    if (loading || !location.hash) return
    const targetId = location.hash.replace(/^#/, '')
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, location.hash])

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

        <CommitteeFilter
          items={projects}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedCommittee={selectedCommittee}
          onCommitteeChange={setSelectedCommittee}
        />

        {isArchive && (
          <div className="m-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 m-text-6">
            <span className="flex items-center gap-2 text-[#121315]">
              <Archive className="w-4 h-4 text-[#4d5158] shrink-0" />
              <span>
                Viewing projects archive for <strong className="font-medium">A.Y. {selectedYear}</strong>
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
              <div
                key={n}
                className="h-44 bg-white rounded-[28px] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="m-surface text-center m-text-6 text-red-700">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="m-surface py-12 text-center m-text-6 text-[#4d5158] space-y-4">
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
                  className="m-btn-2 m-btn-2--mist cursor-pointer"
                >
                  <span className="m-btn-2__label">View archive for A.Y. {pastYear}</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="m-surface py-12 text-center m-text-6 text-[#4d5158]">
            No projects matching the selected committee filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProjects.map((item, idx) => {
              const safeLink = getSafeAppHref(item.link_url)
              const ctaLabel =
                item.show_in_portal && item.status !== 'upcoming'
                  ? 'Open app'
                  : 'Learn more'

              return (
              <Reveal
                key={item.id}
                id={slugifyProjectId(item.name)}
                index={idx}
                className="m-panel-light p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center scroll-mt-28"
              >
                <div className={`${item.cover_image_url ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-3`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.committee && (
                      <span className="px-3 py-1 rounded-full bg-[#e7e8ea] text-[#121315] text-xs font-medium">
                        {formatCommitteeLabel(item.committee)}
                      </span>
                    )}
                    {item.status && item.status !== 'active' && (
                      <span className="px-3 py-1 rounded-full bg-[#FFD100] text-[#121315] text-xs font-medium capitalize">
                        {item.status}
                      </span>
                    )}
                    {item.show_in_portal && (
                      <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                        Student Portal
                      </span>
                    )}
                    {item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR && (
                      <span className="m-text-6 text-[#4d5158]">
                        A.Y. {item.academic_year}
                      </span>
                    )}
                  </div>

                  <h2 className="m-text-5 text-[#121315] break-words">
                    {item.name}
                  </h2>

                  {item.description && (
                    <p className="m-text text-[#4d5158] max-w-2xl">
                      {item.description}
                    </p>
                  )}

                  {safeLink && (
                    <div className="pt-2">
                      <a
                        href={safeLink.href}
                        target={safeLink.external ? '_blank' : undefined}
                        rel={safeLink.external ? 'noopener noreferrer' : undefined}
                        className="m-btn-2 m-btn-2--mist"
                      >
                        <span className="m-btn-2__label">{ctaLabel}</span>
                        <span className="m-btn-2__icon" aria-hidden="true">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
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
                    />
                  </div>
                )}
              </Reveal>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

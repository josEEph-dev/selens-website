import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ImageFrame } from '../components/ui'
import { ArrowLeft, Calendar, Tag, Building } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../lib/config'

export default function AccomplishmentDetail() {
  const { slug } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: queryError } = await supabase
          .from('accomplishments')
          .select('title, slug, summary, body, category, accomplished_on, image_url, academic_year, committee')
          .eq('slug', slug)
          .single()

        if (queryError) throw queryError
        if (!ignore) setItem(data)
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Accomplishment record not found.')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [slug])

  if (loading) {
    return (
      <div id="main-content" className="selens-paper-page min-h-screen pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="h-10 w-44 bg-white rounded-full animate-pulse" />
          <div className="h-96 bg-white rounded-[28px] animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div id="main-content" className="selens-paper-page min-h-[75vh] flex items-center justify-center px-4 pt-28 pb-16">
        <div className="m-panel-light m-shadow max-w-md w-full text-center space-y-5 p-8 sm:p-10">
          <h2 className="m-text-5 text-[#121315]">Record not found</h2>
          <p className="m-text-6 text-[#4d5158]">
            {error || 'The accomplishment entry could not be found.'}
          </p>
          <div>
            <Link to="/accomplishments" className="m-btn">
              <span className="m-btn__label">Back to accomplishments</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const accomplishedDate = item.accomplished_on
    ? new Date(item.accomplished_on).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const isArchive = item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR

  return (
    <div id="main-content" className="selens-paper-page min-h-screen pt-24 sm:pt-28 pb-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <Link to="/accomplishments" className="m-btn-2">
            <span className="m-btn-2__label">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to accomplishments</span>
            </span>
          </Link>
        </div>

        <article className="m-panel-light m-shadow p-6 sm:p-12 space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5 m-text-6 text-[#4d5158]">
              {isArchive && (
                <span className="px-3 py-0.5 rounded-full bg-[#e7e8ea] text-[#121315] text-xs font-medium">
                  Archive: A.Y. {item.academic_year}
                </span>
              )}
              {item.committee && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                  <Building className="w-3.5 h-3.5 shrink-0" />
                  <span>{formatCommitteeLabel(item.committee)}</span>
                </span>
              )}
              {accomplishedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#121315] shrink-0" />
                  <span>{accomplishedDate}</span>
                </div>
              )}
              {item.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#121315] shrink-0" />
                  <span className="capitalize">{item.category.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            <h1 className="m-text-3 text-[#121315] break-words">
              {item.title}
            </h1>

            {item.summary && (
              <p className="max-w-prose text-base sm:text-lg text-[#4d5158] leading-relaxed border-l-[3px] border-[#FFD100] pl-4">
                {item.summary}
              </p>
            )}
          </header>

          {item.image_url && (
            <ImageFrame tone="paper" src={item.image_url} alt={item.title} className="rounded-[20px]" />
          )}

          {item.body && (
            <div className="selens-prose max-w-prose whitespace-pre-line break-words border-t border-[#cdd0d4] pt-8">
              {item.body}
            </div>
          )}

          <footer className="border-t border-[#cdd0d4] pt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="m-text-6 text-[#4d5158]">
              Society of Electrical Engineering Students, MSU-GSC · A.Y. {item.academic_year || CURRENT_ACADEMIC_YEAR}
            </span>
            <Link to="/accomplishments" className="m-btn self-start sm:self-auto">
              <span className="m-btn__label">View all accomplishments</span>
            </Link>
          </footer>
        </article>
      </div>
    </div>
  )
}

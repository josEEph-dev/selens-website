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
      <div id="main-content" className="selens-paper-page min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="h-4 w-32 bg-selens-paper-alt rounded-[2px] animate-pulse" />
          <div className="h-10 w-3/4 bg-selens-paper-alt rounded-[2px] animate-pulse" />
          <div className="h-64 bg-selens-paper-alt rounded-[3px] animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div id="main-content" className="selens-paper-page min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-4 py-10 border-y-2 border-selens-paper-ink">
          <h2 className="font-serif font-bold text-xl text-selens-paper-ink">
            Record not found
          </h2>
          <p className="text-sm text-selens-paper-muted">
            {error || 'The accomplishment entry could not be found.'}
          </p>
          <div className="pt-2">
            <Link to="/accomplishments" className="selens-btn-ink">
              Back to accomplishments
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
    <div id="main-content" className="selens-paper-page min-h-screen">
      {/* Back link */}
      <div className="border-b border-selens-paper-rule bg-selens-paper-alt py-3">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/accomplishments"
            className="min-h-[36px] inline-flex items-center gap-2 text-sm font-semibold text-selens-paper-ink hover:underline decoration-selens-yellow decoration-2 underline-offset-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to accomplishments</span>
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        {/* Header Block */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-selens-paper-muted font-mono">
            {isArchive && (
              <span className="border border-selens-paper-rule px-2 py-0.5 rounded-[2px]">
                Archive: A.Y. {item.academic_year}
              </span>
            )}
            {item.committee && (
              <div className="flex items-center gap-1.5 font-sans">
                <Building className="w-3.5 h-3.5 text-selens-paper-ink shrink-0" />
                <span className="font-bold text-selens-paper-ink">
                  {formatCommitteeLabel(item.committee)}
                </span>
              </div>
            )}
            {accomplishedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-selens-paper-ink shrink-0" />
                <span>{accomplishedDate}</span>
              </div>
            )}
            {item.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-selens-paper-ink shrink-0" />
                <span className="capitalize">{item.category.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          <h1 className="font-serif selens-fluid-h1 font-bold text-selens-paper-ink break-words">
            {item.title}
          </h1>

          <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />

          {item.summary && (
            <p className="max-w-prose text-base sm:text-lg text-selens-paper-muted font-sans leading-relaxed border-l-4 border-selens-yellow pl-4 italic">
              {item.summary}
            </p>
          )}
        </header>

        {/* Responsive 16:9 Hero image (only when uploaded) */}
        {item.image_url && (
          <div className="rounded-[3px] overflow-hidden">
            <ImageFrame tone="paper" src={item.image_url} alt={item.title} />
          </div>
        )}

        {/* Body content (clean archival measure) */}
        {item.body && (
          <div className="selens-prose max-w-prose font-sans whitespace-pre-line break-words border-t border-selens-paper-rule pt-8">
            {item.body}
          </div>
        )}

        {/* Footer Navigation */}
        <footer className="border-t-2 border-selens-paper-ink pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="font-mono text-xs text-selens-paper-muted">
            Society of Electrical Engineering Students, MSU-GSC · A.Y. {item.academic_year || CURRENT_ACADEMIC_YEAR}
          </span>
          <Link to="/accomplishments" className="selens-btn-paper-outline self-start sm:self-auto">
            View all accomplishments
          </Link>
        </footer>
      </article>
    </div>
  )
}

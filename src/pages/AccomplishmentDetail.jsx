import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card, SecondaryButton } from '../components/SharedUI'
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
      <div className="bg-selens-black text-selens-white min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="h-4 w-32 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
          <div className="h-10 w-3/4 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
          <div className="h-64 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="bg-selens-black text-selens-white min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card hover={false} className="max-w-md w-full text-center space-y-4 py-10">
          <h2 className="font-serif font-bold text-xl text-selens-white">
            Record not found
          </h2>
          <p className="text-sm text-neutral-300">
            {error || 'The accomplishment entry could not be found.'}
          </p>
          <div className="pt-2">
            <SecondaryButton to="/accomplishments">
              Back to accomplishments
            </SecondaryButton>
          </div>
        </Card>
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
    <div className="bg-selens-black text-selens-white min-h-screen">
      {/* Back link */}
      <div className="border-b border-selens-line bg-selens-surface py-3">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to="/accomplishments"
            className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-selens-yellow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to accomplishments</span>
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        {/* Header Block */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            {isArchive && (
              <span className="text-[11px] font-semibold text-neutral-400 bg-selens-ink border border-selens-line px-2 py-0.5 rounded-[2px]">
                Archive: A.Y. {item.academic_year}
              </span>
            )}
            {item.committee && (
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-selens-yellow shrink-0" />
                <span className="text-selens-yellow font-semibold">{formatCommitteeLabel(item.committee)}</span>
              </div>
            )}
            {accomplishedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-selens-yellow shrink-0" />
                <span>{accomplishedDate}</span>
              </div>
            )}
            {item.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-selens-yellow shrink-0" />
                <span className="capitalize">{item.category.replace('_', ' ')}</span>
              </div>
            )}
          </div>

          <h1 className="font-serif selens-fluid-h1 font-bold text-selens-white break-words">
            {item.title}
          </h1>

          <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />

          {item.summary && (
            <p className="max-w-prose text-base sm:text-lg text-neutral-300 font-sans leading-relaxed border-l-2 border-selens-yellow pl-4 italic">
              {item.summary}
            </p>
          )}
        </header>

        {/* Responsive 16:9 Hero image or neutral placeholder */}
        <div className="rounded-[4px] overflow-hidden border border-selens-line">
          <ImageFrame src={item.image_url} alt={item.title} className="border-b-0" />
        </div>

        {/* Body content (max-w-prose readable measure) */}
        {item.body && (
          <div className="selens-prose max-w-prose font-sans whitespace-pre-line break-words border-t border-selens-line pt-8">
            {item.body}
          </div>
        )}

        {/* Footer Navigation */}
        <footer className="border-t border-selens-line pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-neutral-400">
            Society of Electrical Engineering Students, MSU-GSC • A.Y. {item.academic_year || CURRENT_ACADEMIC_YEAR}
          </span>
          <SecondaryButton to="/accomplishments" className="self-start sm:self-auto min-h-[44px]">
            View all accomplishments
          </SecondaryButton>
        </footer>
      </article>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Card, SecondaryButton } from '../components/SharedUI'
import { ImageFrame } from '../components/ui'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../lib/config'

export default function NewsDetail() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: queryError } = await supabase
          .from('news_posts')
          .select('title, slug, excerpt, body, category, thumbnail_url, published_at, academic_year, committee')
          .eq('slug', slug)
          .single()

        if (queryError) throw queryError
        if (!ignore) setArticle(data)
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Article not found.')
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

  if (error || !article) {
    return (
      <div className="bg-selens-black text-selens-white min-h-[70vh] flex items-center justify-center px-4 py-16">
        <Card hover={false} className="max-w-md w-full text-center space-y-4 py-10">
          <h2 className="font-serif font-bold text-xl text-selens-white">
            Article not found
          </h2>
          <p className="text-sm text-neutral-300">
            {error || 'The article you requested could not be found or may have been updated.'}
          </p>
          <div className="pt-2">
            <SecondaryButton to="/news">
              Back to news
            </SecondaryButton>
          </div>
        </Card>
      </div>
    )
  }

  const issueDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent update'

  const categoryLabel =
    article.category === 'student_activities'
      ? 'Student Activities'
      : 'News & Events'

  const isArchive = article.academic_year && article.academic_year !== CURRENT_ACADEMIC_YEAR

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      {/* Back link */}
      <div className="border-b border-selens-line bg-selens-surface py-3">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to={article.category === 'student_activities' ? '/news/student-activities' : '/news'}
            className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-2 text-sm font-semibold text-neutral-300 hover:text-selens-yellow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {categoryLabel.toLowerCase()}</span>
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        {/* Header Block */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            {isArchive && (
              <span className="text-[11px] font-semibold text-neutral-400 bg-selens-ink border border-selens-line px-2 py-0.5 rounded-[2px]">
                Archive: A.Y. {article.academic_year}
              </span>
            )}
            {article.committee && (
              <span className="text-[11px] font-semibold text-selens-yellow bg-selens-ink border border-selens-line px-2 py-0.5 rounded-[2px]">
                {formatCommitteeLabel(article.committee)}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-selens-yellow shrink-0" />
              <span>{issueDate}</span>
            </div>
            {article.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-selens-yellow shrink-0" />
                <span className="capitalize">{categoryLabel}</span>
              </div>
            )}
          </div>

          <h1 className="font-serif selens-fluid-h1 font-bold text-selens-white break-words">
            {article.title}
          </h1>

          <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />

          {article.excerpt && (
            <p className="max-w-prose text-base sm:text-lg text-neutral-300 font-sans leading-relaxed border-l-2 border-selens-yellow pl-4 italic">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Responsive 16:9 Thumbnail / Hero Image */}
        <div className="rounded-[4px] overflow-hidden border border-selens-line">
          <ImageFrame src={article.thumbnail_url} alt={article.title} className="border-b-0" />
        </div>

        {/* Article Body (max-w-prose readable measure) */}
        <div className="selens-prose max-w-prose font-sans whitespace-pre-line break-words border-t border-selens-line pt-8">
          {article.body}
        </div>

        {/* Footer Navigation */}
        <footer className="border-t border-selens-line pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-neutral-400">
            Society of Electrical Engineering Students, MSU-GSC • A.Y. {article.academic_year || CURRENT_ACADEMIC_YEAR}
          </span>
          <SecondaryButton to="/news" className="self-start sm:self-auto min-h-[44px]">
            View all news
          </SecondaryButton>
        </footer>
      </article>
    </div>
  )
}

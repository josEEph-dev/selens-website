import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
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
      <div id="main-content" className="selens-paper-page min-h-screen py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="h-4 w-32 bg-selens-paper-alt rounded-[2px] animate-pulse" />
          <div className="h-10 w-3/4 bg-selens-paper-alt rounded-[2px] animate-pulse" />
          <div className="h-64 bg-selens-paper-alt rounded-[3px] animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div id="main-content" className="selens-paper-page min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-4 py-10 border-y-2 border-selens-paper-ink">
          <h2 className="font-serif font-bold text-xl text-selens-paper-ink">
            Article not found
          </h2>
          <p className="text-sm text-selens-paper-muted">
            {error || 'The article you requested could not be found or may have been updated.'}
          </p>
          <div className="pt-2">
            <Link to="/news" className="selens-btn-ink">
              Back to news
            </Link>
          </div>
        </div>
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
    <div id="main-content" className="selens-paper-page min-h-screen">
      {/* Back link bar */}
      <div className="border-b border-selens-paper-rule bg-selens-paper-alt py-3">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            to={article.category === 'student_activities' ? '/news/student-activities' : '/news'}
            className="min-h-[36px] inline-flex items-center gap-2 text-sm font-semibold text-selens-paper-ink hover:underline decoration-selens-yellow decoration-2 underline-offset-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {categoryLabel.toLowerCase()}</span>
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        {/* Header Block */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-selens-paper-muted font-mono">
            {isArchive && (
              <span className="border border-selens-paper-rule px-2 py-0.5 rounded-[2px]">
                Archive: A.Y. {article.academic_year}
              </span>
            )}
            {article.committee && (
              <span className="font-sans text-[11px] font-bold bg-selens-paper-ink text-selens-yellow px-2 py-0.5 rounded-[2px]">
                {formatCommitteeLabel(article.committee)}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-selens-paper-ink shrink-0" />
              <span>{issueDate}</span>
            </div>
            {article.category && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-selens-paper-ink shrink-0" />
                <span className="capitalize">{categoryLabel}</span>
              </div>
            )}
          </div>

          <h1 className="font-serif selens-fluid-h1 font-bold text-selens-paper-ink break-words">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="max-w-prose text-base sm:text-lg text-selens-paper-muted font-sans leading-relaxed border-l-4 border-selens-yellow pl-4 italic">
              {article.excerpt}
            </p>
          )}
        </header>

        {/* Responsive 16:9 Hero Image (only when uploaded) */}
        {article.thumbnail_url && (
          <div className="rounded-[3px] overflow-hidden">
            <ImageFrame tone="paper" src={article.thumbnail_url} alt={article.title} />
          </div>
        )}

        {/* Article Body (clean archival measure) */}
        <div className="selens-prose max-w-prose font-sans whitespace-pre-line break-words border-t border-selens-paper-rule pt-8">
          {article.body}
        </div>

        {/* Footer Navigation */}
        <footer className="border-t-2 border-selens-paper-ink pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="font-mono text-xs text-selens-paper-muted">
            Society of Electrical Engineering Students, MSU-GSC · A.Y. {article.academic_year || CURRENT_ACADEMIC_YEAR}
          </span>
          <Link to="/news" className="selens-btn-paper-outline self-start sm:self-auto">
            View all news
          </Link>
        </footer>
      </article>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Reveal } from '../components/SharedUI'
import { Plus, Search } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

export default function Faq() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: queryError } = await supabase
          .from('faqs')
          .select('id, question, answer, display_order')
          .order('display_order', { ascending: true })

        if (queryError) throw queryError
        if (!ignore) {
          const items = data || []
          setFaqs(items)
          if (items.length > 0) setOpenId(items[0].id)
        }
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load FAQs.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const filtered = faqs.filter((f) => {
    const q = f.question ? f.question.toLowerCase() : ''
    const a = f.answer ? f.answer.toLowerCase() : ''
    const term = search.toLowerCase()
    return q.includes(term) || a.includes(term)
  })

  return (
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        eyebrow="Member Guide"
        title="Frequently Asked Questions"
        description={`Find answers to common questions about membership, borrowing lab tools, requesting documents, and joining events for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
      />

      <div className="selens-container py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Sticky Left Column: Search & Contact Reference */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-selens-paper-muted">
                Quick Search
              </p>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-selens-paper-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="Search questions"
                  placeholder="Search membership, documents, events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="selens-input pl-10"
                />
              </div>
            </div>

            <div className="border-t border-selens-paper-rule pt-5 space-y-2 text-sm text-selens-paper-muted">
              <p className="font-serif font-bold text-selens-paper-ink">
                Need further assistance?
              </p>
              <p className="leading-relaxed">
                Visit the DEE Office at the College of Engineering Building or email{' '}
                <a
                  href="mailto:iieeasteeg@msugensan.edu.ph"
                  className="font-semibold text-selens-paper-ink underline decoration-selens-yellow decoration-2 underline-offset-4"
                >
                  iieeasteeg@msugensan.edu.ph
                </a>
                .
              </p>
            </div>
          </aside>

          {/* Right Column: Borderless Hairline-Divided Editorial Accordion */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="divide-y divide-selens-paper-rule border-t-2 border-selens-paper-ink">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 bg-selens-paper-alt/70 my-2 rounded-[2px] animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="border-y border-red-300 bg-red-50 p-8 text-center text-sm text-red-800">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted">
                {faqs.length === 0
                  ? 'No frequently asked questions on file currently.'
                  : `No questions match "${search}". Try searching another keyword.`}
              </div>
            ) : (
              <Reveal className="divide-y divide-selens-paper-rule border-t-2 border-b border-selens-paper-ink">
                {filtered.map((faq, idx) => {
                  const isOpen = openId === faq.id
                  return (
                    <div key={faq.id} className="transition-colors">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className="w-full min-h-[64px] py-5 px-2 text-left flex items-start justify-between gap-4 hover:bg-selens-paper-alt/60 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-baseline gap-4 min-w-0">
                          <span className="font-mono text-xs font-bold text-selens-paper-muted shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="font-serif font-bold text-base sm:text-lg text-selens-paper-ink break-words leading-snug">
                            {faq.question}
                          </span>
                        </div>
                        <span
                          className={`w-7 h-7 rounded-[2px] inline-flex items-center justify-center shrink-0 transition-colors ${
                            isOpen
                              ? 'bg-selens-paper-ink text-selens-yellow'
                              : 'bg-selens-paper-alt text-selens-paper-ink group-hover:bg-selens-yellow'
                          }`}
                          aria-hidden="true"
                        >
                          <Plus
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isOpen ? 'rotate-45' : ''
                            }`}
                          />
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pb-6 pt-1 pl-9 sm:pl-10 pr-4 text-sm sm:text-base text-selens-paper-muted font-sans leading-relaxed whitespace-pre-line max-w-prose">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Reveal } from '../components/SharedUI'
import { ChevronDown, Search } from 'lucide-react'
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
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="Frequently Asked Questions"
        description={`Find answers to common questions about membership, borrowing lab tools, requesting documents, and joining events for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
      />

      <div className="selens-container py-12 sm:py-16 space-y-8">
        {/* Search */}
        <div className="relative max-w-2xl">
          <Search
            className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search questions"
            placeholder="Search questions (e.g., membership, documents, events)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="selens-input pl-10 bg-selens-ink"
          />
        </div>

        {/* Questions Accordion */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-20 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-red-400">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400">
            {faqs.length === 0
              ? 'No frequently asked questions on file currently.'
              : `No questions match "${search}". Try searching another keyword.`}
          </div>
        ) : (
          <Reveal className="divide-y divide-selens-line border border-selens-line rounded-[4px] bg-selens-ink overflow-hidden">
            {filtered.map((faq) => {
              const isOpen = openId === faq.id
              return (
                <div key={faq.id} className="transition-colors">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full min-h-[56px] px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-selens-elevated transition-colors cursor-pointer"
                  >
                    <span className="font-serif font-bold text-base sm:text-lg text-selens-white break-words">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-selens-yellow' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-3 text-sm sm:text-base text-neutral-300 font-sans leading-relaxed border-t border-selens-line/70 bg-selens-black/40 whitespace-pre-line max-w-prose">
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
  )
}

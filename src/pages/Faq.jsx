import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { PageHeader, Reveal } from '../components/SharedUI'
import { Plus, Minus, Search } from 'lucide-react'
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
        title="Frequently Asked Questions"
        description={`Find answers to common questions about membership, borrowing lab tools, requesting documents, and joining events for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
      />

      {/* Exact Hush #faq 12-column split on Mist ground */}
      <div className="selens-container py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left 4 Cols: Sticky Search & Contact */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
            <div className="m-surface space-y-4">
              <div className="m-field">
                <label htmlFor="faq-search" className="m-field__label">
                  Search questions
                </label>
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-[#4d5158] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="faq-search"
                    type="search"
                    aria-label="Search questions"
                    placeholder="Membership, documents, events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="m-field__control !pl-11"
                  />
                </div>
              </div>

              <div className="border-t border-[#cdd0d4] pt-4 space-y-1.5">
                <p className="m-text-4 text-[#121315]">
                  Need further assistance?
                </p>
                <p className="m-text-6 text-[#4d5158]">
                  Visit the DEE Office at the College of Engineering Building or email{' '}
                  <a
                    href="mailto:iieeasteeg@msugensan.edu.ph"
                    className="m-link text-[#121315] font-medium"
                  >
                    iieeasteeg@msugensan.edu.ph
                  </a>
                  .
                </p>
              </div>
            </div>
          </aside>

          {/* Right 8 Cols: Hairline-divided Hush Accordion with 34px Circular + / - Buttons */}
          <div className="lg:col-span-8">
            {loading ? (
              <div className="divide-y divide-[#cdd0d4] border-t border-[#cdd0d4]">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="py-6">
                    <div className="h-7 w-3/4 bg-[#d9dce0] rounded-[10px] animate-pulse" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="m-surface text-center m-text-6 text-red-700">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="m-surface py-12 text-center m-text-6 text-[#4d5158]">
                {faqs.length === 0
                  ? 'No frequently asked questions on file currently.'
                  : `No questions match "${search}". Try searching another keyword.`}
              </div>
            ) : (
              <Reveal className="border-t border-[#cdd0d4] divide-y divide-[#cdd0d4]">
                {filtered.map((faq) => {
                  const isOpen = openId === faq.id
                  return (
                    <div key={faq.id}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className="w-full py-5 sm:py-6 text-left flex items-center justify-between gap-4 sm:gap-5 cursor-pointer group"
                      >
                        <span className="m-text-5 text-[#121315] min-w-0 flex-1 break-words">
                          {faq.question}
                        </span>
                        <span
                          className={`w-[34px] h-[34px] rounded-full inline-flex items-center justify-center shrink-0 transition-colors ${
                            isOpen
                              ? 'bg-[#121315] text-[#FFD100]'
                              : 'bg-white text-[#121315] group-hover:bg-[#cdd0d4]'
                          }`}
                          aria-hidden="true"
                        >
                          {isOpen ? (
                            <Minus className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pb-6 pr-0 sm:pr-14 m-text text-[#4d5158] whitespace-pre-line max-w-[60ch]">
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

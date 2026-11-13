import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * Standardized PageHeader for all inner pages:
 * - Serif H1 (sentence case)
 * - One-sentence white intro
 * - 1px selens-line divider
 * - No eyebrow labels
 */
export function PageHeader({ title, description, action }) {
  return (
    <div className="border-b border-selens-line pb-6 pt-10 sm:pt-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-selens-white tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-base text-neutral-300 font-sans max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}

/**
 * Standardized Section header:
 * - Serif H2
 * - Short yellow underline bar
 */
export function Section({ title, description, action, children, className = '' }) {
  return (
    <section className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-selens-line pb-3">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
            {title}
          </h2>
          <div className="w-12 h-1 bg-selens-yellow mt-2" />
          {description && (
            <p className="text-sm text-neutral-300 font-sans mt-2">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}

/**
 * Standardized Card:
 * - selens-ink surface
 * - 1px selens-line border
 * - 4px max radius
 * - No shadow
 * - Yellow border on hover
 */
export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`bg-selens-ink border border-selens-line rounded-[4px] p-6 text-selens-white ${
        hover ? 'hover:border-selens-yellow transition duration-150' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Standardized StatCard (same pattern as Home highlight cards):
 * - Yellow serif numeral
 * - Serif title
 * - One sentence
 * - Yellow arrow link
 */
export function StatCard({ numeral, title, description, linkTo, linkText = 'View details' }) {
  return (
    <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition flex flex-col justify-between">
      <div className="space-y-2">
        <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
          {numeral}
        </div>
        <h3 className="font-serif font-bold text-lg text-selens-white">
          {title}
        </h3>
        <p className="text-sm text-neutral-300 leading-relaxed font-sans">
          {description}
        </p>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-sm font-semibold text-selens-yellow hover:text-selens-white flex items-center gap-1.5 transition pt-2"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

/**
 * Standardized Primary Button:
 * - Yellow fill, black text
 * - Rectangular, 4px max radius
 * - Hover = color change only (to white background)
 */
export function PrimaryButton({ children, to, href, className = '', ...props }) {
  const baseClasses =
    'inline-flex items-center justify-center font-bold text-sm px-5 py-2.5 rounded-[4px] bg-selens-yellow text-selens-black hover:bg-selens-white transition duration-150 cursor-pointer'

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  )
}

/**
 * Standardized Secondary Button:
 * - 1px white outline, white text
 * - Rectangular, 4px max radius
 * - Hover = color change only (to yellow border & text)
 */
export function SecondaryButton({ children, to, href, className = '', ...props }) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold text-sm px-5 py-2.5 rounded-[4px] border border-selens-white text-selens-white hover:border-selens-yellow hover:text-selens-yellow transition duration-150 cursor-pointer'

  if (to) {
    return (
      <Link to={to} className={`${baseClasses} ${className}`} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  )
}

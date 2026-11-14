import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SectionBadge, SectionHeading, FeatureCard, PhotoSlot } from './ui'

export { SectionBadge, SectionHeading, FeatureCard, PhotoSlot }

/**
 * Standardized PageHeader for all inner pages:
 * - Serif H1 (sentence case)
 * - One-sentence white intro
 * - 1px selens-line divider
 * - Subtle radial header glow
 */
export function PageHeader({ title, description, action }) {
  return (
    <div className="border-b border-selens-line pb-8 pt-10 sm:pt-14 selens-header-glow">
      <div className="selens-container flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2.5">
          <h1 className="font-serif selens-fluid-h1 font-bold text-selens-white tracking-tight">
            {title}
          </h1>
          <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />
          {description && (
            <p className="text-base text-neutral-300 font-sans max-w-2xl leading-relaxed pt-1">
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
      <SectionHeading title={title} description={description} action={action} />
      {children}
    </section>
  )
}

/**
 * Standardized Card:
 * - selens-ink surface
 * - 1px selens-line border
 * - 4px radius, yellow-tinted border + 2px lift on hover
 */
export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`${
        hover
          ? 'selens-card'
          : 'bg-selens-ink border border-selens-line rounded-[4px]'
      } p-6 text-selens-white ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Standardized StatCard:
 * - Yellow serif numeral
 * - Serif title
 * - One sentence
 * - Yellow arrow link
 */
export function StatCard({ numeral, title, description, linkTo, linkText = 'View details' }) {
  return (
    <div className="selens-card p-6 space-y-4 flex flex-col justify-between">
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
          className="text-sm font-semibold text-selens-yellow hover:text-selens-white flex items-center gap-1.5 transition-colors pt-2"
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
 */
export function PrimaryButton({ children, to, href, className = '', ...props }) {
  const baseClasses = 'selens-btn-primary text-sm px-5 py-2.5 cursor-pointer'

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
 */
export function SecondaryButton({ children, to, href, className = '', ...props }) {
  const baseClasses = 'selens-btn-secondary text-sm px-5 py-2.5 cursor-pointer'

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

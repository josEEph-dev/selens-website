import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SectionBadge, SectionHeading, FeatureCard, PhotoSlot, Reveal } from './ui'

export { SectionBadge, SectionHeading, FeatureCard, PhotoSlot, Reveal }

/**
 * Clean institutional PageHeader:
 * - Light gray header with breadcrumb on public pages (.selens-paper-page)
 * - Dark header on Admin pages (no decorative waveform or fake glows)
 */
export function PageHeader({ title, description, action }) {
  return (
    <div className="selens-page-header">
      <div className="selens-container py-8 sm:py-11 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="min-w-0 max-w-3xl space-y-2.5">
          <nav aria-label="Breadcrumb" className="text-xs font-sans selens-page-header-crumb flex items-center gap-1.5">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate">{title}</span>
          </nav>
          <h1 className="font-serif selens-fluid-h1 font-bold selens-page-header-title break-words">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base selens-page-header-desc font-sans max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}

export function Section({ title, description, action, children, tone = 'dark', className = '' }) {
  return (
    <section className={`space-y-6 ${className}`}>
      <SectionHeading title={title} description={description} action={action} tone={tone} />
      {children}
    </section>
  )
}

export function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`${hover ? 'selens-card' : 'selens-card-flat'} p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

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

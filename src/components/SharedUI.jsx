import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SectionBadge, SectionHeading, FeatureCard, PhotoSlot, Reveal } from './ui'

export { SectionBadge, SectionHeading, FeatureCard, PhotoSlot, Reveal }

/**
 * PageHeader:
 * - On public pages (.selens-paper-page): renders Hush's rounded 28px deep-ink banner inset on the #e7e8ea mist ground.
 * - On Admin pages (outside .selens-paper-page): preserves the full-bleed dark Admin banner cleanly.
 */
export function PageHeader({ title, description, subtitle, breadcrumbs, action, compactTop = false }) {
  const descText = description || subtitle
  const crumbs =
    Array.isArray(breadcrumbs) && breadcrumbs.length > 0
      ? breadcrumbs
      : [{ label: 'Home', href: '/' }, { label: title }]

  return (
    <div className={`selens-page-header ${compactTop ? 'selens-page-header--compact' : ''}`}>
      <div className="selens-container">
        <div className="selens-page-header-inner hush-dark-scope flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="min-w-0 max-w-3xl space-y-3">
            <nav
              aria-label="Breadcrumb"
              className="m-text-6 selens-page-header-crumb flex flex-wrap items-center gap-2"
            >
              {crumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2 min-w-0">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {crumb.href ? (
                    <Link to={crumb.href} className="m-link text-white/80 hover:text-white">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <h1 className="selens-fluid-h1 selens-page-header-title break-words [overflow-wrap:anywhere]">
              {title}
            </h1>
            {descText && (
              <p className="m-text selens-page-header-desc max-w-2xl">
                {descText}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  )
}

export function Section({ title, description, action, children, tone = 'dark', className = '' }) {
  return (
    <section className={`space-y-7 ${className}`}>
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
        <div className="m-text-7 text-selens-yellow">
          {numeral}
        </div>
        <h3 className="m-text-5 text-selens-white">
          {title}
        </h3>
        <p className="m-text-6 text-neutral-300">
          {description}
        </p>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="m-text-4 text-selens-yellow hover:text-selens-white flex items-center gap-1.5 transition-colors pt-2"
        >
          <span>{linkText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

export function PrimaryButton({ children, to, href, className = '', ...props }) {
  const baseClasses = 'selens-btn-primary text-sm cursor-pointer'

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
  const baseClasses = 'selens-btn-secondary text-sm cursor-pointer'

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

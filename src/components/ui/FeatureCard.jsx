import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

/**
 * FeatureCard:
 * Equal-height editorial card with subtle yellow-tinted border + 2px lift on hover.
 * Supports title, text/description, optional link, optional numeral/meta, and optional icon slot (use sparingly).
 */
export default function FeatureCard({
  icon,
  numeral,
  meta,
  title,
  text,
  description,
  to,
  href,
  linkText = 'View details',
  children,
  className = '',
}) {
  const bodyCopy = text ?? description

  return (
    <div
      className={`selens-card p-6 h-full flex flex-col justify-between gap-5 group ${className}`}
    >
      <div className="space-y-3">
        {(icon || numeral !== undefined || meta) && (
          <div className="flex items-center justify-between gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-[4px] bg-selens-black border border-selens-line flex items-center justify-center text-selens-yellow shrink-0">
                {icon}
              </div>
            )}
            {numeral !== undefined && numeral !== null && (
              <div className="font-serif font-bold text-2xl sm:text-3xl text-selens-yellow">
                {numeral}
              </div>
            )}
            {meta && (
              <span className="text-xs font-sans text-neutral-400">
                {meta}
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          {title && (
            <h3 className="font-serif selens-fluid-h3 font-bold text-selens-white group-hover:text-selens-yellow transition-colors duration-200">
              {title}
            </h3>
          )}
          {bodyCopy && (
            <p className="text-sm text-neutral-300 font-sans leading-relaxed line-clamp-4">
              {bodyCopy}
            </p>
          )}
          {children}
        </div>
      </div>

      {to && (
        <div className="pt-3 border-t border-selens-line">
          <Link
            to={to}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-selens-yellow hover:text-selens-white transition-colors duration-200"
          >
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {!to && href && (
        <div className="pt-3 border-t border-selens-line">
          <a
            href={href}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-selens-yellow hover:text-selens-white transition-colors duration-200"
          >
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}
export { FeatureCard }

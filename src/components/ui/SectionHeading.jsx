import Reveal from './Reveal'

/**
 * SectionHeading:
 * Plain serif heading with a short yellow underline bar and optional description.
 * Left-aligned by default, with an optional align="center" prop.
 * Wrapped in Reveal by default (`reveal = true`); pass `reveal={false}` to opt out (e.g. People page).
 */
export default function SectionHeading({
  title,
  description,
  action,
  eyebrow,
  align = 'left',
  tone = 'dark',
  reveal = true,
  className = '',
}) {
  const isCentered = align === 'center'
  const isPaper = tone === 'paper'
  const headingColor = isPaper ? 'text-selens-paper-ink' : 'text-selens-white'
  const descColor = isPaper ? 'text-selens-paper-muted' : 'text-neutral-300'
  const eyebrowColor = isPaper ? 'text-selens-paper-muted' : 'text-selens-yellow'
  const ruleColor = isPaper ? 'border-selens-paper-rule' : 'border-selens-line'

  const content = isCentered ? (
    <div className={`text-center max-w-2xl mx-auto space-y-3 ${className}`}>
      {eyebrow && (
        <p className={`font-mono text-xs uppercase tracking-[0.2em] ${eyebrowColor}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-serif selens-fluid-h2 font-bold ${headingColor}`}>
        {title}
      </h2>
      <div className="w-12 h-1 bg-selens-yellow mx-auto" aria-hidden="true" />
      {description && (
        <p className={`text-sm sm:text-base ${descColor} font-sans leading-relaxed pt-1`}>
          {description}
        </p>
      )}
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  ) : (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b ${ruleColor} pb-5 ${className}`}
    >
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={`font-mono text-xs uppercase tracking-[0.2em] mb-2 ${eyebrowColor}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`font-serif selens-fluid-h2 font-bold ${headingColor}`}>
          {title}
        </h2>
        <div className="w-12 h-1 bg-selens-yellow mt-3" aria-hidden="true" />
        {description && (
          <p className={`text-sm sm:text-base ${descColor} font-sans leading-relaxed mt-3`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )

  if (!reveal) return content

  return <Reveal>{content}</Reveal>
}
export { SectionHeading }

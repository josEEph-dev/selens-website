import Reveal from './Reveal'

/**
 * Clean institutional SectionHeading (no stamped yellow bars or fake numbered eyebrows).
 */
export default function SectionHeading({
  title,
  description,
  action,
  align = 'left',
  tone = 'dark',
  reveal = true,
  className = '',
}) {
  const isCentered = align === 'center'
  const isPaper = tone === 'paper'
  const headingColor = isPaper ? 'text-selens-paper-ink' : 'text-selens-white'
  const descColor = isPaper ? 'text-selens-paper-muted' : 'text-neutral-300'
  const ruleColor = isPaper ? 'border-selens-paper-rule' : 'border-selens-line'

  const content = isCentered ? (
    <div className={`text-center max-w-2xl mx-auto space-y-2 ${className}`}>
      <h2 className={`font-serif selens-fluid-h2 font-bold ${headingColor}`}>
        {title}
      </h2>
      {description && (
        <p className={`text-sm sm:text-base ${descColor} font-sans leading-relaxed`}>
          {description}
        </p>
      )}
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  ) : (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b ${ruleColor} pb-3.5 ${className}`}
    >
      <div className="max-w-2xl space-y-1">
        <h2 className={`font-serif selens-fluid-h2 font-bold ${headingColor}`}>
          {title}
        </h2>
        {description && (
          <p className={`text-sm sm:text-base ${descColor} font-sans leading-relaxed`}>
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

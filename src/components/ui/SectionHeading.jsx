import Reveal from './Reveal'

/**
 * Quiet Hush-style SectionHeading:
 * Regular-weight tightly-tracked Host Grotesk display heading + slate caption,
 * zero uppercase eyebrows, zero decorative rules or borders.
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
  const headingColor = isPaper ? 'text-[#121315]' : 'text-white'
  const descColor = isPaper ? 'text-[#4d5158]' : 'text-[#a2a7ae]'

  const content = isCentered ? (
    <div className={`text-center max-w-2xl mx-auto space-y-3 ${className}`}>
      <h2 className={`m-text-3 ${headingColor}`}>
        {title}
      </h2>
      {description && (
        <p className={`m-text ${descColor}`}>
          {description}
        </p>
      )}
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  ) : (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${className}`}
    >
      <div className="max-w-2xl space-y-2">
        <h2 className={`m-text-3 ${headingColor}`}>
          {title}
        </h2>
        {description && (
          <p className={`m-text ${descColor}`}>
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

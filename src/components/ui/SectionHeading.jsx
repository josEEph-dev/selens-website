/**
 * SectionHeading:
 * Plain serif heading with a short yellow underline bar and optional description.
 * Left-aligned by default, with an optional align="center" prop.
 * No pill badge in SectionHeading (pill badge appears ONLY in the hero).
 */
export default function SectionHeading({
  title,
  description,
  action,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center'

  if (isCentered) {
    return (
      <div className={`text-center max-w-2xl mx-auto space-y-3 ${className}`}>
        <h2 className="font-serif selens-fluid-h2 font-bold text-selens-white">
          {title}
        </h2>
        <div className="w-12 h-1 bg-selens-yellow mx-auto" aria-hidden="true" />
        {description && (
          <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed pt-1">
            {description}
          </p>
        )}
        {action && <div className="pt-2 flex justify-center">{action}</div>}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-selens-line pb-4 ${className}`}
    >
      <div className="max-w-2xl">
        <h2 className="font-serif selens-fluid-h2 font-bold text-selens-white">
          {title}
        </h2>
        <div className="w-12 h-1 bg-selens-yellow mt-2.5" aria-hidden="true" />
        {description && (
          <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed mt-3">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
export { SectionHeading }

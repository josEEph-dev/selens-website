const ASPECT_CLASSES = {
  '4/3': 'aspect-[4/3]',
  '16/10': 'aspect-[16/10]',
  '16/9': 'aspect-[16/9]',
  '3/2': 'aspect-[3/2]',
  square: 'aspect-square',
}

/**
 * PhotoSlot:
 * Takes an aspect ratio and an optional src.
 * With a src, shows the image (object-cover, object-top).
 * Without one, shows a dark panel with a hairline border and the SELENS logo faintly at low opacity.
 */
export default function PhotoSlot({
  src,
  alt = '',
  aspect = '4/3',
  caption,
  tone = 'paper',
  className = '',
}) {
  const aspectClass = ASPECT_CLASSES[aspect] || aspect
  const isPaper = tone === 'paper'

  return (
    <figure
      className={`relative w-full overflow-hidden ${
        isPaper
          ? 'rounded-[20px] bg-[#e7e8ea]'
          : 'rounded-[6px] border bg-selens-ink border-selens-line'
      } ${aspectClass} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-6 select-none ${
            isPaper ? 'bg-selens-paper-alt' : 'bg-selens-ink'
          }`}
        >
          <img
            src="/website-assets/selens-logo.png"
            alt=""
            aria-hidden="true"
            className={`w-16 h-16 sm:w-20 sm:h-20 object-contain grayscale ${
              isPaper ? 'opacity-20' : 'opacity-15'
            }`}
          />
          {caption && (
            <span
              className={`mt-3 text-xs font-sans text-center max-w-xs ${
                isPaper ? 'text-selens-paper-muted' : 'text-neutral-400'
              }`}
            >
              {caption}
            </span>
          )}
        </div>
      )}
    </figure>
  )
}
export { PhotoSlot }

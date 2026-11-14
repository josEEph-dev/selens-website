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
  className = '',
}) {
  const aspectClass = ASPECT_CLASSES[aspect] || aspect

  return (
    <figure
      className={`relative w-full overflow-hidden rounded-[4px] bg-selens-ink border border-selens-line ${aspectClass} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 select-none bg-selens-ink">
          <img
            src="/website-assets/selens-logo.png"
            alt=""
            aria-hidden="true"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain opacity-15 grayscale"
          />
          {caption && (
            <span className="mt-3 text-xs text-neutral-500 font-sans text-center">
              {caption}
            </span>
          )}
        </div>
      )}
    </figure>
  )
}
export { PhotoSlot }

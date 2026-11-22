import { useState } from 'react'

/**
 * ImageFrame: rounded photo container used by cards and detail pages.
 */
export default function ImageFrame({
  src,
  alt = '',
  aspect = 'aspect-[16/9]',
  fit = 'cover',
  tone = 'paper',
  className = '',
}) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed
  const isPaper = tone === 'paper'

  return (
    <div
      className={`relative w-full ${aspect} overflow-hidden ${
        isPaper
          ? 'bg-[#e7e8ea] rounded-[16px]'
          : 'bg-[#121315] border-b border-selens-line'
      } ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`w-full h-full ${fit === 'contain' ? 'object-contain p-4' : 'object-cover'}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
          <img
            src="/website-assets/selens-logo.png"
            alt=""
            className={`w-12 h-12 object-contain grayscale ${isPaper ? 'opacity-20' : 'opacity-15'}`}
          />
        </div>
      )}
    </div>
  )
}

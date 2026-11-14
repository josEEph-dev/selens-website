import { useState } from 'react'

/**
 * ImageFrame: 16:9 image area used by list cards.
 * Shows the image (object-cover) or a neutral dark placeholder with a faint SELENS logo.
 */
export default function ImageFrame({ src, alt = '', aspect = 'aspect-[16/9]', fit = 'cover', className = '' }) {
  const [failed, setFailed] = useState(false)
  const showImage = src && !failed

  return (
    <div className={`relative w-full ${aspect} overflow-hidden bg-neutral-950 border-b border-selens-line ${className}`}>
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
            className="w-12 h-12 object-contain opacity-10 grayscale"
          />
        </div>
      )}
    </div>
  )
}

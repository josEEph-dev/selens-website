import { useEffect, useRef, useState } from 'react'

/**
 * Reveal:
 * Reusable scroll-reveal wrapper using IntersectionObserver and CSS transitions.
 * - Fades up 12px once per element, staggered by `index` (60ms per step).
 * - Content stays visible by default if JavaScript, IntersectionObserver, or reduced-motion applies.
 */
export default function Reveal({
  children,
  index = 0,
  className = '',
  ...props
}) {
  const ref = useRef(null)
  const [state, setState] = useState('visible')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return
    }

    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState((prev) => (prev === 'pending' ? 'revealed' : 'visible'))
            observer.unobserve(entry.target)
          } else {
            setState((prev) => (prev === 'visible' ? 'pending' : prev))
          }
        }
      },
      {
        rootMargin: '0px 0px -28px 0px',
        threshold: 0.06,
      }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  const delayMs = Math.min(index % 8, 7) * 60

  return (
    <div
      ref={ref}
      data-reveal={state}
      style={
        state === 'revealed' && delayMs > 0
          ? { transitionDelay: `${delayMs}ms` }
          : undefined
      }
      className={`selens-reveal ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export { Reveal }

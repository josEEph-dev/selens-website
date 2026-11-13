import { useEffect } from 'react'

export function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    const created = !meta
    const previousContent = meta ? meta.getAttribute('content') : null

    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'robots')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'noindex, nofollow')

    return () => {
      if (created && meta.parentNode) {
        meta.parentNode.removeChild(meta)
      } else if (previousContent !== null) {
        meta.setAttribute('content', previousContent)
      } else {
        meta.removeAttribute('content')
      }
    }
  }, [])
}

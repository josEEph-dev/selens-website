import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Resets scroll position on client-side route navigation so opening a new page
 * always starts at the top (or scrolls to the target hash section if present).
 */
export default function ScrollToTop() {
  const { pathname, hash, key } = useLocation()
  const prevPathRef = useRef(null)

  useEffect(() => {
    const prevPath = prevPathRef.current
    prevPathRef.current = pathname

    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }

    if (prevPath === null) return

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: prevPath === pathname ? 'smooth' : 'instant',
    })
  }, [pathname, hash, key])

  return null
}

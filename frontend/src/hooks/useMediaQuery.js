import { useEffect, useState } from 'react'

/**
 * Observa um media query e retorna se ela está ativa.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const handler = (event) => setMatches(event.matches)

    setMatches(media.matches)
    media.addEventListener('change', handler)

    return () => media.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const MOBILE_QUERY = '(max-width: 768px)'

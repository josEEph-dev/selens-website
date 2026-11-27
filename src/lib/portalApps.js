export const BUILT_IN_PORTAL_SERVICES = [
  {
    id: 'builtin-teechpoints',
    title: 'TEEchPoints',
    description: 'Track your participation and activity points across SELENS events.',
    status: 'upcoming',
    link_url: '',
  },
  {
    id: 'builtin-documents',
    title: 'Document Requests',
    description: 'Request official organization certificates and endorsements online.',
    status: 'upcoming',
    link_url: '',
  },
]

export function normalizeAppKey(value) {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function slugifyProjectId(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getSafeAppHref(rawUrl) {
  const trimmed = (rawUrl || '').trim()
  if (!trimmed) return null

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return { href: trimmed, external: false }
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return { href: parsed.href, external: true }
    }
    return null
  } catch {
    return null
  }
}

function toPortalCard(item) {
  const linkInfo = getSafeAppHref(item.link_url)
  const isLive = Boolean(linkInfo) && item.status !== 'upcoming'

  return {
    id: item.id,
    title: item.name || item.title || 'SELENS App',
    description: item.description || '',
    status: item.status || 'ongoing',
    href: isLive ? linkInfo.href : null,
    external: isLive ? linkInfo.external : false,
    isLive,
    badge: isLive ? 'Live' : 'Coming soon',
  }
}

export function buildPortalCards(portalProjects = []) {
  const visibleProjects = (portalProjects || [])
    .filter((item) => item && item.status !== 'archived')
    .sort((a, b) => {
      const orderDiff = (Number(a.portal_order) || 0) - (Number(b.portal_order) || 0)
      if (orderDiff !== 0) return orderDiff
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    })

  const projectByKey = new Map()
  visibleProjects.forEach((project) => {
    const key = normalizeAppKey(project.name)
    if (key && !projectByKey.has(key)) {
      projectByKey.set(key, project)
    }
  })

  const consumedKeys = new Set()
  const merged = BUILT_IN_PORTAL_SERVICES.map((service) => {
    const key = normalizeAppKey(service.title)
    const override = projectByKey.get(key)
    if (override) {
      consumedKeys.add(key)
      return toPortalCard(override)
    }
    return toPortalCard(service)
  })

  visibleProjects.forEach((project) => {
    const key = normalizeAppKey(project.name)
    if (consumedKeys.has(key)) return
    merged.push(toPortalCard(project))
  })

  return merged.map((card, index) => ({
    ...card,
    num: String(index + 1).padStart(2, '0'),
  }))
}

import { describe, it, expect } from 'vitest'
import { buildPortalCards, getSafeAppHref, slugifyProjectId } from '../lib/portalApps'

describe('portalApps helpers', () => {
  it('allows http, https, and relative paths while rejecting unsafe URLs', () => {
    expect(getSafeAppHref('https://juanlegend1.github.io/ElectroStock/index.html')).toEqual({
      href: 'https://juanlegend1.github.io/ElectroStock/index.html',
      external: true,
    })
    expect(getSafeAppHref('/portal/teechpoints')).toEqual({
      href: '/portal/teechpoints',
      external: false,
    })
    expect(getSafeAppHref('javascript:alert(1)')).toBeNull()
    expect(getSafeAppHref('//evil.example.com')).toBeNull()
    expect(getSafeAppHref('   ')).toBeNull()
  })

  it('slugifies project names into anchor IDs', () => {
    expect(slugifyProjectId('ElectroStock')).toBe('electrostock')
    expect(slugifyProjectId('BayadEE: Students Fines Monitoring')).toBe(
      'bayadee-students-fines-monitoring'
    )
  })

  it('merges built-in services with Supabase portal apps in portal_order sequence', () => {
    const cards = buildPortalCards([
      {
        id: 'proj-2',
        name: 'EEngiquest',
        description: 'Use your SELENS account',
        status: 'upcoming',
        link_url: 'https://eengiquest.example.com',
        portal_order: 2,
        created_at: '2026-11-27T00:00:00Z',
      },
      {
        id: 'proj-1',
        name: 'ElectroStock',
        description: 'Hardware lending library',
        status: 'ongoing',
        link_url: 'https://juanlegend1.github.io/ElectroStock/index.html',
        portal_order: 1,
        created_at: '2026-11-27T01:00:00Z',
      },
    ])

    expect(cards.map((c) => [c.num, c.title, c.badge, c.isLive])).toEqual([
      ['01', 'TEEchPoints', 'Coming soon', false],
      ['02', 'Document Requests', 'Coming soon', false],
      ['03', 'ElectroStock', 'Live', true],
      ['04', 'EEngiquest', 'Coming soon', false],
    ])
    expect(cards[2].href).toBe('https://juanlegend1.github.io/ElectroStock/index.html')
    expect(cards[2].external).toBe(true)
    expect(cards[3].href).toBeNull()
  })

  it('overrides built-in service card instead of duplicating when name matches', () => {
    const cards = buildPortalCards([
      {
        id: 'proj-tp',
        name: 'TEEchPoints',
        description: 'Check your live points.',
        status: 'ongoing',
        link_url: 'https://teechpoints.example.com',
        portal_order: 1,
        created_at: '2026-11-27T00:00:00Z',
      },
    ])

    expect(cards).toHaveLength(2)
    expect(cards[0]).toMatchObject({
      num: '01',
      title: 'TEEchPoints',
      badge: 'Live',
      isLive: true,
      href: 'https://teechpoints.example.com/',
    })
  })
})

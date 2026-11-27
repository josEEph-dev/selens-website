import { describe, it, expect } from 'vitest'
import {
  COMMITTEES,
  COMMITTEE_GROUPS,
  getGroupForCommittee,
  matchesCommitteeFilter,
  formatCommitteeLabel,
} from '../lib/config'

describe('committee configuration and Year Representatives', () => {
  const yearReps = [
    '1st Year Representative',
    '2nd Year Representative',
    '3rd Year Representative',
    '4th Year Representative',
  ]

  it('includes 1st through 4th Year Representative in COMMITTEES and COMMITTEE_GROUPS', () => {
    expect(COMMITTEE_GROUPS['Year Representatives']).toEqual(yearReps)
    yearReps.forEach((rep) => {
      expect(COMMITTEES).toContain(rep)
      expect(getGroupForCommittee(rep)).toBe('Year Representatives')
      expect(formatCommitteeLabel(rep)).toBe(rep)
    })
  })

  it('filters items by Year Representatives group and individual year level', () => {
    expect(
      matchesCommitteeFilter('2nd Year Representative', 'Year Representatives', 'all')
    ).toBe(true)
    expect(
      matchesCommitteeFilter(
        '2nd Year Representative',
        'Year Representatives',
        '2nd Year Representative'
      )
    ).toBe(true)
    expect(
      matchesCommitteeFilter(
        '3rd Year Representative',
        'Year Representatives',
        '2nd Year Representative'
      )
    ).toBe(false)
    expect(
      matchesCommitteeFilter('Academic Affairs', 'Year Representatives', 'all')
    ).toBe(false)
  })

  it('preserves Legislative committee filtering and label formatting', () => {
    expect(formatCommitteeLabel('Projects and Development')).toBe(
      'Legislative • Projects and Development'
    )
    expect(
      matchesCommitteeFilter('Projects and Development', 'Legislative', 'Projects and Development')
    ).toBe(true)
    expect(
      matchesCommitteeFilter('Academic Affairs', 'Legislative', 'Projects and Development')
    ).toBe(false)
  })
})

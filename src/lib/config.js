export const CURRENT_ACADEMIC_YEAR = '2026-2027'

export const COMMITTEES = [
  'Academic Affairs',
  'Administrative Affairs',
  'Projects and Development',
  'Public Relations and Media',
  'Culture, Sports, and Recreation',
  "Students' Rights and Welfare",
  'Ways and Means',
  '1st Year Representative',
  '2nd Year Representative',
  '3rd Year Representative',
  '4th Year Representative',
  'Executive Board',
  'Judiciary',
  'COMELEC',
  'General',
]

export const COMMITTEE_GROUPS = {
  'Executive / Appointive': ['Executive Board'],
  'Legislative': [
    'Academic Affairs',
    'Administrative Affairs',
    'Projects and Development',
    'Public Relations and Media',
    'Culture, Sports, and Recreation',
    "Students' Rights and Welfare",
    'Ways and Means',
  ],
  'Year Representatives': [
    '1st Year Representative',
    '2nd Year Representative',
    '3rd Year Representative',
    '4th Year Representative',
  ],
  'Judiciary / COMELEC': ['Judiciary', 'COMELEC'],
  'General': ['General'],
}

export const SUBFILTER_GROUPS = {
  Legislative: {
    label: 'Committees',
    allLabel: 'All Legislative',
  },
  'Year Representatives': {
    label: 'Year Level',
    allLabel: 'All Year Representatives',
  },
}

export function getGroupForCommittee(committee) {
  if (!committee) return 'General'
  for (const [group, list] of Object.entries(COMMITTEE_GROUPS)) {
    if (list.includes(committee)) return group
  }
  return 'General'
}

export function matchesCommitteeFilter(committee, selectedGroup, selectedCommittee) {
  const itemGroup = getGroupForCommittee(committee)
  if (selectedGroup !== 'all' && itemGroup !== selectedGroup) {
    return false
  }
  if (
    selectedGroup in SUBFILTER_GROUPS &&
    selectedCommittee !== 'all' &&
    committee !== selectedCommittee
  ) {
    return false
  }
  return true
}

export function formatCommitteeLabel(committee) {
  if (!committee) return 'General'
  const group = getGroupForCommittee(committee)
  if (group === 'Legislative') {
    return `Legislative • ${committee}`
  }
  return committee
}

export function isValidAcademicYear(year) {
  return /^\d{4}-\d{4}$/.test(year)
}

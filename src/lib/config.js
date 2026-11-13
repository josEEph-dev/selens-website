export const CURRENT_ACADEMIC_YEAR = '2026-2027'

export const COMMITTEES = [
  'Academic Affairs',
  'Administrative Affairs',
  'Projects and Development',
  'Public Relations and Media',
  'Culture, Sports, and Recreation',
  "Students' Rights and Welfare",
  'Ways and Means',
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
  'Judiciary / COMELEC': ['Judiciary', 'COMELEC'],
  'General': ['General'],
}

export function getGroupForCommittee(committee) {
  if (!committee) return 'General'
  for (const [group, list] of Object.entries(COMMITTEE_GROUPS)) {
    if (list.includes(committee)) return group
  }
  return 'General'
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

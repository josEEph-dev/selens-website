import React from 'react'
import { COMMITTEE_GROUPS, getGroupForCommittee } from '../lib/config'

export default function CommitteeFilter({
  items = [],
  selectedGroup = 'all',
  onGroupChange,
  selectedCommittee = 'all',
  onCommitteeChange,
  className = '',
}) {
  const groups = ['Executive / Appointive', 'Legislative', 'Judiciary / COMELEC', 'General']

  const groupCounts = groups.reduce((acc, g) => {
    acc[g] = items.filter((item) => getGroupForCommittee(item.committee) === g).length
    return acc
  }, {})

  const visibleGroups = groups.filter((g) => groupCounts[g] > 0)

  if (items.length === 0 || visibleGroups.length === 0) {
    return null
  }

  const legislativeCommittees = COMMITTEE_GROUPS['Legislative'] || []

  return (
    <div className={`space-y-3 min-w-0 ${className}`}>
      {/* First row: Group pills */}
      <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        <span className="m-text-6 font-medium selens-filter-label block sm:inline shrink-0">
          Group
        </span>
        <div className="selens-chip-row" role="group" aria-label="Filter by group">
          <button
            type="button"
            aria-pressed={selectedGroup === 'all'}
            onClick={() => {
              onGroupChange('all')
              onCommitteeChange('all')
            }}
            className="selens-chip"
          >
            All ({items.length})
          </button>

          {visibleGroups.map((group) => (
            <button
              key={group}
              type="button"
              aria-pressed={selectedGroup === group}
              onClick={() => {
                onGroupChange(group)
                onCommitteeChange('all')
              }}
              className="selens-chip"
            >
              {group} ({groupCounts[group]})
            </button>
          ))}
        </div>
      </div>

      {/* Second row: Legislative committees if Legislative is selected */}
      {selectedGroup === 'Legislative' && (
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3 sm:pl-4 sm:border-l-2 sm:border-[#FFD100]">
          <span className="m-text-6 font-medium selens-filter-label block sm:inline shrink-0">
            Committees
          </span>
          <div className="selens-chip-row" role="group" aria-label="Filter by committee">
            <button
              type="button"
              aria-pressed={selectedCommittee === 'all'}
              onClick={() => onCommitteeChange('all')}
              className="selens-chip"
            >
              All Legislative
            </button>
            {legislativeCommittees.map((comm) => {
              const count = items.filter((item) => item.committee === comm).length
              return (
                <button
                  key={comm}
                  type="button"
                  aria-pressed={selectedCommittee === comm}
                  onClick={() => onCommitteeChange(comm)}
                  className="selens-chip"
                >
                  {comm} {count > 0 && `(${count})`}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

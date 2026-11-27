import React from 'react'
import { COMMITTEE_GROUPS, SUBFILTER_GROUPS, getGroupForCommittee } from '../lib/config'

export default function CommitteeFilter({
  items = [],
  selectedGroup = 'all',
  onGroupChange,
  selectedCommittee = 'all',
  onCommitteeChange,
  className = '',
}) {
  const groups = Object.keys(COMMITTEE_GROUPS)

  const groupCounts = groups.reduce((acc, g) => {
    acc[g] = items.filter((item) => getGroupForCommittee(item.committee) === g).length
    return acc
  }, {})

  const visibleGroups = groups.filter((g) => groupCounts[g] > 0)

  if (items.length === 0 || visibleGroups.length === 0) {
    return null
  }

  const subfilterMeta = SUBFILTER_GROUPS[selectedGroup]
  const subfilterItems = subfilterMeta ? COMMITTEE_GROUPS[selectedGroup] || [] : []

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

      {/* Second row: Sub-options for Legislative committees or Year Representatives */}
      {subfilterMeta && (
        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3 sm:pl-4 sm:border-l-2 sm:border-[#FFD100]">
          <span className="m-text-6 font-medium selens-filter-label block sm:inline shrink-0">
            {subfilterMeta.label}
          </span>
          <div className="selens-chip-row" role="group" aria-label={`Filter by ${subfilterMeta.label.toLowerCase()}`}>
            <button
              type="button"
              aria-pressed={selectedCommittee === 'all'}
              onClick={() => onCommitteeChange('all')}
              className="selens-chip"
            >
              {subfilterMeta.allLabel}
            </button>
            {subfilterItems.map((comm) => {
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

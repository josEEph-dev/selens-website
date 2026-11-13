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

  // Count items per group in the current selection
  const groupCounts = groups.reduce((acc, g) => {
    acc[g] = items.filter((item) => getGroupForCommittee(item.committee) === g).length
    return acc
  }, {})

  // Available groups are those with > 0 items
  const visibleGroups = groups.filter((g) => groupCounts[g] > 0)

  // If there are no groups with items or only 1 item total, or all is empty, we still render All if items exist
  if (items.length === 0 || visibleGroups.length === 0) {
    return null
  }

  const legislativeCommittees = COMMITTEE_GROUPS['Legislative'] || []

  return (
    <div className={`space-y-3 ${className}`}>
      {/* First row: Group chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mr-1">
          Group:
        </span>
        <button
          onClick={() => {
            onGroupChange('all')
            onCommitteeChange('all')
          }}
          className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition ${
            selectedGroup === 'all'
              ? 'bg-selens-yellow text-selens-black'
              : 'bg-selens-ink border border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
          }`}
        >
          All ({items.length})
        </button>

        {visibleGroups.map((group) => {
          const isActive = selectedGroup === group
          return (
            <button
              key={group}
              onClick={() => {
                onGroupChange(group)
                onCommitteeChange('all')
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition ${
                isActive
                  ? 'bg-selens-yellow text-selens-black'
                  : 'bg-selens-ink border border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
              }`}
            >
              {group} ({groupCounts[group]})
            </button>
          )
        })}
      </div>

      {/* Second row: Legislative committees if Legislative is selected */}
      {selectedGroup === 'Legislative' && (
        <div className="flex flex-wrap items-center gap-1.5 pl-2 sm:pl-4 border-l-2 border-selens-yellow/60 pt-1">
          <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mr-1">
            Committees:
          </span>
          <button
            onClick={() => onCommitteeChange('all')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] transition ${
              selectedCommittee === 'all'
                ? 'bg-selens-yellow text-selens-black'
                : 'bg-selens-ink border border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
            }`}
          >
            All Legislative
          </button>
          {legislativeCommittees.map((comm) => {
            const count = items.filter((item) => item.committee === comm).length
            const isCommActive = selectedCommittee === comm
            return (
              <button
                key={comm}
                onClick={() => onCommitteeChange(comm)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-[4px] transition ${
                  isCommActive
                    ? 'bg-selens-yellow text-selens-black'
                    : 'bg-selens-ink border border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
                }`}
              >
                {comm} {count > 0 && `(${count})`}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

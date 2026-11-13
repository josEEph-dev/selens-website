import React from 'react'
import { COMMITTEE_GROUPS } from '../lib/config'

const inputStyle = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

export default function PostedBySelect({
  value = 'General',
  onChange,
  required = true,
  label = 'Posted By (Committee)',
  className = '',
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
        {label} {required && <span className="text-selens-yellow">*</span>}
      </label>
      <select
        required={required}
        value={value || 'General'}
        onChange={(e) => onChange(e.target.value)}
        className={inputStyle}
      >
        {Object.entries(COMMITTEE_GROUPS).map(([groupName, committees]) => (
          <optgroup key={groupName} label={groupName} className="bg-selens-ink text-selens-yellow font-bold">
            {committees.map((comm) => (
              <option key={comm} value={comm} className="bg-selens-black text-selens-white font-normal">
                {comm}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

import React from 'react'
import { COMMITTEE_GROUPS } from '../lib/config'

export default function PostedBySelect({
  value = 'General',
  onChange,
  required = true,
  label = 'Posted By (Committee)',
  className = '',
}) {
  return (
    <div className={`m-field ${className}`}>
      <label className="m-field__label">
        {label} {required && <span className="text-[#121315] font-semibold">*</span>}
      </label>
      <select
        required={required}
        value={value || 'General'}
        onChange={(e) => onChange(e.target.value)}
        className="m-field__control cursor-pointer"
      >
        {Object.entries(COMMITTEE_GROUPS).map(([groupName, committees]) => (
          <optgroup key={groupName} label={groupName}>
            {committees.map((comm) => (
              <option key={comm} value={comm}>
                {comm}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

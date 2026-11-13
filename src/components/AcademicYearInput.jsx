import React, { useState } from 'react'
import { CURRENT_ACADEMIC_YEAR, isValidAcademicYear } from '../lib/config'

const inputStyle = 'w-full px-3.5 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans'

export default function AcademicYearInput({
  value = CURRENT_ACADEMIC_YEAR,
  onChange,
  existingYears = [],
  label = 'Academic Year',
}) {
  const allYears = Array.from(new Set([CURRENT_ACADEMIC_YEAR, ...existingYears].filter(Boolean)))
  const isCustomInitial = !allYears.includes(value)
  const [mode, setMode] = useState(isCustomInitial ? 'custom' : 'select')
  const [customVal, setCustomVal] = useState(isCustomInitial ? value : '')

  const handleSelectChange = (e) => {
    const val = e.target.value
    if (val === '__custom__') {
      setMode('custom')
      if (customVal && isValidAcademicYear(customVal)) {
        onChange(customVal)
      }
    } else {
      setMode('select')
      onChange(val)
    }
  }

  const handleCustomChange = (e) => {
    const val = e.target.value
    setCustomVal(val)
    onChange(val)
  }

  const error = mode === 'custom' && customVal && !isValidAcademicYear(customVal)
    ? 'Format must match YYYY-YYYY (e.g., 2026-2027)'
    : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {label}
        </label>
        {mode === 'custom' && (
          <button
            type="button"
            onClick={() => {
              setMode('select')
              onChange(allYears[0] || CURRENT_ACADEMIC_YEAR)
            }}
            className="text-[11px] text-selens-yellow hover:underline"
          >
            Choose existing year
          </button>
        )}
      </div>

      {mode === 'select' ? (
        <select
          value={allYears.includes(value) ? value : '__custom__'}
          onChange={handleSelectChange}
          className={inputStyle}
        >
          {allYears.map((yr) => (
            <option key={yr} value={yr}>
              A.Y. {yr} {yr === CURRENT_ACADEMIC_YEAR ? '(Current)' : ''}
            </option>
          ))}
          <option value="__custom__">+ Enter new academic year...</option>
        </select>
      ) : (
        <div className="space-y-1">
          <input
            type="text"
            required
            pattern="^\d{4}-\d{4}$"
            placeholder="e.g. 2027-2028"
            value={customVal}
            onChange={handleCustomChange}
            className={`${inputStyle} ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="text-xs text-red-400 font-sans">{error}</p>}
        </div>
      )}
    </div>
  )
}

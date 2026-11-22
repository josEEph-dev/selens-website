import React, { useState } from 'react'
import { CURRENT_ACADEMIC_YEAR, isValidAcademicYear } from '../lib/config'

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
    <div className="m-field">
      <div className="flex items-center justify-between gap-2">
        <label className="m-field__label">
          {label}
        </label>
        {mode === 'custom' && (
          <button
            type="button"
            onClick={() => {
              setMode('select')
              onChange(allYears[0] || CURRENT_ACADEMIC_YEAR)
            }}
            className="m-link text-xs font-medium text-[#121315] cursor-pointer"
          >
            Choose existing year
          </button>
        )}
      </div>

      {mode === 'select' ? (
        <select
          value={allYears.includes(value) ? value : '__custom__'}
          onChange={handleSelectChange}
          className="m-field__control cursor-pointer"
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
            aria-invalid={Boolean(error)}
            className="m-field__control"
          />
          {error && <p className="text-xs text-red-700">{error}</p>}
        </div>
      )}
    </div>
  )
}

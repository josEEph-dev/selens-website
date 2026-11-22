import React from 'react'
import { Calendar } from 'lucide-react'

export default function YearSelector({ years = [], selectedYear, onChange, className = '' }) {
  if (!years || years.length <= 1) return null

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <label
        htmlFor="selens-year-select"
        className="text-xs font-semibold uppercase tracking-wider selens-filter-label flex items-center gap-1.5 shrink-0"
      >
        <Calendar className="w-3.5 h-3.5 text-selens-yellow-ink" aria-hidden="true" />
        <span>Academic Year</span>
      </label>
      <select
        id="selens-year-select"
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
        className="selens-select min-h-[44px] sm:min-h-[40px] min-w-0 text-base sm:text-sm font-semibold pl-3 pr-8 py-2 rounded-[3px] transition-colors cursor-pointer"
        aria-label="Select Academic Year"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            A.Y. {year}
          </option>
        ))}
      </select>
    </div>
  )
}

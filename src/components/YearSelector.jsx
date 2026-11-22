import React from 'react'
import { Calendar } from 'lucide-react'

export default function YearSelector({ years = [], selectedYear, onChange, className = '' }) {
  if (!years || years.length <= 1) return null

  return (
    <div className={`flex flex-wrap items-center gap-2.5 min-w-0 ${className}`}>
      <label
        htmlFor="selens-year-select"
        className="m-text-6 font-medium selens-filter-label flex items-center gap-1.5 shrink-0"
      >
        <Calendar className="w-4 h-4 text-[#4d5158]" aria-hidden="true" />
        <span>Academic Year</span>
      </label>
      <select
        id="selens-year-select"
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
        className="selens-select min-h-[44px] sm:min-h-[40px] min-w-0 text-sm font-medium pl-4 pr-8 py-2 transition-colors cursor-pointer"
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

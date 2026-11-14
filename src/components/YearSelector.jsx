import React from 'react'
import { Calendar } from 'lucide-react'

export default function YearSelector({ years = [], selectedYear, onChange, className = '' }) {
  if (!years || years.length <= 1) return null

  return (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <label
        htmlFor="selens-year-select"
        className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5 shrink-0"
      >
        <Calendar className="w-3.5 h-3.5 text-selens-yellow" aria-hidden="true" />
        <span>Academic Year</span>
      </label>
      <select
        id="selens-year-select"
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[44px] sm:min-h-[40px] min-w-0 bg-selens-ink border border-selens-line text-selens-white text-base sm:text-sm font-semibold pl-3 pr-8 py-2 rounded-[4px] focus:outline-none focus:border-selens-yellow transition-colors cursor-pointer"
        aria-label="Select Academic Year"
      >
        {years.map((year) => (
          <option key={year} value={year} className="bg-selens-ink text-selens-white">
            A.Y. {year}
          </option>
        ))}
      </select>
    </div>
  )
}

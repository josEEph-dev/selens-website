import React from 'react'
import { Calendar } from 'lucide-react'

export default function YearSelector({ years = [], selectedYear, onChange, className = '' }) {
  if (!years || years.length <= 1) return null

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-selens-yellow" />
        <span>Academic Year:</span>
      </span>
      <select
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
        className="bg-selens-ink border border-selens-line text-selens-white text-xs font-semibold px-3 py-1.5 rounded-[4px] focus:outline-none focus:border-selens-yellow transition cursor-pointer"
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

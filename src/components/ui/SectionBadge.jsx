/**
 * SectionBadge: Small pill label, used ONLY in the hero.
 */
export default function SectionBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-selens-ink/90 border border-selens-line text-xs font-sans font-semibold uppercase tracking-[0.12em] text-selens-yellow ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-selens-yellow shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </span>
  )
}
export { SectionBadge }

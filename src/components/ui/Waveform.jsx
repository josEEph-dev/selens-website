/**
 * Waveform: original inline SVG of layered AC sine-wave lines.
 * The only decorative artwork on the site. Used by the Home hero and PageHeader.
 * `intensity` scales all stroke opacities (1 = hero, ~0.45 = page headers).
 */
export default function Waveform({ intensity = 1, className = '' }) {
  const o = (v) => Math.min(1, v * intensity)

  return (
    <svg
      className={`absolute inset-0 w-full h-full ${className}`}
      viewBox="0 0 1440 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <line x1="0" y1="400" x2="1440" y2="400" stroke="#FFFFFF" strokeOpacity={o(0.04)} strokeWidth="1" />
      <line x1="0" y1="260" x2="1440" y2="260" stroke="#FFFFFF" strokeOpacity={o(0.025)} strokeDasharray="4 8" strokeWidth="1" />
      <line x1="0" y1="540" x2="1440" y2="540" stroke="#FFFFFF" strokeOpacity={o(0.025)} strokeDasharray="4 8" strokeWidth="1" />

      <path d="M-60 400 C 180 170, 420 630, 660 400 C 900 170, 1140 630, 1380 400 C 1460 320, 1500 300, 1540 400" stroke="#FFD100" strokeOpacity={o(0.18)} strokeWidth="1.5" />
      <path d="M-60 415 C 180 205, 420 625, 660 415 C 900 205, 1140 625, 1380 415" stroke="#FFD100" strokeOpacity={o(0.11)} strokeWidth="1" />
      <path d="M-60 430 C 180 240, 420 620, 660 430 C 900 240, 1140 620, 1380 430" stroke="#FFD100" strokeOpacity={o(0.07)} strokeWidth="1" />

      <path d="M-60 360 C 180 590, 420 130, 660 360 C 900 590, 1140 130, 1380 360" stroke="#FFFFFF" strokeOpacity={o(0.12)} strokeWidth="1.25" />
      <path d="M-60 380 C 180 575, 420 185, 660 380 C 900 575, 1140 185, 1380 380" stroke="#FFFFFF" strokeOpacity={o(0.07)} strokeWidth="1" />

      <path d="M-60 460 C 120 310, 300 570, 480 400 C 660 230, 840 570, 1020 400 C 1200 230, 1380 510, 1520 390" stroke="#FFD100" strokeOpacity={o(0.09)} strokeWidth="1" />
      <path d="M-60 330 C 140 470, 340 240, 540 395 C 740 550, 940 245, 1140 395 C 1340 545, 1440 310, 1520 370" stroke="#FFFFFF" strokeOpacity={o(0.06)} strokeWidth="1" />
    </svg>
  )
}
export { Waveform }

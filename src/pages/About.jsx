import { PageHeader, PrimaryButton, Reveal } from '../components/SharedUI'
import { Download } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

export default function About() {
  const objectives = [
    {
      numeral: '01',
      title: 'Academic excellence & board preparation',
      description:
        'We organize collaborative study groups, technical tutorials, and mock licensure examinations to help students build a solid foundation for their courses and the PRC Registered Electrical Engineer examinations.',
    },
    {
      numeral: '02',
      title: 'Technical skills & hands-on innovation',
      description:
        'We bridge classroom theory and practical engineering through circuit design workshops, equipment loaning, and competitions aligned with the latest industry practices and safety codes.',
    },
    {
      numeral: '03',
      title: 'Community service & electrification',
      description:
        'We bring engineering expertise to local communities through volunteer technical assistance, solar energy awareness, and high school STEM outreach programs.',
    },
  ]

  return (
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        eyebrow="Charter & Mandate"
        title="About SELENS"
        description="The Society of Electrical Engineering Students (SELENS) is the official student organization of Electrical Engineering at Mindanao State University - General Santos."
      />

      <div className="selens-container py-14 sm:py-20 space-y-20">
        {/* 01. Constitutional Preamble: Asymmetric Editorial Spread */}
        <section id="mission" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-2.5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-selens-paper-muted">
              01 / Preamble
            </p>
            <h2 className="font-serif selens-fluid-h2 font-bold text-selens-paper-ink">
              Constitutional preamble
            </h2>
            <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />
          </div>

          <Reveal index={0} className="lg:col-span-8">
            <blockquote className="font-serif italic text-lg sm:text-2xl text-selens-paper-ink border-l-4 border-selens-yellow pl-6 sm:pl-8 py-2 leading-relaxed">
              &ldquo;We, the Electrical Engineering students of Mindanao State University - General Santos, in order to establish an organization that shall embody our ideals, foster academic excellence, promote technical innovation and ethical responsibility, protect member rights and welfare, and contribute to community development, do hereby establish this Constitution and By-Laws.&rdquo;
            </blockquote>
          </Reveal>
        </section>

        {/* 02. Objectives: Borderless Hairline-Ruled 3-Column Editorial Ledger */}
        <section className="space-y-8 border-t border-selens-paper-rule pt-14">
          <div className="max-w-2xl space-y-2.5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-selens-paper-muted">
              02 / Mandate
            </p>
            <h2 className="font-serif selens-fluid-h2 font-bold text-selens-paper-ink">
              Our core objectives
            </h2>
            <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />
            <p className="text-sm sm:text-base text-selens-paper-muted font-sans leading-relaxed pt-1">
              Three central pillars guide our initiatives, events, and member programs throughout the academic year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-selens-paper-rule border-t-2 border-selens-paper-ink">
            {objectives.map((obj, idx) => (
              <Reveal
                key={obj.numeral}
                index={idx}
                className="py-6 md:px-7 first:md:pl-0 last:md:pr-0 space-y-3"
              >
                <span className="font-mono text-2xl sm:text-3xl font-bold text-selens-paper-ink block leading-none">
                  {obj.numeral}
                </span>
                <h3 className="font-serif font-bold text-lg text-selens-paper-ink leading-snug">
                  {obj.title}
                </h3>
                <p className="text-sm sm:text-base text-selens-paper-muted leading-relaxed font-sans">
                  {obj.description}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 03. Governing Documents: High-Contrast Matte Black Callout Band */}
        <section className="space-y-6 border-t border-selens-paper-rule pt-14">
          <div className="max-w-2xl space-y-2.5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-selens-paper-muted">
              03 / Archive
            </p>
            <h2 className="font-serif selens-fluid-h2 font-bold text-selens-paper-ink">
              Governing documents
            </h2>
            <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />
            <p className="text-sm sm:text-base text-selens-paper-muted font-sans leading-relaxed pt-1">
              Read our constitution and bylaws to understand organizational structure, membership rights, and election procedures.
            </p>
          </div>

          <Reveal>
            <div className="bg-selens-black text-selens-white border-l-4 border-selens-yellow rounded-[3px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-selens-white">
                  SELENS Constitution &amp; By-Laws
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Official governing document outlining student organization policies, officer duties, and assembly operations for A.Y. {CURRENT_ACADEMIC_YEAR}.
                </p>
              </div>
              <PrimaryButton
                href="/website-assets/constitution-and-by-laws-of-selens.pdf"
                download
                className="gap-2 shrink-0 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download constitution (PDF)</span>
              </PrimaryButton>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  )
}

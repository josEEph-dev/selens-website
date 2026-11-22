import { PageHeader, Reveal } from '../components/SharedUI'
import { Download, ArrowUpRight } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

export default function About() {
  const objectives = [
    {
      num: '01',
      title: 'Academic excellence & board preparation',
      description:
        'We organize collaborative study groups, technical tutorials, and mock licensure examinations to help students build a solid foundation for their courses and the PRC Registered Electrical Engineer examinations.',
    },
    {
      num: '02',
      title: 'Technical skills & hands-on innovation',
      description:
        'We bridge classroom theory and practical engineering through circuit design workshops, equipment loaning, and competitions aligned with the latest industry practices and safety codes.',
    },
    {
      num: '03',
      title: 'Community service & electrification',
      description:
        'We bring engineering expertise to local communities through volunteer technical assistance, solar energy awareness, and high school STEM outreach programs.',
    },
  ]

  return (
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        title="About SELENS"
        description="The Society of Electrical Engineering Students (SELENS) is the official student organization of Electrical Engineering at Mindanao State University - General Santos."
      />

      <div className="selens-container py-10 sm:py-16 space-y-16">
        {/* Preamble — Pure White 28px Panel */}
        <section id="mission" className="m-panel-light p-7 sm:p-11 scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-2">
              <h2 className="m-text-3 text-[#121315]">
                Constitutional Preamble.
              </h2>
              <p className="m-text-6 text-[#4d5158]">
                Founding mandate of the organization.
              </p>
            </div>

            <Reveal index={0} className="lg:col-span-8">
              <blockquote className="text-xl sm:text-2xl lg:text-[26px] font-normal tracking-[-0.025em] leading-[1.35] text-[#121315] border-l-[3px] border-[#FFD100] pl-5 sm:pl-7">
                &ldquo;We, the Electrical Engineering students of Mindanao State University - General Santos, in order to establish an organization that shall embody our ideals, foster academic excellence, promote technical innovation and ethical responsibility, protect member rights and welfare, and contribute to community development, do hereby establish this Constitution and By-Laws.&rdquo;
              </blockquote>
            </Reveal>
          </div>
        </section>

        {/* Core Objectives — 3 Pure White 20px Surfaces on Mist */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <h2 className="m-text-3 text-[#121315] lg:col-span-7">
              Our core objectives.
            </h2>
            <p className="m-text text-[#4d5158] lg:col-span-5">
              Three central pillars guide our initiatives, events, and member programs throughout the academic year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {objectives.map((obj, idx) => (
              <Reveal
                key={obj.title}
                index={idx}
                className="m-surface flex flex-col justify-between gap-5"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#121315] text-white m-text-4">
                  {obj.num}
                </span>
                <div className="space-y-2.5">
                  <h3 className="m-text-5 text-[#121315]">
                    {obj.title}
                  </h3>
                  <p className="m-text-6 text-[#4d5158]">
                    {obj.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Official Organizational Charts (Real SELENS & DEE Assets) */}
        <section className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <h2 className="m-text-3 text-[#121315] lg:col-span-7">
              Organizational structure.
            </h2>
            <p className="m-text text-[#4d5158] lg:col-span-5">
              Official organizational charts for the Society of Electrical Engineering Students and the Department of Electrical Engineering faculty.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <figure className="lg:col-span-8 m-panel-light p-5 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <figcaption className="m-text-5 text-[#121315]">
                  SELENS Organizational Chart
                </figcaption>
                <a
                  href="/website-assets/selens-org-chart.png"
                  target="_blank"
                  rel="noreferrer"
                  className="m-link m-text-4 text-[#121315]"
                >
                  <span>View full size</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
              <div className="rounded-[16px] overflow-hidden bg-[#e7e8ea]/50 p-2">
                <img
                  src="/website-assets/selens-org-chart.png"
                  alt="SELENS Set of Officers Organizational Chart"
                  loading="lazy"
                  className="w-full h-auto rounded-[12px] block"
                />
              </div>
            </figure>

            <figure className="lg:col-span-4 m-panel-light p-5 sm:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <figcaption className="m-text-5 text-[#121315]">
                  DEE Faculty &amp; Staff
                </figcaption>
                <a
                  href="/website-assets/faculty-org-chart.png"
                  target="_blank"
                  rel="noreferrer"
                  className="m-link m-text-4 text-[#121315]"
                >
                  <span>Full size</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
              <div className="rounded-[16px] overflow-hidden bg-[#e7e8ea]/50 p-2">
                <img
                  src="/website-assets/faculty-org-chart.png"
                  alt="Department of Electrical Engineering Faculty Organizational Chart"
                  loading="lazy"
                  className="w-full h-auto rounded-[12px] block"
                />
              </div>
            </figure>
          </div>
        </section>

        {/* Governing Documents — Deep Ink 28px Panel */}
        <section>
          <div className="m-panel-dark hush-dark-scope p-7 sm:p-11 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2.5 max-w-2xl">
              <h2 className="m-text-3 text-white">
                Constitution &amp; By-Laws<span className="text-[#FFD100]">.</span>
              </h2>
              <p className="m-text text-[#a2a7ae]">
                Official governing document outlining student organization policies, officer duties, and assembly operations for A.Y. {CURRENT_ACADEMIC_YEAR}.
              </p>
            </div>
            <a
              href="/website-assets/constitution-and-by-laws-of-selens.pdf"
              download
              className="m-btn-2 m-btn-2--dark shrink-0 self-start lg:self-auto"
            >
              <span className="m-btn-2__label">Download constitution (PDF)</span>
              <span className="m-btn-2__icon" aria-hidden="true">
                <Download className="w-4 h-4" />
              </span>
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

import { PageHeader, PrimaryButton, Reveal } from '../components/SharedUI'
import { Download, ExternalLink } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR } from '../lib/config'

export default function About() {
  const objectives = [
    {
      title: 'Academic excellence & board preparation',
      description:
        'We organize collaborative study groups, technical tutorials, and mock licensure examinations to help students build a solid foundation for their courses and the PRC Registered Electrical Engineer examinations.',
    },
    {
      title: 'Technical skills & hands-on innovation',
      description:
        'We bridge classroom theory and practical engineering through circuit design workshops, equipment loaning, and competitions aligned with the latest industry practices and safety codes.',
    },
    {
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

      <div className="selens-container py-12 sm:py-16 space-y-16">
        {/* Preamble */}
        <section id="mission" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-1.5">
            <h2 className="font-serif selens-fluid-h2 font-bold text-neutral-950">
              Constitutional Preamble
            </h2>
            <p className="text-sm text-neutral-600">
              Founding mandate of the organization.
            </p>
          </div>

          <Reveal index={0} className="lg:col-span-8">
            <blockquote className="font-serif italic text-base sm:text-xl text-neutral-900 border-l-4 border-selens-yellow pl-5 sm:pl-7 py-2 leading-relaxed bg-neutral-50 pr-5 rounded-r-[4px]">
              &ldquo;We, the Electrical Engineering students of Mindanao State University - General Santos, in order to establish an organization that shall embody our ideals, foster academic excellence, promote technical innovation and ethical responsibility, protect member rights and welfare, and contribute to community development, do hereby establish this Constitution and By-Laws.&rdquo;
            </blockquote>
          </Reveal>
        </section>

        {/* Core Objectives */}
        <section className="space-y-6 border-t border-neutral-200 pt-12">
          <div className="max-w-2xl space-y-1.5">
            <h2 className="font-serif selens-fluid-h2 font-bold text-neutral-950">
              Our Core Objectives
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 font-sans leading-relaxed">
              Three central pillars guide our initiatives, events, and member programs throughout the academic year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {objectives.map((obj, idx) => (
              <Reveal
                key={obj.title}
                index={idx}
                className="border border-neutral-200 rounded-[4px] bg-white p-6 space-y-2.5"
              >
                <h3 className="font-serif font-bold text-base sm:text-lg text-neutral-950 leading-snug">
                  {obj.title}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed font-sans">
                  {obj.description}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Official Organizational Charts (Real SELENS & DEE Assets) */}
        <section className="space-y-6 border-t border-neutral-200 pt-12">
          <div className="max-w-2xl space-y-1.5">
            <h2 className="font-serif selens-fluid-h2 font-bold text-neutral-950">
              Organizational Structure
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 font-sans leading-relaxed">
              Official organizational charts for the Society of Electrical Engineering Students and the Department of Electrical Engineering faculty.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <figure className="lg:col-span-8 border border-neutral-200 rounded-[4px] bg-white overflow-hidden">
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-2">
                <figcaption className="font-serif text-sm font-bold text-neutral-900">
                  SELENS Organizational Chart
                </figcaption>
                <a
                  href="/website-assets/selens-org-chart.png"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 inline-flex items-center gap-1"
                >
                  <span>View full size</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-3 bg-white">
                <img
                  src="/website-assets/selens-org-chart.png"
                  alt="SELENS Set of Officers Organizational Chart"
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </div>
            </figure>

            <figure className="lg:col-span-4 border border-neutral-200 rounded-[4px] bg-white overflow-hidden">
              <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between gap-2">
                <figcaption className="font-serif text-sm font-bold text-neutral-900">
                  DEE Faculty &amp; Staff Chart
                </figcaption>
                <a
                  href="/website-assets/faculty-org-chart.png"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 inline-flex items-center gap-1"
                >
                  <span>View full size</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-3 bg-white">
                <img
                  src="/website-assets/faculty-org-chart.png"
                  alt="Department of Electrical Engineering Faculty Organizational Chart"
                  loading="lazy"
                  className="w-full h-auto block"
                />
              </div>
            </figure>
          </div>
        </section>

        {/* Governing Documents */}
        <section className="border-t border-neutral-200 pt-12">
          <div className="border border-neutral-200 bg-neutral-950 text-white rounded-[4px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white">
                SELENS Constitution &amp; By-Laws
              </h2>
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
        </section>
      </div>
    </div>
  )
}

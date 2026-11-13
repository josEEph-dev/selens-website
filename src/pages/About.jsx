import { PageHeader, Section, Card, PrimaryButton } from '../components/SharedUI'
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
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="About SELENS"
        description="The Society of Electrical Engineering Students (SELENS) is the official student organization of Electrical Engineering at Mindanao State University - General Santos."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* Preamble */}
        <Section title="Constitutional preamble">
          <blockquote className="font-serif italic text-base sm:text-lg text-selens-white border-l-4 border-selens-yellow pl-6 py-3 leading-relaxed bg-selens-ink rounded-[4px] border border-selens-line border-l-selens-yellow">
            &ldquo;We, the Electrical Engineering students of Mindanao State University - General Santos, in order to establish an organization that shall embody our ideals, foster academic excellence, promote technical innovation and ethical responsibility, protect member rights and welfare, and contribute to community development, do hereby establish this Constitution and By-Laws.&rdquo;
          </blockquote>
        </Section>

        {/* Objectives as Cards with 01, 02, 03 */}
        <Section
          title="Our core objectives"
          description="Three central pillars guide our initiatives, events, and member programs throughout the academic year."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {objectives.map((obj) => (
              <Card key={obj.numeral} className="space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
                    {obj.numeral}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-selens-white">
                    {obj.title}
                  </h3>
                  <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                    {obj.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Constitution Download */}
        <Section
          title="Governing documents"
          description="Read our constitution and bylaws to understand organizational structure, membership rights, and election procedures."
        >
          <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="font-serif font-bold text-lg text-selens-white">
                SELENS Constitution &amp; By-Laws
              </h3>
              <p className="text-sm text-neutral-300">
                Official governing document outlining student organization policies, officer duties, and assembly operations for A.Y. {CURRENT_ACADEMIC_YEAR}.
              </p>
            </div>
            <PrimaryButton
              href="/website-assets/constitution-and-by-laws-of-selens.pdf"
              download
              className="gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download constitution (PDF)</span>
            </PrimaryButton>
          </Card>
        </Section>
      </div>
    </div>
  )
}

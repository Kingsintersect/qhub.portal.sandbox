'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Briefcase, Monitor, Search, ClipboardList, UploadCloud, Bell, MailCheck, CalendarCheck } from 'lucide-react'
import Footer from '@/components/navigation/Footer'
import GlowingButton, { Button } from '@/components/ui/button'
import Link from 'next/link'

const steps = [
    { step: '01', title: 'Choose a Programme', desc: 'Browse our undergraduate, postgraduate and professional programmes and select the one that best aligns with your goals.', icon: Search },
    { step: '02', title: 'Check Requirements', desc: 'Review the entry requirements for your chosen programme including academic qualifications, language proficiency and supporting documents.', icon: ClipboardList },
    { step: '03', title: 'Submit Application', desc: 'Complete the online application form through the student portal, upload all required documents and pay the application fee.', icon: UploadCloud },
    { step: '04', title: 'Track Your Status', desc: 'Log in to the portal to monitor your application status and respond promptly to any requests for additional information.', icon: Bell },
    { step: '05', title: 'Receive Offer', desc: 'Successful applicants will receive an offer letter via email. Accept your offer and pay the acceptance fee within the stated deadline.', icon: MailCheck },
    { step: '06', title: 'Enrol & Register', desc: 'Complete online registration for your courses during the designated registration period before the start of semester.', icon: CalendarCheck },
]

const programmes = [
    { level: 'Undergraduate', icon: GraduationCap, count: '120+ programmes', desc: 'Bachelor of Science, Arts, Engineering, Law, Medicine and more across 14 faculties.' },
    { level: 'Postgraduate', icon: BookOpen, count: '80+ programmes', desc: 'Masters by coursework and research, and doctoral programmes in all academic disciplines.' },
    { level: 'Professional', icon: Briefcase, count: '30+ programmes', desc: 'Executive education, professional certificates and diplomas designed for industry practitioners.' },
    { level: 'Distance Learning', icon: Monitor, count: '25+ programmes', desc: 'Fully accredited online degrees and diplomas for students who cannot attend on campus.' },
]

const requirements = [
    { category: 'Undergraduate', items: ['Minimum 5 O-Level credits including English & Maths', 'JAMB/UTME score of 200 and above', 'Post-UTME screening score', 'Two reference letters', 'Birth certificate or equivalent'] },
    { category: 'Postgraduate', items: ['Relevant bachelor\'s degree (minimum 2nd class lower)', 'Transcripts from previous institution', 'Statement of purpose (500–800 words)', 'Two academic reference letters', 'Evidence of relevant work experience (where applicable)'] },
]

const dates = [
    { event: 'Application portal opens', date: 'February 1' },
    { event: 'Undergraduate application deadline', date: 'April 30' },
    { event: 'Post-UTME screening', date: 'June 10 – 20' },
    { event: 'Admission letters released', date: 'July 15' },
    { event: 'Acceptance fee deadline', date: 'August 5' },
    { event: 'Course registration opens', date: 'August 20' },
    { event: 'First semester begins', date: 'September 8' },
    { event: 'Postgraduate application deadline', date: 'October 31' },
]

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function AdmissionsPage() {
    return (
        <div>
            {/* Hero */}
            <section
                className="relative py-20 px-4 overflow-hidden"
                style={{

                    backgroundImage: 'url( https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHVuaXZlcnNpdHl8ZW58MHx8MHx8fDA%3D?w=1600&q=80&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.45) 100%)' }} />
                <div className="relative z-10 mx-auto text-justify px-4">
                    <div className='flex space-x-3'>
                        <div className='leading-25 border-2 border-white/30 rounded-md flex items-center justify-center bg-green-900 ' style={{ color: 'var(--primary)' }} >

                        </div>
                        {/* <motion.h1 {...fadeUp(0.08)} className="text-3xl sm:text-3xl font-bold leading-tight mb-6 text-white/70">
                         Admissions
                    </motion.h1> */}

                        <motion.p {...fadeUp(0)} className="text-sm font-semibold tracking-widest uppercase mb-3 text-white/70">
                            Admissions
                        </motion.p>

                    </div>


                    {/* <motion.p {...fadeUp(0.16)} className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-white/80">
                        Joining the University of Example is the first step towards a world-class education. We welcome applications from talented students of all backgrounds. Here is everything you need to know.
                    </motion.p> */}
                    {/* <motion.div {...fadeUp(0.22)} className="mt-8 flex flex-wrap justify-center gap-4">
                        <a
                            href="/student-portal"
                            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'var(--primary)' }}
                        >
                            Apply Now
                        </a>
                        <a
                            href="#how-to-apply"
                            className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
                        >
                            How to Apply
                        </a>
                    </motion.div> */}
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Programmes overview */}
                <section className="py-16">
                    <div className="flex items-center justify-between">
                        <div className="">
                            <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-2">Programmes of Study</motion.h2>
                            <motion.p {...fadeUp(0.06)} className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                                Choose from a wide range of nationally and internationally accredited programmes.
                            </motion.p>
                        </div>

                        <Link className="inline-flex items-center" href="/auth/signup">
                            <GlowingButton>
                                Start Application
                            </GlowingButton>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {programmes.map((p, i) => (
                            <motion.div
                                key={p.level}
                                {...fadeUp(i * 0.07)}
                                whileHover={{ translateY: -5 }}
                                className="rounded-xl p-6 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
                                    style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)' }}
                                >
                                    <p.icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
                                </div>
                                <h3 className="text-sm font-bold mb-1">{p.level}</h3>
                                <div className="text-xs font-semibold mb-3" style={{ color: 'var(--primary)' }}>{p.count}</div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* How to Apply */}
                <section id="how-to-apply" className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">How to Apply</motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {steps.map((s, i) => (
                            <motion.div
                                key={s.step}
                                {...fadeUp(i * 0.06)}
                                className="rounded-xl p-6 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)' }}
                                    >
                                        <s.icon size={18} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
                                    </div>
                                    <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--primary)' }}>STEP {s.step}</span>
                                </div>
                                <h3 className="text-sm font-bold mb-2">{s.title}</h3>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Entry Requirements */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Entry Requirements</motion.h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {requirements.map((r, i) => (
                            <motion.div
                                key={r.category}
                                {...fadeUp(i * 0.08)}
                                className="rounded-xl p-6 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <h3 className="text-base font-bold mb-4">{r.category}</h3>
                                <ul className="space-y-2">
                                    {r.items.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            <span className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-white text-[10px]" style={{ background: 'var(--primary)' }}>✓</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Key Dates */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Key Dates</motion.h2>
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                        {dates.map((d, i) => (
                            <motion.div
                                key={d.event}
                                {...fadeUp(i * 0.04)}
                                className="flex items-center justify-between px-6 py-4 border-b last:border-b-0"
                                style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--card)' : 'transparent' }}
                            >
                                <span className="text-sm">{d.event}</span>
                                <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>{d.date}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-12 mb-8">
                    <motion.div
                        {...fadeUp()}
                        className="rounded-2xl p-10 text-center border"
                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                    >
                        <h2 className="text-2xl font-bold mb-3">Ready to apply?</h2>
                        <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                            Create your student portal account to start your application. Our admissions team is available Monday to Friday, 8 am – 5 pm to answer any questions.
                        </p>
                        {/* <a
                            href="/auth/signup"
                            className="inline-flex items-center px-8 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: 'var(--primary)' }}
                        >
                            Start Application
                        </a> */}
                        <Link className="inline-flex items-center" href="/auth/signup">
                            <GlowingButton>
                                Start Application
                            </GlowingButton>
                        </Link>
                    </motion.div>
                </section>

            </div>

            <Footer />
        </div>
    )
}

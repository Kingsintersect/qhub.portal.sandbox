'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShieldCheck, Lightbulb, Users, HeartHandshake } from 'lucide-react'
import Footer from '@/components/navigation/Footer'

const stats = [
    { label: 'Years of Excellence', value: '60+' },
    { label: 'Enrolled Students', value: '28,000+' },
    { label: 'Academic Staff', value: '1,200+' },
    { label: 'Research Centres', value: '40+' },
]

const values = [
    { title: 'Academic Integrity', desc: 'We uphold the highest standards of honesty and ethical conduct in all scholarly pursuits.', icon: ShieldCheck },
    { title: 'Innovation', desc: 'We foster creative thinking and cutting-edge research that addresses real-world challenges.', icon: Lightbulb },
    { title: 'Inclusivity', desc: 'We celebrate diversity and create an environment where all members can thrive.', icon: Users },
    { title: 'Service', desc: 'We are committed to serving our communities locally, nationally and globally.', icon: HeartHandshake },
]

const leadership = [
    {
        name: 'Prof. Emmanuel A. Okafor',
        role: 'Chancellor',
        bio: 'Prof. Okafor brings over 35 years of distinguished academic and administrative leadership. A Fellow of the Nigerian Academy of Science, he has published more than 120 peer-reviewed papers.',
        avatar: 'https://github.com/shadcn.png',
    },
    {
        name: 'Prof. Ngozi M. Adeleke',
        role: 'Vice-Chancellor',
        bio: 'Prof. Adeleke oversees the day-to-day running of the university. Her tenure has been marked by a 40% increase in research output and the establishment of three new interdisciplinary institutes.',
        avatar: 'https://github.com/shadcn.png',
    },
    {
        name: 'Dr. Chukwuemeka B. Nwosu',
        role: 'Registrar',
        bio: 'Dr. Nwosu administers academic records, student admissions, and institutional governance. He has modernised the registry with a fully digital records management system.',
        avatar: 'https://github.com/shadcn.png',
    },
    {
        name: 'Barr. Fatima I. Yusuf',
        role: 'Bursar',
        bio: 'Barr. Yusuf manages the financial affairs of the university, ensuring transparent stewardship of resources and sustainable budget planning.',
        avatar: 'https://github.com/shadcn.png',
    },
    {
        name: 'Prof. Kelechi O. Eze',
        role: 'Dean, Faculty of Sciences',
        bio: 'An internationally recognised molecular biologist, Prof. Eze leads one of the largest faculties by enrolment and has secured over ₦2 billion in research grants.',
        avatar: 'https://github.com/shadcn.png',
    },
    {
        name: 'Prof. Amaka C. Obiora',
        role: 'Dean, Faculty of Arts & Humanities',
        bio: 'Prof. Obiora is a celebrated scholar of African literature whose faculty runs some of the most competitive postgraduate programmes in the region.',
        avatar: 'https://github.com/shadcn.png',
    },
]

const milestones = [
    { year: '1964', event: 'University founded by Federal Government Decree' },
    { year: '1972', event: 'First postgraduate programmes established' },
    { year: '1985', event: 'Teaching hospital and medical school commissioned' },
    { year: '1998', event: 'Campus-wide ICT infrastructure rollout' },
    { year: '2007', event: 'Centre for Advanced Research (CAR) inaugurated' },
    { year: '2015', event: 'Ranked among top 10 African universities' },
    { year: '2021', event: 'Launch of fully online degree programme platform' },
    { year: '2024', event: 'Qhub digital student portal goes live' },
]

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <section
                className="relative py-20 px-4 overflow-hidden"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.45) 100%)' }} />
                <div className="relative z-10  mx-auto text-justify px-4">
                     <div className='flex space-x-3'>
                         <div className='leading-25 border-2 border-white/30 rounded-md flex items-center justify-center bg-green-900 ' style={{ color: 'var(--primary)' }} >

                    </div>
                    <motion.p {...fadeUp(0)} className="text-sm font-semibold tracking-widest uppercase mb-3 text-white/70">
                        About the University
                    </motion.p>
                    </div>
                    {/* <motion.h1 {...fadeUp(0.08)} className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-white">
                        Shaping minds.<br />Transforming futures.
                    </motion.h1> */}
                    {/* <motion.p {...fadeUp(0.16)} className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-white/80">
                        For over six decades the University of Example has been a beacon of academic excellence, producing graduates who lead in every sector of society. We are driven by curiosity, guided by integrity and committed to service.
                    </motion.p> */}
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Stats */}
                <section className="py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                {...fadeUp(i * 0.07)}
                                className="rounded-xl p-6 border text-center"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{s.value}</div>
                                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-10 grid md:grid-cols-2 gap-8">
                    <motion.div {...fadeUp(0)} className="rounded-xl p-8 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                        <h2 className="text-xl font-bold mb-4">Our Mission</h2>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                            To advance knowledge through innovative research and teaching; to equip students with the intellectual tools, ethical grounding and practical skills they need to thrive; and to engage communities in meaningful partnerships that drive sustainable development.
                        </p>
                    </motion.div>
                    <motion.div {...fadeUp(0.08)} className="rounded-xl p-8 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                        <h2 className="text-xl font-bold mb-4">Our Vision</h2>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                            To be a world-class institution renowned for excellence in education, transformative research and impactful community engagement — recognised as Africa's foremost university by 2030.
                        </p>
                    </motion.div>
                </section>

                {/* Core Values */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Core Values</motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {values.map((v, i) => (
                            <motion.div
                                key={v.title}
                                {...fadeUp(i * 0.07)}
                                whileHover={{ translateY: -5 }}
                                className="rounded-xl p-5 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
                                    style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)' }}
                                >
                                    <v.icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
                                </div>
                                <h3 className="text-sm font-semibold mb-2">{v.title}</h3>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* History Timeline */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Our History</motion.h2>
                    <div className="relative border-l-2" style={{ borderColor: 'var(--border)' }}>
                        {milestones.map((m, i) => (
                            <motion.div
                                key={m.year}
                                {...fadeUp(i * 0.05)}
                                className="ml-6 mb-7 relative"
                            >
                                <span
                                    className="absolute -left-[2.15rem] top-1 w-4 h-4 rounded-full border-2"
                                    style={{ background: 'var(--primary)', borderColor: 'var(--background)' }}
                                />
                                <div className="text-xs font-bold mb-1" style={{ color: 'var(--primary)' }}>{m.year}</div>
                                <div className="text-sm" style={{ color: 'var(--foreground)' }}>{m.event}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Leadership Team */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-2">University Leadership</motion.h2>
                    <motion.p {...fadeUp(0.06)} className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                        Our leadership team brings together decades of academic, administrative and strategic expertise.
                    </motion.p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leadership.map((l, i) => (
                            <motion.div
                                key={l.name}
                                {...fadeUp(i * 0.07)}
                                whileHover={{ translateY: -5 }}
                                className="rounded-xl p-6 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <Image
                                    src={l.avatar}
                                    alt={l.name}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-full mb-4 ring-2 ring-border object-cover grayscale"
                                />
                                <h3 className="text-sm font-bold mb-0.5">{l.name}</h3>
                                <div className="text-xs font-semibold mb-3" style={{ color: 'var(--primary)' }}>{l.role}</div>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{l.bio}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </div>

            <Footer />
        </div>
    )
}

'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, BookText, Building2, FolderKanban, Beaker, Leaf, HeartPulse, Cpu, Wheat, Scale } from 'lucide-react'
import Footer from '@/components/navigation/Footer'

const stats = [
    { value: '₦4.2B+', label: 'Research Grants Secured', icon: FlaskConical },
    { value: '3,800+', label: 'Publications (last 5 years)', icon: BookText },
    { value: '40+', label: 'Research Centres', icon: Building2 },
    { value: '180+', label: 'Active Projects', icon: FolderKanban },
]

const centres = [
    {
        name: 'Centre for Advanced Research (CAR)',
        focus: 'Multidisciplinary',
        desc: 'CAR coordinates cross-faculty research initiatives and connects university researchers with national and international funding bodies.',
        projects: 28,
        icon: Beaker,
    },
    {
        name: 'Institute for Sustainable Development',
        focus: 'Environment & Policy',
        desc: 'Investigates climate adaptation, renewable energy, biodiversity conservation and sustainable urban planning across sub-Saharan Africa.',
        projects: 16,
        icon: Leaf,
    },
    {
        name: 'Centre for Health Systems Research',
        focus: 'Public Health',
        desc: 'Partners with government and NGOs to address infectious diseases, maternal health and health system strengthening in low-resource settings.',
        projects: 22,
        icon: HeartPulse,
    },
    {
        name: 'Digital Innovation Hub',
        focus: 'Technology & AI',
        desc: 'Explores artificial intelligence, machine learning, cybersecurity and indigenous language processing to drive Africa\'s digital future.',
        projects: 19,
        icon: Cpu,
    },
    {
        name: 'Agricultural Research Station',
        focus: 'Food Security',
        desc: 'Develops drought-resistant crop varieties, sustainable soil management techniques and food-processing innovations for rural communities.',
        projects: 14,
        icon: Wheat,
    },
    {
        name: 'Law & Governance Institute',
        focus: 'Law & Policy',
        desc: 'Examines constitutional law, human rights, anti-corruption frameworks and regional integration law across the African Union.',
        projects: 11,
        icon: Scale,
    },
]

const projects = [
    {
        title: 'AI-Assisted Diagnosis of Tropical Diseases',
        pi: 'Prof. A. Nwobi (College of Medicine)',
        funder: 'NIH / AESA',
        status: 'Ongoing',
    },
    {
        title: 'Cassava Genome Sequencing for Yield Improvement',
        pi: 'Dr. B. Eze (Faculty of Agriculture)',
        funder: 'TETFUND',
        status: 'Ongoing',
    },
    {
        title: 'Cybersecurity Framework for Nigerian SMEs',
        pi: 'Prof. C. Okonkwo (Faculty of Sciences)',
        funder: 'NCC / NITDA',
        status: 'Ongoing',
    },
    {
        title: 'Solar-Powered Water Purification for Rural Areas',
        pi: 'Dr. D. Adesanya (Faculty of Engineering)',
        funder: 'World Bank',
        status: 'Completed',
    },
    {
        title: 'Constitutional Democracy & Electoral Reform',
        pi: 'Prof. E. Bello (Law & Governance Institute)',
        funder: 'Ford Foundation',
        status: 'Ongoing',
    },
    {
        title: 'Carbon Sequestration in Nigerian Mangroves',
        pi: 'Dr. F. Uche (Institute for Sustainable Development)',
        funder: 'UNDP',
        status: 'Completed',
    },
]

const partnerships = [
    { org: 'Massachusetts Institute of Technology', country: 'USA' },
    { org: 'University of Edinburgh', country: 'UK' },
    { org: 'Technical University of Munich', country: 'Germany' },
    { org: 'University of Cape Town', country: 'South Africa' },
    { org: 'Makerere University', country: 'Uganda' },
    { org: 'Peking University', country: 'China' },
]

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function ResearchPage() {
    return (
        <div>
            {/* Hero */}
            <section
                className="relative py-32 px-4 overflow-hidden"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&q=80&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 100%)' }} />
                <div className="relative z-10 mx-auto text-justify px-4">
                    <div className='flex space-x-3'>
                         <div className='leading-25 border-2 border-white/30 rounded-md flex items-center justify-center bg-green-900 ' style={{ color: 'var(--primary)' }} >

                    </div>
                    <motion.p {...fadeUp(0)} className="text-sm font-semibold tracking-widest uppercase mb-3 text-white/70">
                        Research & Innovation
                    </motion.p>
                    {/* <motion.h1 {...fadeUp(0.08)} className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-white">
                        Advancing knowledge.<br />Solving real problems.
                    </motion.h1> */}
                    {/* <motion.p {...fadeUp(0.16)} className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-white/80">
                        Research at the University of Example spans every discipline, from biomedical science to the humanities. Our scholars collaborate with governments, industry and civil society to produce knowledge that makes a difference.
                    </motion.p> */}
                    </div>
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
                                <div
                                    className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                                    style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)' }}
                                >
                                    <s.icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
                                </div>
                                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{s.value}</div>
                                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Research Centres */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-2">Research Centres & Institutes</motion.h2>
                    <motion.p {...fadeUp(0.06)} className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                        Our 40+ specialised centres create focused environments where breakthrough work happens.
                    </motion.p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {centres.map((c, i) => (
                            <motion.div
                                key={c.name}
                                {...fadeUp(i * 0.06)}
                                whileHover={{ translateY: -5 }}
                                className="rounded-xl p-6 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <div className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)', color: 'var(--primary)' }}>
                                        {c.focus}
                                    </div>
                                    <div
                                        className="w-8 h-8 rounded-md flex items-center justify-center"
                                        style={{ background: 'color-mix(in oklch, var(--primary) 12%, transparent)' }}
                                    >
                                        <c.icon size={16} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
                                    </div>
                                </div>
                                <h3 className="text-sm font-bold mb-2">{c.name}</h3>
                                <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted-foreground)' }}>{c.desc}</p>
                                <div className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{c.projects} active projects</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Featured Projects */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Featured Projects</motion.h2>
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                        <div className="hidden sm:grid grid-cols-4 text-xs font-semibold px-6 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                            <span className="col-span-2">Project</span>
                            <span>Funder</span>
                            <span>Status</span>
                        </div>
                        {projects.map((p, i) => (
                            <motion.div
                                key={p.title}
                                {...fadeUp(i * 0.04)}
                                className="sm:grid sm:grid-cols-4 px-6 py-4 border-b last:border-b-0 flex flex-col gap-1"
                                style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--card)' : 'transparent' }}
                            >
                                <div className="sm:col-span-2">
                                    <div className="text-sm font-medium">{p.title}</div>
                                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.pi}</div>
                                </div>
                                <div className="text-xs sm:text-sm flex items-center" style={{ color: 'var(--muted-foreground)' }}>{p.funder}</div>
                                <div className="flex items-center">
                                    <span
                                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                        style={{
                                            background: p.status === 'Ongoing'
                                                ? 'color-mix(in oklch, var(--primary) 15%, transparent)'
                                                : 'color-mix(in oklch, var(--muted-foreground) 15%, transparent)',
                                            color: p.status === 'Ongoing' ? 'var(--primary)' : 'var(--muted-foreground)',
                                        }}
                                    >
                                        {p.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* International Partnerships */}
                <section className="py-10 mb-8">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-2">International Research Partnerships</motion.h2>
                    <motion.p {...fadeUp(0.06)} className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                        We collaborate with leading institutions worldwide to conduct research that transcends borders.
                    </motion.p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {partnerships.map((p, i) => (
                            <motion.div
                                key={p.org}
                                {...fadeUp(i * 0.05)}
                                className="rounded-xl p-5 border flex items-center gap-4"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-sm"
                                    style={{ background: 'var(--primary)' }}>
                                    {p.org.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">{p.org}</div>
                                    <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.country}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </div>

            <Footer />
        </div>
    )
}

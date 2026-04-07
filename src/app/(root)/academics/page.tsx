'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, ScrollText, Users, Library, BookOpen, Scale, HeartPulse, Cpu } from 'lucide-react'
import Footer from '@/components/navigation/Footer'

const faculties = [
    {
        name: 'Faculty of Sciences',
        departments: ['Biochemistry', 'Chemistry', 'Computer Science', 'Mathematics', 'Microbiology', 'Physics', 'Statistics'],
        programmes: 14,
        students: 4200,
    },
    {
        name: 'Faculty of Engineering',
        departments: ['Chemical Engineering', 'Civil Engineering', 'Electrical & Electronics', 'Mechanical Engineering', 'Petroleum Engineering'],
        programmes: 10,
        students: 3900,
    },
    {
        name: 'Faculty of Arts & Humanities',
        departments: ['English & Literary Studies', 'French', 'History & International Studies', 'Linguistics', 'Philosophy', 'Theatre Arts'],
        programmes: 12,
        students: 2800,
    },
    {
        name: 'Faculty of Social Sciences',
        departments: ['Economics', 'Geography', 'Mass Communication', 'Political Science', 'Psychology', 'Sociology'],
        programmes: 12,
        students: 3100,
    },
    {
        name: 'Faculty of Law',
        departments: ['Business & Commercial Law', 'International Law', 'Private Law', 'Public Law'],
        programmes: 5,
        students: 1500,
    },
    {
        name: 'College of Medicine',
        departments: ['Anatomy', 'Medicine & Surgery', 'Nursing', 'Optometry', 'Pharmacology', 'Physiology'],
        programmes: 10,
        students: 2200,
    },
    {
        name: 'Faculty of Education',
        departments: ['Curriculum Studies', 'Educational Administration', 'Guidance & Counselling', 'Science Education'],
        programmes: 8,
        students: 1800,
    },
    {
        name: 'Faculty of Agriculture',
        departments: ['Agricultural Economics', 'Animal Science', 'Crop Science', 'Fisheries', 'Forestry & Environment'],
        programmes: 10,
        students: 1600,
    },
]

const highlights = [
    { label: 'Total Faculties', value: '14', icon: Building2 },
    { label: 'Accredited Programmes', value: '255+', icon: ScrollText },
    { label: 'Full-time Academic Staff', value: '1,200+', icon: Users },
    { label: 'Library Volumes', value: '500,000+', icon: Library },
]

const calendar = [
    { period: 'First Semester', start: 'September 8', end: 'January 17' },
    { period: 'First Semester Exams', start: 'January 20', end: 'February 7' },
    { period: 'Inter-semester Break', start: 'February 8', end: 'February 21' },
    { period: 'Second Semester', start: 'February 24', end: 'June 20' },
    { period: 'Second Semester Exams', start: 'June 23', end: 'July 11' },
    { period: 'Long Vacation', start: 'July 14', end: 'September 7' },
]

const libraries = [
    { name: 'Central University Library', desc: 'Over 300,000 volumes, e-journals, digital archives and 24-hour study facilities.', icon: BookOpen },
    { name: 'Law Library', desc: 'Specialist legal resources, law reports, statutes and online legal databases.', icon: Scale },
    { name: 'Medical Library', desc: 'Clinical and biomedical resources, anatomy models and simulation suites.', icon: HeartPulse },
    { name: 'Engineering Resource Centre', desc: 'Technical journals, patent databases, CAD labs and project repositories.', icon: Cpu },
]

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function AcademicsPage() {
    const [expanded, setExpanded] = useState<number | null>(null)

    return (
        <div>
            {/* Hero */}
            <section
                className="relative py-32 px-4 overflow-hidden"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1600&q=80&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.45) 100%)' }} />
                <div className="relative z-10  mx-auto text-justify px-4">
                    <div className='flex space-x-3'>
                         <div className='leading-25 border-2 border-white/30 rounded-md flex items-center justify-center bg-green-900 ' style={{ color: 'var(--primary)' }} >

                    </div>
                    <motion.p {...fadeUp(0)} className="text-sm font-semibold tracking-widest uppercase mb-3 text-white/70">
                        Academics
                    </motion.p>
                    {/* <motion.h1 {...fadeUp(0.08)} className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-white">
                        Excellence in<br />teaching & learning
                    </motion.h1> */}

                    </div>
                    {/* <motion.p {...fadeUp(0.16)} className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-white/80">
                        Our academic programmes span 14 faculties and over 255 accredited courses at undergraduate, postgraduate and professional levels — all designed to challenge, inspire and equip.
                    </motion.p> */}
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Stats */}
                <section className="py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {highlights.map((h, i) => (
                            <motion.div
                                key={h.label}
                                {...fadeUp(i * 0.07)}
                                className="rounded-xl p-6 border text-center"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center"
                                    style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)' }}
                                >
                                    <h.icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
                                </div>
                                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--primary)' }}>{h.value}</div>
                                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{h.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Faculties */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-2">Faculties & Departments</motion.h2>
                    <motion.p {...fadeUp(0.06)} className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                        Click a faculty card to view its constituent departments.
                    </motion.p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {faculties.map((f, i) => (
                            <motion.div
                                key={f.name}
                                {...fadeUp(i * 0.05)}
                                className="rounded-xl border overflow-hidden cursor-pointer"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                                onClick={() => setExpanded(expanded === i ? null : i)}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-sm font-bold">{f.name}</h3>
                                        <motion.span
                                            animate={{ rotate: expanded === i ? 45 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                                            style={{ background: 'var(--primary)' }}
                                        >+</motion.span>
                                    </div>
                                    <div className="flex gap-4 mt-3">
                                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{f.programmes} programmes</span>
                                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{f.students.toLocaleString()} students</span>
                                    </div>
                                </div>
                                <motion.div
                                    initial={false}
                                    animate={{ height: expanded === i ? 'auto' : 0, opacity: expanded === i ? 1 : 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--border)' }}>
                                        <p className="text-xs font-semibold mt-3 mb-2" style={{ color: 'var(--muted-foreground)' }}>Departments</p>
                                        <ul className="space-y-1">
                                            {f.departments.map((d) => (
                                                <li key={d} className="text-xs flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--primary)' }} />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Academic Calendar */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Academic Calendar</motion.h2>
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                        <div className="grid grid-cols-3 text-xs font-semibold px-6 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                            <span>Period</span>
                            <span>Start Date</span>
                            <span>End Date</span>
                        </div>
                        {calendar.map((c, i) => (
                            <motion.div
                                key={c.period}
                                {...fadeUp(i * 0.04)}
                                className="grid grid-cols-3 px-6 py-4 text-sm border-b last:border-b-0"
                                style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--card)' : 'transparent' }}
                            >
                                <span className="font-medium">{c.period}</span>
                                <span style={{ color: 'var(--muted-foreground)' }}>{c.start}</span>
                                <span style={{ color: 'var(--muted-foreground)' }}>{c.end}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Libraries */}
                <section className="py-10 mb-8">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Libraries & Learning Resources</motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {libraries.map((l, i) => (
                            <motion.div
                                key={l.name}
                                {...fadeUp(i * 0.07)}
                                whileHover={{ translateY: -5 }}
                                className="rounded-xl p-6 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center"
                                    style={{ background: 'color-mix(in oklch, var(--primary) 15%, transparent)' }}
                                >
                                    <l.icon size={20} style={{ color: 'var(--primary)' }} strokeWidth={1.8} />
                                </div>
                                <h3 className="text-sm font-bold mb-2">{l.name}</h3>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{l.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </div>

            <Footer />
        </div>
    )
}

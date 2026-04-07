'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, MapPin, Phone, Mail, ShieldAlert, Clock3, Building2, ChevronDown } from 'lucide-react'
import Footer from '@/components/navigation/Footer'

const offices = [
    {
        name: 'Admissions Office',
        phone: '+234 801 234 5678',
        email: 'admissions@uniexample.edu.ng',
        hours: 'Mon – Fri, 8:00 am – 5:00 pm',
        location: 'Senate Building, Ground Floor',
    },
    {
        name: 'Registrar\'s Office',
        phone: '+234 801 234 5679',
        email: 'registrar@uniexample.edu.ng',
        hours: 'Mon – Fri, 8:00 am – 4:00 pm',
        location: 'Administration Block, Room 101',
    },
    {
        name: 'Student Affairs',
        phone: '+234 801 234 5680',
        email: 'studentaffairs@uniexample.edu.ng',
        hours: 'Mon – Fri, 8:00 am – 5:00 pm',
        location: 'Student Union Building, 2nd Floor',
    },
    {
        name: 'ICT & Support Helpdesk',
        phone: '+234 801 234 5681',
        email: 'helpdesk@uniexample.edu.ng',
        hours: 'Mon – Sat, 7:00 am – 8:00 pm',
        location: 'ICT Centre, Room 005',
    },
    {
        name: 'Finance & Bursary',
        phone: '+234 801 234 5682',
        email: 'bursary@uniexample.edu.ng',
        hours: 'Mon – Fri, 8:00 am – 3:30 pm',
        location: 'Administration Block, Room 110',
    },
    {
        name: 'International Office',
        phone: '+234 801 234 5683',
        email: 'international@uniexample.edu.ng',
        hours: 'Mon – Fri, 9:00 am – 4:30 pm',
        location: 'Senate Building, Room 205',
    },
]

const faqs = [
    {
        q: 'How do I apply for admission?',
        a: 'Visit the Admissions page to review programme requirements, then log in to the student portal to complete and submit your application form.',
    },
    {
        q: 'When does the application portal open?',
        a: 'The portal typically opens on February 1 for the following academic session. Check the Key Dates section on the Admissions page for the current cycle.',
    },
    {
        q: 'How can I get my transcript?',
        a: 'Transcripts are processed through the Registrar\'s Office. Submit a formal request via the student portal or in person. Processing takes 5–10 working days.',
    },
    {
        q: 'Is there on-campus accommodation?',
        a: 'Yes. The university operates several halls of residence. Allocation is competitive and managed through the Student Affairs portal during registration.',
    },
    {
        q: 'How do I reset my portal password?',
        a: 'Use the "Forgot Password" link on the student portal login page, or contact the ICT Helpdesk with your student ID for assisted reset.',
    },
]

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function ContactPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real application this would POST to an API endpoint
        setSubmitted(true)
    }

    return (
        <div>
            {/* Hero */}
            <section
                className="relative py-32 px-4 overflow-hidden"
                style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1498230870289-7561110a6e69?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTV8fGNvbnRhY3R8ZW58MHx8MHx8fDA%3D?w=1600&q=80&fit=crop)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.45) 100%)' }} />
                <div className="relative z-10 mx-auto text-justify px-4">
                    <div className='flex space-x-3'>
                         <div className='leading-25 border-2 border-white/30 rounded-md flex items-center justify-center bg-green-900 ' style={{ color: 'var(--primary)' }} >

                    </div>
                    <motion.p {...fadeUp(0)} className="text-sm font-semibold tracking-widest uppercase mb-3 text-white/70">
                        Contact Us
                    </motion.p>
                    {/* <motion.h1 {...fadeUp(0.08)} className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-white">
                        We are here<br />to help
                    </motion.h1> */}
                    {/* <motion.p {...fadeUp(0.16)} className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto text-white/80">
                        Whether you have a question about admissions, need technical support or want to connect with a department, our team is ready to assist.
                    </motion.p> */}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Contact form + general info */}
                <section className="py-16 grid lg:grid-cols-2 gap-10">

                    {/* Form */}
                    <motion.div {...fadeUp(0)} className="rounded-xl p-8 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                        <h2 className="text-xl font-bold mb-6">Send us a message</h2>
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center gap-3"
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl mb-2"
                                    style={{ background: 'var(--primary)' }}><Check size={26} strokeWidth={2.6} /></div>
                                <h3 className="text-base font-bold">Message received</h3>
                                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                    Thank you for reaching out. We will get back to you within 2 business days.
                                </p>
                                <button
                                    className="mt-4 text-sm font-semibold underline underline-offset-2"
                                    style={{ color: 'var(--primary)' }}
                                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                                >
                                    Send another message
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Your full name"
                                            className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none focus:ring-2 transition"
                                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1.5">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@example.com"
                                            className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none focus:ring-2 transition"
                                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5">Subject</label>
                                    <input
                                        required
                                        type="text"
                                        value={form.subject}
                                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        placeholder="Brief subject"
                                        className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none focus:ring-2 transition"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="How can we help you?"
                                        className="w-full rounded-lg px-4 py-2.5 text-sm border outline-none focus:ring-2 transition resize-none"
                                        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                                    style={{ background: 'var(--primary)' }}
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* General info */}
                    <motion.div {...fadeUp(0.1)} className="space-y-6">
                        <div className="rounded-xl p-6 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                            <h3 className="text-base font-bold mb-3 flex items-center gap-2"><MapPin size={16} style={{ color: 'var(--primary)' }} />University Address</h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                University of Example<br />
                                1 University Road, Knowledge City<br />
                                P.M.B. 001, Exampleland<br />
                                Nigeria
                            </p>
                        </div>
                        <div className="rounded-xl p-6 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                            <h3 className="text-base font-bold mb-3 flex items-center gap-2"><Phone size={16} style={{ color: 'var(--primary)' }} />Main Switchboard</h3>
                            <p className="text-sm flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}><Phone size={14} />+234 800 000 0000</p>
                            <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}><Mail size={14} />info@uniexample.edu.ng</p>
                            <p className="text-xs mt-3 flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}><Clock3 size={14} />Monday – Friday, 7:30 am – 5:30 pm</p>
                        </div>
                        <div className="rounded-xl p-6 border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                            <h3 className="text-base font-bold mb-1 flex items-center gap-2"><ShieldAlert size={16} style={{ color: 'var(--primary)' }} />Emergency & Security</h3>
                            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>Campus security is available 24 hours a day, 7 days a week.</p>
                            <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Security hotline: +234 800 911 0000</p>
                        </div>
                    </motion.div>

                </section>

                {/* Departmental Contacts */}
                <section className="py-10">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Departmental Contacts</motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {offices.map((o, i) => (
                            <motion.div
                                key={o.name}
                                {...fadeUp(i * 0.06)}
                                className="rounded-xl p-6 border"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Building2 size={15} style={{ color: 'var(--primary)' }} />{o.name}</h3>
                                <div className="space-y-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    <div className="flex items-start gap-2">
                                        <span className="font-semibold w-14 shrink-0">Phone</span>
                                        <span className="inline-flex items-center gap-1.5"><Phone size={13} />{o.phone}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="font-semibold w-14 shrink-0">Email</span>
                                        <a href={`mailto:${o.email}`} className="hover:underline break-all inline-flex items-center gap-1.5" style={{ color: 'var(--primary)' }}><Mail size={13} />{o.email}</a>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="font-semibold w-14 shrink-0">Hours</span>
                                        <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{o.hours}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="font-semibold w-14 shrink-0">Location</span>
                                        <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{o.location}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-10 mb-8">
                    <motion.h2 {...fadeUp()} className="text-2xl font-bold mb-8">Frequently Asked Questions</motion.h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={faq.q}
                                {...fadeUp(i * 0.05)}
                                className="rounded-xl border overflow-hidden"
                                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                            >
                                <button
                                    className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold gap-3"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <span>{faq.q}</span>
                                    <motion.span
                                        animate={{ rotate: openFaq === i ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                                        style={{ background: 'var(--primary)' }}
                                    ><ChevronDown size={14} /></motion.span>
                                </button>
                                <motion.div
                                    initial={false}
                                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                                    transition={{ duration: 0.22 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="px-6 pb-4 text-sm leading-relaxed border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                                        {faq.a}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </section>

            </div>

            <Footer />
        </div>
    )
}

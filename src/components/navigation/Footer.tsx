'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '@/components/branding/Logo'

export default function Footer() {
    return (
        <footer className="mt-16 bg-emerald-700 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-3 border-b border-emerald-600 pb-8 sm:flex-row sm:items-center sm:justify-between">
                    <Logo
                        href="/"
                        subtitle="Knowledge - Innovation - Service"
                        imageWidth={52}
                        imageHeight={52}
                        className="items-center"
                        imageClassName="h-13 w-13"
                        titleClassName="text-base text-white"
                        subtitleClassName="text-white/70"
                    />
                    <p className="max-w-xl text-sm text-white/70">
                        Learn, research, and manage your academic journey from one connected university platform.
                    </p>
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground/90">Links</h4>
                        <div className="mt-3 space-y-2 text-sm text-foreground/70">
                            <a href="/courses" className="block hover:text-primary transition-colors">Courses</a>
                            <a href="/events" className="block hover:text-primary transition-colors">Events</a>
                            <a href="/gallery" className="block hover:text-primary transition-colors">Gallery</a>
                            <Link href="/" className="block hover:text-primary transition-colors">FAQs</Link>
                            <a href="/about" className="block hover:text-primary transition-colors">About Us</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground/90">Company</h4>
                        <div className="mt-3 space-y-2 text-sm text-foreground/70">
                            <Link href="/" className="block hover:text-primary transition-colors">Blog</Link>
                            <a href="/contact" className="block hover:text-primary transition-colors">Contact</a>
                            <Link href="/" className="block hover:text-primary transition-colors">Members</Link>
                            <Link href="/" className="block hover:text-primary transition-colors">Shop</Link>
                            <Link href="/" className="block hover:text-primary transition-colors">Projects</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground/90">Connect Us</h4>
                        <div className="mt-3 space-y-2 text-sm text-foreground/70">
                            <p>800 388 80 90</p>
                            <p>58 Howard Street #2, San Francisco</p>
                            <p>contact@eduma.com</p>
                            <p>A26BT5 Building, SilverC Street, London</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground/90">Our Worldwide Office</h4>
                        <Image
                            src="https://odl.esut.edu.ng/wp-content/uploads/2022/01/map.png"
                            alt="Worldwide office map"
                            width={900}
                            height={420}
                            className="mt-3 h-auto w-full rounded-lg border"
                            style={{ borderColor: 'var(--border)' }}
                        />
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-emerald-600 pt-6 text-xs text-foreground/60" >
                    <span>© {new Date().getFullYear()} ESUT ODL. All rights reserved.</span>
                    <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
                    <Link href="/" className="hover:text-primary transition-colors">Sitemap</Link>
                </div>
            </div>
        </footer>
    )
}

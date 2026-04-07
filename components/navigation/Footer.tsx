'use client'
import React from 'react'
import Image from 'next/image'

export default function Footer() {
    return (
        <footer className="mt-16 bg-emerald-700 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                

                <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground/90">Links</h4>
                        <div className="mt-3 space-y-2 text-sm text-foreground/70">
                            <a href="/courses" className="block hover:text-primary transition-colors">Courses</a>
                            <a href="/events" className="block hover:text-primary transition-colors">Events</a>
                            <a href="/gallery" className="block hover:text-primary transition-colors">Gallery</a>
                            <a href="/" className="block hover:text-primary transition-colors">FAQs</a>
                            <a href="/about" className="block hover:text-primary transition-colors">About Us</a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-foreground/90">Company</h4>
                        <div className="mt-3 space-y-2 text-sm text-foreground/70">
                            <a href="/" className="block hover:text-primary transition-colors">Blog</a>
                            <a href="/contact" className="block hover:text-primary transition-colors">Contact</a>
                            <a href="/" className="block hover:text-primary transition-colors">Members</a>
                            <a href="/" className="block hover:text-primary transition-colors">Shop</a>
                            <a href="/" className="block hover:text-primary transition-colors">Projects</a>
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
                    <a href="/" className="hover:text-primary transition-colors">Sitemap</a>
                </div>
            </div>
        </footer>
    )
}
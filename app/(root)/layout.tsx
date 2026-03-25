import React, { ReactNode } from 'react'
import InfoBar from "@/components/navigation/InfoBar"
import NavBar from "@/components/navigation/NavBar"

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <main className='min-h-screen bg-theme text-theme'>
            {/* Info bar above nav */}
            <InfoBar />
            {/* Sticky animated nav */}
            <NavBar />
            {/* Main content */}
            {children}
        </main>
    )
}

export default Layout

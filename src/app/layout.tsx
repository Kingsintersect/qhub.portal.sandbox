import { Geist_Mono, IBM_Plex_Sans, Inter } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import Providers from "@/providers/Providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "QHUB University Portal",
  description: "QHUB Nigerian university portal website Homepage",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

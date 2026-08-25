import { Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import Providers from "@/providers/Providers"
import { getTenantBranding } from "@/lib/tenant/branding.server"
import { TenantProvider } from "@/lib/tenant/tenant-context"
import { TenantBrandingStyle } from "@/lib/tenant/branding-style"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "QHUB University Portal",
  description: "QHUB Nigerian university portal website Homepage",
}
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Resolved once per request from the Host header and handed to the client
  // tree, so no component has to work out which institution it is rendering.
  const tenant = await getTenantBranding()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        outfit.variable,
        "font-sans"
      )}
    >
      <body>
        <TenantProvider value={tenant}>
          <TenantBrandingStyle />
          <Providers>{children}</Providers>
        </TenantProvider>
      </body>
    </html>
  )
}

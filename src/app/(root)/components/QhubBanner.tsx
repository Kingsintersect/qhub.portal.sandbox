"use client"

import { ArrowRight, GraduationCap, Award, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  icon: React.ReactNode
  title: string
  subtitle: string
}

const navItems: NavItem[] = [
  {
    icon: (
      <GraduationCap
        className="h-10 w-10 bg-white/80"
        strokeWidth={1.2}
        style={{ color: "white" }}
      />
    ),
    title: "PROGRAMS",
    subtitle: "For individuals",
  },
  {
    icon: (
      <Award
        className="h-10 w-10 text-white/80"
        strokeWidth={1.2}
        style={{ color: "white" }}
      />
    ),
    title: "CERTIFICATE",
    subtitle: "For individuals",
  },
  {
    icon: (
      <BookOpen
        className="h-10 w-10 text-white/80"
        strokeWidth={1.2}
        style={{ color: "white" }}
      />
    ),
    title: "AFFORD",
    subtitle: "For individuals",
  },
]

export default function QhubBanner() {
  return (
    <div>
      <div className="flex h-25 justify-center overflow-hidden shadow-sm">
        {/* Nav Items Section */}
        <div className="flex flex-1 items-stretch bg-slate-900 text-white dark:bg-slate-950">
          {navItems.map((item, index) => (
            <NavCard key={index} item={item} />
          ))}
        </div>

        {/* CTA Section - Uses Primary Theme Color (#FF3D01) */}
        <button
          className={cn(
            "flex items-center justify-between gap-6 px-8 py-6",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "group shrink-0 cursor-pointer transition-colors duration-200"
          )}
          onClick={() => console.log("Discover Qhub clicked")}
          aria-label="Discover Qhub"
        >
          <div className="text-left">
            <p className="text-lg leading-tight font-bold tracking-wide">
              DISCOVER Qhub
            </p>
            <p className="mt-0.5 text-sm text-primary-foreground/80">
              {"Don't Hesitate to Ask"}
            </p>
          </div>
          <div className="shrink-0">
            <ArrowRight
              className="h-8 w-8 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </div>
        </button>
      </div>
    </div>
  )
}

function NavCard({ item }: { item: NavItem }) {
  return (
    <button
      className={cn(
        "group flex flex-1 cursor-pointer items-center gap-4 px-8 py-6 text-left",
        "border-r border-white/10 last:border-r-0",
        "transition-colors duration-200 hover:bg-white/5"
      )}
    >
      <div className="shrink-0 opacity-80 transition-opacity group-hover:opacity-100">
        {item.icon}
      </div>
      <div>
        <p className="text-sm font-bold tracking-widest text-white">
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-white/60">{item.subtitle}</p>
      </div>
    </button>
  )
}

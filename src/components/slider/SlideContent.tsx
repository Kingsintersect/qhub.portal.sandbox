"use client"

import Link from "next/link"
import { SlideData } from "./data/slides"

interface SlideContentProps {
  data: SlideData
}

export const SlideContent = ({ data }: SlideContentProps) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="relative z-10 max-w-2xl p-8 lg:p-12">
      <div className="slide-category mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
        {data.category}
      </div>

      <h1 className="slide-title mb-4 bg-linear-to-r from-white to-primary/60 bg-clip-text text-4xl leading-tight font-bold text-transparent lg:text-6xl">
        {data.title}
      </h1>

      <h2 className="slide-subtitle mb-6 text-xl font-light text-primary lg:text-2xl">
        {data.subtitle}
      </h2>

      <p className="slide-description mb-8 max-w-lg text-lg leading-relaxed text-gray-200">
        {data.description}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <button
          className="slide-btn flex cursor-pointer items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40"
          onClick={() => {
            if (data.primaryAction.url) {
              scrollToSection(data.primaryAction.url)
            }
          }}
        >
          <span className="text-lg">{data.primaryAction.icon}</span>
          {data.primaryAction.text}
        </button>

        <Link
          href={`${data.secondaryAction.url}`}
          className="slide-btn block cursor-pointer rounded-full border-2 border-white/30 px-8 py-4 text-center font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
        >
          <span className="mr-2">{data.secondaryAction.icon}</span>
          {data.secondaryAction.text}
        </Link>
      </div>
    </div>
  )
}

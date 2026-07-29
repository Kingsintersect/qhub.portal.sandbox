"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface SliderControlsProps {
  onPrevious: () => void
  onNext: () => void
  currentSlide: number
  totalSlides: number
}

export const SliderControls = ({
  onPrevious,
  onNext,
  currentSlide,
  totalSlides,
}: SliderControlsProps) => {
  return (
    <>
      {/* Arrow Controls */}
      <button
        onClick={onPrevious}
        className="group absolute top-1/2 left-8 z-20 -translate-y-1/2 transform rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6 group-hover:animate-pulse" />
      </button>

      <button
        onClick={onNext}
        className="group absolute top-1/2 right-8 z-20 -translate-y-1/2 transform rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6 group-hover:animate-pulse" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 z-20 h-1 w-full bg-white/20">
        <div
          className="progress-bar-fill h-full bg-linear-to-r from-emerald-500 via-emerald-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Slide Counter */}
      <div className="absolute top-8 right-8 z-20 text-white">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-sm">
          <span className="text-lg font-semibold">
            {String(currentSlide + 1).padStart(2, "0")}
          </span>
          <span className="text-white/60">/</span>
          <span className="text-white/60">
            {String(totalSlides).padStart(2, "0")}
          </span>
        </div>
      </div>
    </>
  )
}

"use client"

import { HelpCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function SharedHeader({ currentStep }: { currentStep?: number }) {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 20) // Change state after scrolling 20px
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`
        flex items-center justify-between px-6 fixed top-0 left-0 right-0 
        bg-white z-50 border-b border-gray-200
        transition-all duration-300 ease-in-out
        ${isScrolled ? "h-[52px]" : "h-[72px]"}
      `}
    >
      {currentStep ? (
        <div className="flex-1">
          <div
            className={`
              bg-[#BAE5D4] rounded-lg flex items-center w-fit
              transition-all duration-300 ease-in-out
              ${isScrolled ? "h-6 px-2" : "h-8 px-2.5"}
            `}
          >
            <span
              className={`
                text-[#2D2D2D] font-medium
                transition-all duration-300 ease-in-out
                ${isScrolled ? "text-[10px]" : "text-xs"}
              `}
            >
              Step {currentStep}/8
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex justify-center flex-1">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mysa_Logo_Pack_2018_RGB_Full_Colour%20(1)-kArcVF0eqWictjlncsYQdcv2Wm1TbM.png"
          alt="Mysa Logo"
          width={100}
          height={40}
          className={`
            transition-all duration-300 ease-in-out
            ${isScrolled ? "h-7 w-auto" : "h-10 w-auto"}
          `}
          priority
        />
      </div>

      <div className="flex-1 flex justify-end">
        <button
          className="text-[#2D2D2D] hover:text-[#2D2D2D]/80 transition-colors"
          onClick={() => router.push("/chat")}
          aria-label="Get help"
        >
          <HelpCircle
            className={`
              transition-all duration-300 ease-in-out
              ${isScrolled ? "h-5 w-5" : "h-6 w-6"}
            `}
          />
        </button>
      </div>
    </header>
  )
}


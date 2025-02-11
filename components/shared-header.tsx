"use client"

import { HelpCircle, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface SharedHeaderProps {
  currentStep?: number
}

export function SharedHeader({ currentStep }: SharedHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 20)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isWelcomeScreen = pathname === "/"

  const handleBackClick = () => {
    switch (pathname) {
      case "/steps":
        router.push("/control-method")
        break
      case "/control-method":
        router.push("/")
        break
      default:
        router.back()
    }
  }

  return (
    <header
      className={`
        flex items-center justify-between px-6 fixed top-0 left-0 right-0 
        bg-white z-50 border-b border-gray-200
        transition-all duration-300 ease-in-out
        ${isScrolled ? "h-[52px]" : "h-[72px]"}
      `}
    >
      <div className="flex-1">
        {!isWelcomeScreen && (
          <button
            onClick={handleBackClick}
            className="text-[#2D2D2D] hover:text-[#2D2D2D]/80 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft
              className={`
                transition-all duration-300 ease-in-out
                ${isScrolled ? "h-5 w-5" : "h-6 w-6"}
              `}
            />
          </button>
        )}
      </div>

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
        <Link href="/chat" className="text-[#2D2D2D] hover:text-[#2D2D2D]/80 transition-colors" aria-label="Get help">
          <HelpCircle
            className={`
              transition-all duration-300 ease-in-out
              ${isScrolled ? "h-5 w-5" : "h-6 w-6"}
            `}
          />
        </Link>
      </div>
    </header>
  )
}


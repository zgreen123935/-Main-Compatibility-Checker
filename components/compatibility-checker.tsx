"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { SharedHeader } from "@/components/shared-header"
import { QrCode, Smartphone } from "lucide-react"
import Link from "next/link"

export default function CompatibilityChecker() {
  const router = useRouter()

  const handleGetStarted = () => {
    console.log("Navigating to /control-method")
    router.push("/control-method")
  }

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader />
      <main className="px-6 py-12 pt-[calc(72px+2rem)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Mobile Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-[#2D2D2D] text-2xl md:text-3xl font-medium tracking-tight leading-tight">
                  Welcome to the Mysa Thermostat Compatibility Checker
                </h1>
                <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                  Our thermostats work with most homes. This quick guide will help you confirm if a Mysa thermostat is
                  right for you.
                </p>
              </div>

              <div className="relative aspect-video w-full max-w-md mx-auto">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/exported-k8qJCZjyFe6u6XzSWQlR6EDluCQaRt.png"
                  alt="Thermostat compatibility checker illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="flex justify-center w-full">
                <Link href="/control-method" className="w-full max-w-md">
                  <Button
                    className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white"
                    onClick={(e) => {
                      e.preventDefault()
                      handleGetStarted()
                    }}
                  >
                    Get started
                  </Button>
                </Link>
              </div>
            </div>

            {/* Desktop Content */}
            <div className="hidden md:block h-full space-y-8">
              <div className="h-full space-y-4 bg-gray-50 p-8 rounded-lg shadow-md flex flex-col justify-between">
                <div className="space-y-4">
                  <h2 className="text-[#2D2D2D] text-2xl font-medium tracking-tight leading-tight flex items-center">
                    <Smartphone className="mr-2 h-6 w-6" />
                    This Checker Works Best on Mobile
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    For the best experience, please use your smartphone to access this tool. Scan the QR code below with
                    your phone's camera to get started.
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-8 mt-8">
                  <div className="text-center">
                    <div className="bg-[#BAE5D4] p-4 rounded-lg shadow-md inline-block">
                      <Smartphone size={150} className="text-[#2D2D2D]" />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">1. Open your camera app</p>
                  </div>
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                      <QrCode size={150} />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">2. Scan this QR code</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu } from "lucide-react"
import Image from "next/image"

export default function CompatibilityChecker() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <button className="text-[#2D2D2D]">
          <Menu className="h-6 w-6" />
        </button>
        <Image src="/placeholder.svg?height=24&width=120" alt="Logo" width={120} height={24} className="h-6" />
        <button className="text-[#2D2D2D]">
          <ShoppingCart className="h-6 w-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-md mx-auto space-y-6">
          {/* Hero Text */}
          <div className="space-y-4 text-center">
            <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight leading-tight">
              Welcome to the Thermostat Compatibility Checker.
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Our thermostats are compatible with the majority of homes. This straightforward checker will help you
              determine if an ecobee thermostat is the right fit for yours.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative h-48 my-12">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_9185-P0gIl2rmKm9ffyRpHCS1655Pr3Pk3j.jpeg"
              alt="Thermostat compatibility checker illustration"
              fill
              className="object-contain dark:invert"
              priority
            />
          </div>

          {/* CTA Button */}
          <Button className="w-full py-6 text-lg bg-[#BAE5D4] hover:bg-[#BAE5D4]/90 text-[#2D2D2D]">Get started</Button>
        </div>
      </main>
    </div>
  )
}


"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SharedLayout } from "./SharedLayout"

const steps = [
  "Turn off power to your HVAC system",
  "Take a clear photo of your current thermostat",
  "Remove your thermostat's cover plate",
  "Take a photo of the exposed wiring",
]

export default function WallThermostatStepsOverview() {
  const router = useRouter()

  return (
    <SharedLayout showBack>
      <div className="space-y-4">
        <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Here's what you need to do.</h1>
        <p className="text-gray-600 text-lg">
          Follow these steps to check your wall thermostat's compatibility with Mysa.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BAE5D4] flex items-center justify-center">
              <span className="text-[#2D2D2D] font-medium">{index + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 text-lg pt-1">{step}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Button
          className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white"
          onClick={() => router.push("/safety-warning")}
        >
          Next
        </Button>
      </div>
    </SharedLayout>
  )
}


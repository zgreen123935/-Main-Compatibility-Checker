"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { SharedHeader } from "./shared-header"

const stepsForWallThermostat = [
  "Turn off power to your HVAC system",
  "Take a clear photo of your current thermostat",
  "Remove your thermostat's cover plate",
  "Take a photo of the exposed wiring",
]

const stepsForOtherMethods = [
  "Locate your heating/cooling unit",
  "Identify the control panel or remote",
  "Take clear photos of the control interface",
  "Note down any model numbers or specifications",
]

export default function StepsOverview() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const controlMethod = searchParams.get("method")

  const steps = controlMethod === "wall_thermostat" ? stepsForWallThermostat : stepsForOtherMethods

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SharedHeader />
      <main className="flex-1 px-6 py-8 pt-[calc(72px+2rem)] flex flex-col">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Here's what you need to do.</h1>
            <p className="text-gray-600 text-lg">
              We'll guide you through checking your {controlMethod === "wall_thermostat" ? "thermostat" : "system"}'s
              compatibility in just a few minutes. Follow these steps:
            </p>
          </div>

          {/* Steps List */}
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

          {/* Actions */}
          <div className="space-y-4">
            <Button
              className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white"
              onClick={() => router.push(controlMethod === "wall_thermostat" ? "/safety-warning" : "/capture/other")}
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}


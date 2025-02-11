"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { SharedLayout } from "./SharedLayout"

export default function SafetyWarning() {
  const router = useRouter()

  return (
    <SharedLayout showBack currentStep={2}>
      <div className="space-y-8 flex-1 flex flex-col">
        <div className="space-y-4 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
          <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Important Safety Reminder</h1>
          <p className="text-gray-600 text-lg">Before you continue, turn off the power to your HVAC system.</p>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-sm text-yellow-700">
            Working with live electrical components can be dangerous, so always shut off the power at the circuit
            breaker before removing your thermostat cover.
          </p>
        </div>

        <div className="space-y-4 flex-grow">
          <h2 className="text-lg font-medium text-[#2D2D2D]">Steps to follow:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Locate your HVAC system's circuit breaker.</li>
            <li>Turn off the power to your heating and cooling system.</li>
            <li>Verify the thermostat is off before continuing.</li>
          </ol>
        </div>

        <Button
          className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white mt-4"
          onClick={() => router.push("/capture/thermostat")}
        >
          I've turned off the power
        </Button>
      </div>
    </SharedLayout>
  )
}


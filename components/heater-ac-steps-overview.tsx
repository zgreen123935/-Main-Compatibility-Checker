"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAppContext } from "../context/AppContext"
import { SharedLayout } from "./SharedLayout"

const steps = [
  "Locate your heating/cooling unit",
  "Identify the control panel or remote",
  "Take clear photos of the control interface",
  "Note down any model numbers or specifications",
]

export default function HeaterACStepsOverview() {
  const router = useRouter()
  const { state } = useAppContext()

  return (
    <SharedLayout showBack>
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Here's what you need to do.</h1>
        <p className="text-gray-600 text-lg">
          Follow these steps to check your heater/AC unit's compatibility with Mysa.
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
          onClick={() => router.push("/capture/other")}
        >
          Next
        </Button>
      </div>
    </SharedLayout>
  )
}


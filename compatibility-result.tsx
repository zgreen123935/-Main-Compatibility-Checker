"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Check } from "lucide-react"
import { useRouter } from "next/navigation"

const compatibilitySummary = [
  { title: "Thermostat Model", detail: "Your thermostat model XYZ123 is fully supported by Mysa." },
  { title: "Wiring Configuration", detail: "Your current wiring (R, W, G, Y) is compatible with Mysa's requirements." },
  { title: "Power Supply", detail: "Your system's 24V power supply meets Mysa's specifications." },
  { title: "HVAC System", detail: "Your 2-stage heating and 1-stage cooling system is supported." },
  { title: "Installation", detail: "Standard installation process, no additional adapters required." },
]

export default function CompatibilityResult() {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 py-8 flex flex-col">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Celebratory Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-[#BAE5D4] p-3">
                <Check className="h-8 w-8 text-[#2D2D2D]" />
              </div>
            </div>
            <h1 className="text-[#2D2D2D] text-3xl font-medium tracking-tight">Great news!</h1>
            <p className="text-gray-600 text-xl">Your thermostat is compatible with Mysa.</p>
          </div>

          {/* Expandable Summary */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="font-medium text-[#2D2D2D]">View Analysis</span>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            {isExpanded && (
              <div className="px-4 py-3 space-y-3 animate-fadeIn">
                {compatibilitySummary.map((item, index) => (
                  <div key={index}>
                    <h3 className="font-medium text-[#2D2D2D]">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call-to-Action Buttons */}
          <div className="space-y-4">
            <Button className="w-full py-6 text-lg bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white">Shop Now</Button>
            <Button
              variant="outline"
              className="w-full py-6 text-lg border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D]/10"
              onClick={() => router.push("/chat")}
            >
              Ask More Questions
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}


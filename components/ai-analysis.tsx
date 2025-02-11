"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { SharedHeader } from "./shared-header"

const analysisSteps = [
  { step: "Identifying Thermostat Model", details: "Reviewing your photos for the model number and key features." },
  { step: "Examining Wiring Setup", details: "Confirming wire colors and terminal connections." },
  {
    step: "Cross‐Checking Requirements",
    details: "Verifying your system details against Mysa's supported wiring guidelines.",
  },
  { step: "Verifying Power", details: "Making sure your voltage and amperage are correct." },
  { step: "Preparing Your Next Steps", details: "Gathering the instructions you'll need for a smooth installation." },
]

export default function CompatibilityAnalysis() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prevStep) => {
        if (prevStep < analysisSteps.length - 1) {
          return prevStep + 1
        } else {
          clearInterval(timer)
          setTimeout(() => router.push("/result"), 1000) // Navigate to result page after last step
          return prevStep
        }
      })
    }, 3000) // Move to next step every 3 seconds

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 py-8 pt-[calc(72px+2rem)] flex flex-col">
        <SharedHeader />
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Checking Compatibility</h1>
            <p className="text-gray-600 text-lg">
              We're confirming that Mysa works with your thermostat. This usually takes about 30 seconds.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#BAE5D4] h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / analysisSteps.length) * 100}%` }}
            ></div>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-4">
            {analysisSteps.map((item, index) => (
              <div key={index} className={`flex items-start space-x-3 ${index > currentStep ? "opacity-40" : ""}`}>
                <div
                  className={`flex-shrink-0 h-6 w-6 mt-0.5 ${index <= currentStep ? "text-[#BAE5D4]" : "text-gray-300"}`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <div
                      className={`h-6 w-6 rounded-full border-2 ${index === currentStep ? "border-[#BAE5D4]" : "border-gray-300"}`}
                    >
                      {index === currentStep && (
                        <div className="h-full w-full rounded-full bg-[#BAE5D4] animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[#2D2D2D] font-medium">{item.step}</p>
                  <p className="text-sm text-gray-500">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"

const analysisSteps = [
  { step: "Identifying thermostat model", details: "Analyzing image for model number and physical characteristics." },
  { step: "Examining wiring configuration", details: "Detecting wire colors and terminal connections." },
  {
    step: "Checking compatibility database",
    details: "Cross-referencing with Mysa's supported models and wiring schemas.",
  },
  { step: "Verifying power requirements", details: "Ensuring your system meets Mysa's voltage and amperage needs." },
  { step: "Generating installation instructions", details: "Preparing custom guidance based on your specific setup." },
]

export default function AIAnalysis() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep < analysisSteps.length - 1 ? prevStep + 1 : prevStep))
    }, 3000) // Move to next step every 3 seconds

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 px-6 py-8 flex flex-col">
        <div className="max-w-md mx-auto w-full space-y-8">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-[#2D2D2D] text-2xl font-medium tracking-tight">Analyzing Compatibility</h1>
            <p className="text-gray-600 text-lg">
              Our AI is determining if Mysa is compatible with your thermostat. This usually takes about 30 seconds.
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


"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalHeatingSources() {
  const { dispatch } = useInstall()
  const [primaryHeating, setPrimaryHeating] = useState<string | null>(null)
  const [secondaryHeating, setSecondaryHeating] = useState<string | null>(null)

  const heatingOptions = ["Electric", "Heat Pump", "Gas", "Oil", "Electric Resistance"]
  const secondaryOptions = [...heatingOptions, "None"]

  const handleContinue = () => {
    dispatch({ type: "SET_ANSWER", key: "primaryHeating", value: primaryHeating })
    dispatch({ type: "SET_ANSWER", key: "secondaryHeating", value: secondaryHeating })
    dispatch({ type: "COMPLETE_STEP", step: "physical-heating-sources" })
    dispatch({ type: "SET_STEP", step: "physical-install-anchors" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Heating Sources</h1>
          <p className="text-[#4B5563] leading-relaxed">Select your heating sources for optimal configuration.</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Primary Heating Source:</h3>
          <div className="space-y-3">
            {heatingOptions.map((option) => (
              <div
                key={option}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                  primaryHeating === option ? "border-[#BAE5D4] bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPrimaryHeating(option)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={primaryHeating === option}
                    onChange={() => setPrimaryHeating(option)}
                    className="mr-3"
                  />
                  <span className="font-medium text-[#2D2D2D]">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">Secondary/Auxiliary Heating:</h3>
          <div className="space-y-3">
            {secondaryOptions.map((option) => (
              <div
                key={option}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                  secondaryHeating === option ? "border-[#BAE5D4] bg-green-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSecondaryHeating(option)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={secondaryHeating === option}
                    onChange={() => setSecondaryHeating(option)}
                    className="mr-3"
                  />
                  <span className="font-medium text-[#2D2D2D]">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <InstallButton
          title="Continue"
          onPress={handleContinue}
          className="w-full"
          disabled={primaryHeating === null || secondaryHeating === null}
        />
      </div>
    </div>
  )
}

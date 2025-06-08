"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function DetectHighVoltage() {
  const { dispatch } = useInstall()
  const [hasHighVoltage, setHasHighVoltage] = useState<boolean | null>(null)

  const handleSelection = (hasHV: boolean) => {
    setHasHighVoltage(hasHV)
    dispatch({ type: "SET_ANSWER", key: "hasHighVoltage", value: hasHV })
  }

  const handleContinue = () => {
    if (hasHighVoltage) {
      // Navigate to incompatibility screen
      alert(
        "Your system is not compatible with Mysa for Central HVAC due to high voltage. Please contact support for alternative solutions.",
      )
      return
    }

    dispatch({ type: "COMPLETE_STEP", step: "detect-high-voltage" })
    dispatch({ type: "SET_STEP", step: "c-wire-question" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">High-Voltage Check</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Do you see any of the following on your old thermostat? This is important for safety and compatibility.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasHighVoltage === true ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasHighVoltage === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D] mb-2">Yes, I see high voltage indicators:</h3>
                <ul className="text-sm text-[#4B5563] space-y-1">
                  <li>• L1 or L2 terminals</li>
                  <li>• "110 VAC," "120 VAC," or "240 VAC" printed anywhere</li>
                  <li>• "Warning: High Voltage" label</li>
                  <li>• Thick wires with wire nuts</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasHighVoltage === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasHighVoltage === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, I don't see any of these</h3>
                <p className="text-sm text-[#4B5563] mt-1">My thermostat appears to be low voltage</p>
              </div>
            </div>
          </div>
        </div>

        <InstallButton
          title="Continue"
          onPress={handleContinue}
          className="w-full"
          disabled={hasHighVoltage === null}
        />
      </div>
    </div>
  )
}

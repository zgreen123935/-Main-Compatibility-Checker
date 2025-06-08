"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function ConfigDualFuel() {
  const { dispatch } = useInstall()
  const [hasDualFuel, setHasDualFuel] = useState<boolean | null>(null)

  const handleSelection = (hasDual: boolean) => {
    setHasDualFuel(hasDual)
    dispatch({ type: "SET_ANSWER", key: "dualFuel", value: hasDual })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "config-dual-fuel" })
    dispatch({ type: "SET_STEP", step: "config-wired-sensor" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Dual-Fuel System</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Do you have a dual fuel system (heat pump + furnace, gas/oil)?
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <TooltipButton tooltip="A dual fuel system combines a heat pump with a backup heating source like a gas or oil furnace. The system automatically switches between the heat pump and backup heating based on outdoor temperature for optimal efficiency.">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            </TooltipButton>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">What is a dual fuel system?</h3>
              <p className="text-blue-700 text-sm">
                A dual fuel system combines a heat pump with backup heating (gas/oil furnace). It switches between
                sources based on outdoor temperature for efficiency.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasDualFuel === true ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasDualFuel === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I have a dual fuel system</h3>
                <p className="text-sm text-[#4B5563] mt-1">I have both a heat pump and backup heating (gas/oil)</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasDualFuel === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasDualFuel === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, I have a single heating source</h3>
                <p className="text-sm text-[#4B5563] mt-1">
                  I have either a heat pump OR conventional heating, not both
                </p>
              </div>
            </div>
          </div>
        </div>

        <InstallButton title="Continue" onPress={handleContinue} className="w-full" disabled={hasDualFuel === null} />
      </div>
    </div>
  )
}

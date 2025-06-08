"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function ConfigHeatPump() {
  const { dispatch } = useInstall()
  const [hasHeatPump, setHasHeatPump] = useState<boolean | null>(null)

  const handleSelection = (hasHP: boolean) => {
    setHasHeatPump(hasHP)
    dispatch({ type: "SET_ANSWER", key: "heatPump", value: hasHP })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "config-heat-pump" })
    dispatch({ type: "SET_STEP", step: "config-new-c-wire" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Heat Pump Detection</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Do you have a heat pump? Heat pumps are typically located outside and look similar to an air conditioning
            unit.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <TooltipButton tooltip="Heat pumps are outdoor units that provide both heating and cooling. They look similar to AC units but can reverse their operation to provide heat in winter. If you're unsure, check if your outdoor unit runs during winter for heating.">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            </TooltipButton>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">How to identify a heat pump</h3>
              <p className="text-blue-700 text-sm">
                Heat pumps are outside units that provide both heating and cooling. They look like AC units but run in
                winter too. Check if your outdoor unit operates during heating season.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasHeatPump === true ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasHeatPump === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I have a heat pump</h3>
                <p className="text-sm text-[#4B5563] mt-1">My outdoor unit provides both heating and cooling</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasHeatPump === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasHeatPump === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, I don't have a heat pump</h3>
                <p className="text-sm text-[#4B5563] mt-1">
                  I have a conventional heating system (furnace, boiler, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>

        <InstallButton title="Continue" onPress={handleContinue} className="w-full" disabled={hasHeatPump === null} />
      </div>
    </div>
  )
}

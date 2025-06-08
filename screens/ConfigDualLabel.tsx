"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function ConfigDualLabel() {
  const { dispatch } = useInstall()
  const [hasDualLabel, setHasDualLabel] = useState<boolean | null>(null)

  const handleSelection = (hasDual: boolean) => {
    setHasDualLabel(hasDual)
    dispatch({ type: "SET_ANSWER", key: "dualLabel", value: hasDual })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "config-dual-label" })
    dispatch({ type: "SET_STEP", step: "config-heat-pump" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Dual-Label Terminals</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Are any wires connected to a terminal with two different labels?
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <TooltipButton tooltip="Some thermostats have terminals with dual labels like 'Y1/Y' or 'W1/W' or 'O/B'. These are used for heat pump vs. conventional systems. If you see dual labels, we'll use conventional labels for the next steps.">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            </TooltipButton>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">What are dual-label terminals?</h3>
              <p className="text-blue-700 text-sm">
                Some thermostats use dual-labels for heat pump vs. conventional systems (like Y1/Y or O/B). If yes,
                we'll use conventional labels next.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasDualLabel === true ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasDualLabel === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I see dual-label terminals</h3>
                <p className="text-sm text-[#4B5563] mt-1">Some terminals have two labels like Y1/Y or O/B</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasDualLabel === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasDualLabel === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, each terminal has one label</h3>
                <p className="text-sm text-[#4B5563] mt-1">All terminals have single, clear labels</p>
              </div>
            </div>
          </div>
        </div>

        <InstallButton title="Continue" onPress={handleContinue} className="w-full" disabled={hasDualLabel === null} />
      </div>
    </div>
  )
}

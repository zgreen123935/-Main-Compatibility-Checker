"use client"

import { useState, useEffect } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function CWireQuestion() {
  const { dispatch, state } = useInstall()
  const [hasCWire, setHasCWire] = useState<boolean | null>(state.automatedDecisions.hasCWireDetected ?? null)

  // Auto-skip if C-wire was detected in photo
  useEffect(() => {
    if (state.automatedDecisions.hasCWireDetected !== undefined) {
      // Show automated decision but still allow user to verify
      setHasCWire(state.automatedDecisions.hasCWireDetected)
    }
  }, [state.automatedDecisions.hasCWireDetected])

  const handleSelection = (hasC: boolean) => {
    setHasCWire(hasC)
    dispatch({ type: "SET_ANSWER", key: "hasCWire", value: hasC })
  }

  const handleContinue = () => {
    if (hasCWire) {
      dispatch({ type: "COMPLETE_STEP", step: "c-wire-question" })
      dispatch({ type: "SET_STEP", step: "config-jumper-wires" }) // Start configuration subflow
    } else {
      dispatch({ type: "COMPLETE_STEP", step: "c-wire-question" })
      dispatch({ type: "SET_STEP", step: "c-wire-requirement" })
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">C-Wire Check</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Does your old thermostat have a wire connected to the terminal labeled 'C'?
          </p>
        </div>

        {state.automatedDecisions.hasCWireDetected !== undefined && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-800 mb-2">🤖 Auto-Detected from Photo</h3>
            <p className="text-green-700 text-sm">
              We detected {state.automatedDecisions.hasCWireDetected ? "a C-wire connection" : "no C-wire"} in your
              photo. Please verify this is correct.
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <TooltipButton tooltip="The C-wire (common wire) is usually blue or black and provides continuous power to your thermostat. Look for a terminal labeled 'C' or 'COM' on your old thermostat's wiring panel.">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            </TooltipButton>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">What is a C-wire?</h3>
              <p className="text-blue-700 text-sm">
                The C-wire provides continuous power to smart thermostats. It's usually a blue or black wire connected
                to a terminal labeled 'C' or 'COM'.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasCWire === true ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input type="radio" checked={hasCWire === true} onChange={() => handleSelection(true)} className="mr-3" />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I have a C-wire</h3>
                <p className="text-sm text-[#4B5563] mt-1">I can see a wire connected to the 'C' terminal</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasCWire === false ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasCWire === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, I don't have a C-wire</h3>
                <p className="text-sm text-[#4B5563] mt-1">The 'C' terminal is empty or doesn't exist</p>
              </div>
            </div>
          </div>
        </div>

        <InstallButton title="Continue" onPress={handleContinue} className="w-full" disabled={hasCWire === null} />
      </div>
    </div>
  )
}

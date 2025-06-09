"use client"

import { useState, useEffect } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function ConfigJumperWires() {
  const { dispatch, state } = useInstall()
  const [hasJumperWires, setHasJumperWires] = useState<boolean | null>(
    state.automatedDecisions.hasJumpersDetected ?? null,
  )

  // Auto-detect jumpers from photo analysis
  useEffect(() => {
    if (state.automatedDecisions.hasJumpersDetected !== undefined) {
      setHasJumperWires(state.automatedDecisions.hasJumpersDetected)
    }
  }, [state.automatedDecisions.hasJumpersDetected])

  const handleSelection = (hasJumpers: boolean) => {
    setHasJumperWires(hasJumpers)
    dispatch({ type: "SET_ANSWER", key: "jumperRemoved", value: hasJumpers })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "config-jumper-wires" })
    dispatch({ type: "SET_STEP", step: "config-dual-label" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Jumper Wire Check</h1>
          <p className="text-[#4B5563] leading-relaxed">Do you see any jumper wires on your old thermostat?</p>
        </div>

        {state.automatedDecisions.hasJumpersDetected && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-orange-800 mb-2">🤖 Jumpers Detected in Photo</h3>
            <p className="text-orange-700 text-sm">
              We found {state.automatedDecisions.detectedJumpers?.length || 0} jumper wire(s) in your photo:
              {state.automatedDecisions.detectedJumpers?.map((jumper, i) => (
                <span key={i} className="block">
                  • {jumper.fromTerminal} → {jumper.toTerminal}
                </span>
              ))}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <TooltipButton tooltip="A jumper wire is a short wire (usually red) that connects two terminals on your thermostat. They're typically used to bridge Rh and Rc terminals or other connections. Look for short wires that go from one terminal directly to another on the same thermostat.">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            </TooltipButton>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">What is a jumper wire?</h3>
              <p className="text-blue-700 text-sm">
                A jumper wire is a short wire connecting two terminals (usually red wires). They bridge connections
                between Rh/Rc or other terminals.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasJumperWires === true ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasJumperWires === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I see jumper wires</h3>
                <p className="text-sm text-[#4B5563] mt-1">I can see short wires connecting two terminals</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasJumperWires === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasJumperWires === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, I don't see any jumper wires</h3>
                <p className="text-sm text-[#4B5563] mt-1">All wires go to separate terminals</p>
              </div>
            </div>
          </div>
        </div>

        {hasJumperWires === true && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              <strong>Important:</strong> Please remove the jumper wires carefully (but do not disturb other wires)
              before proceeding with installation.
            </p>
          </div>
        )}

        <InstallButton
          title="Continue"
          onPress={handleContinue}
          className="w-full"
          disabled={hasJumperWires === null}
        />
      </div>
    </div>
  )
}

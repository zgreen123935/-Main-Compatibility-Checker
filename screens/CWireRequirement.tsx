"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function CWireRequirement() {
  const { dispatch } = useInstall()
  const [hasAdapter, setHasAdapter] = useState<boolean | null>(null)

  const handleSelection = (hasAdapterOrWire: boolean) => {
    setHasAdapter(hasAdapterOrWire)
    dispatch({ type: "SET_ANSWER", key: "hasAdapter", value: hasAdapterOrWire })
  }

  const handleContinue = () => {
    if (hasAdapter) {
      dispatch({ type: "COMPLETE_STEP", step: "c-wire-requirement" })
      dispatch({ type: "SET_STEP", step: "config-jumper-wires" }) // Start configuration subflow
    } else {
      alert(
        "You'll need either a C-wire adapter or to run a new C-wire before proceeding. Please contact support for guidance.",
      )
    }
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">C-Wire Required</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Mysa needs a C-wire to operate properly. You have a couple of options to proceed.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-orange-800 mb-4">Your Options:</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-orange-600 font-bold mr-3 mt-1">1.</span>
              <span className="text-orange-800">Use a Mysa C-Wire Adapter (sold separately)</span>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 font-bold mr-3 mt-1">2.</span>
              <span className="text-orange-800">Run a new C-wire from your HVAC system</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasAdapter === true ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasAdapter === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">I have a C-Wire Adapter</h3>
                <p className="text-sm text-[#4B5563] mt-1">I have the Mysa C-Wire Adapter ready to install</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasAdapter === false ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasAdapter === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">I need to run a new C-wire</h3>
                <p className="text-sm text-[#4B5563] mt-1">I'll install a new C-wire from my HVAC system</p>
              </div>
            </div>
          </div>
        </div>

        <InstallButton title="Continue" onPress={handleContinue} className="w-full" disabled={hasAdapter === null} />
      </div>
    </div>
  )
}

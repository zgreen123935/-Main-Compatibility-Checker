"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalCheckBox() {
  const { dispatch } = useInstall()
  const [hasElectricalBox, setHasElectricalBox] = useState<boolean | null>(null)

  const handleSelection = (hasBox: boolean) => {
    setHasElectricalBox(hasBox)
    dispatch({ type: "SET_ANSWER", key: "hasElectricalBox", value: hasBox })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-check-box" })
    dispatch({ type: "SET_STEP", step: "physical-mark-holes" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Check for Electrical Box</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Is your old thermostat installed on an electrical box behind the wall?
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-800 mb-2">What to look for:</h3>
          <p className="text-blue-700 text-sm">
            An electrical box is a metal or plastic enclosure that's mounted inside the wall. You'll see it as a
            rectangular opening with mounting holes or tabs.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasElectricalBox === true ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasElectricalBox === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, there's an electrical box</h3>
                <p className="text-sm text-[#4B5563] mt-1">I can see a metal or plastic box in the wall opening</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasElectricalBox === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasElectricalBox === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No electrical box</h3>
                <p className="text-sm text-[#4B5563] mt-1">The thermostat was mounted directly to drywall</p>
              </div>
            </div>
          </div>
        </div>

        {hasElectricalBox === true && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              <strong>Note:</strong> You'll need to remove the mount from the electrical box before proceeding with the
              new installation.
            </p>
          </div>
        )}

        <InstallButton
          title="Continue"
          onPress={handleContinue}
          className="w-full"
          disabled={hasElectricalBox === null}
        />
      </div>
    </div>
  )
}

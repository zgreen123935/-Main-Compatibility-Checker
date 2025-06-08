"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalTrimPlate() {
  const { dispatch } = useInstall()
  const [usingTrimPlate, setUsingTrimPlate] = useState<boolean | null>(null)

  const handleSelection = (using: boolean) => {
    setUsingTrimPlate(using)
    dispatch({ type: "SET_ANSWER", key: "usingTrimPlate", value: using })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-trim-plate" })
    dispatch({ type: "SET_STEP", step: "physical-attach-plate" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Trim Plate Option</h1>
          <p className="text-[#4B5563] leading-relaxed">Are you using a Mysa trim plate for this installation?</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-800 mb-2">About trim plates:</h3>
          <p className="text-blue-700 text-sm">
            Trim plates help cover larger wall openings or paint marks from your old thermostat, providing a cleaner
            finished appearance.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              usingTrimPlate === true ? "border-[#BAE5D4] bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={usingTrimPlate === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I'm using a trim plate</h3>
                <p className="text-sm text-[#4B5563] mt-1">I have a Mysa trim plate to install</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              usingTrimPlate === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={usingTrimPlate === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No trim plate needed</h3>
                <p className="text-sm text-[#4B5563] mt-1">The wall plate will mount directly to the wall</p>
              </div>
            </div>
          </div>
        </div>

        {usingTrimPlate === true && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-medium text-yellow-800 mb-2">Trim Plate Installation:</h3>
            <p className="text-yellow-800 text-sm">
              Attach the trim plate by pulling wires through the center opening and placing it against the wall before
              mounting the wall plate.
            </p>
          </div>
        )}

        <InstallButton
          title="Continue"
          onPress={handleContinue}
          className="w-full"
          disabled={usingTrimPlate === null}
        />
      </div>
    </div>
  )
}

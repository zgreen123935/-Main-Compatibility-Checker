"use client"

import { useState, useEffect } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function ConfigNewCWire() {
  const { dispatch, state } = useInstall()
  const [ranNewCWire, setRanNewCWire] = useState<boolean | null>(null)

  // Only show this screen if user originally said they don't have a C-wire
  const originallyHadCWire = state.answers.hasCWire

  // Use useEffect to handle navigation when originallyHadCWire is true
  useEffect(() => {
    if (originallyHadCWire) {
      dispatch({ type: "COMPLETE_STEP", step: "config-new-c-wire" })
      dispatch({ type: "SET_STEP", step: "config-wire-identification" })
    }
  }, [originallyHadCWire, dispatch])

  const handleSelection = (ranWire: boolean) => {
    setRanNewCWire(ranWire)
    dispatch({ type: "SET_ANSWER", key: "ranNewCWire", value: ranWire })
  }

  const handleContinue = () => {
    if (ranNewCWire === false) {
      // Redirect back to C-wire requirement
      dispatch({ type: "SET_STEP", step: "c-wire-requirement" })
      return
    }

    dispatch({ type: "COMPLETE_STEP", step: "config-new-c-wire" })
    dispatch({ type: "SET_STEP", step: "config-wire-identification" })
  }

  // Skip rendering this component if they originally had a C-wire
  if (originallyHadCWire) {
    return null
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">C-Wire Installation</h1>
          <p className="text-[#4B5563] leading-relaxed">Were you planning to run a new C-wire for this installation?</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-orange-800 mb-4">Reminder:</h3>
          <p className="text-orange-800">
            Since you indicated you don't have a C-wire, you'll need either a new C-wire or the Mysa C-Wire Adapter to
            proceed.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              ranNewCWire === true ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={ranNewCWire === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I ran a new C-wire</h3>
                <p className="text-sm text-[#4B5563] mt-1">I've installed a new C-wire from my HVAC system</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              ranNewCWire === false ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={ranNewCWire === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, I haven't run a new C-wire</h3>
                <p className="text-sm text-[#4B5563] mt-1">I still need to address the C-wire requirement</p>
              </div>
            </div>
          </div>
        </div>

        <InstallButton title="Continue" onPress={handleContinue} className="w-full" disabled={ranNewCWire === null} />
      </div>
    </div>
  )
}

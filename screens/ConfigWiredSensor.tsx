"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function ConfigWiredSensor() {
  const { dispatch } = useInstall()
  const [hasWiredSensor, setHasWiredSensor] = useState<boolean | null>(null)

  const handleSelection = (hasSensor: boolean) => {
    setHasWiredSensor(hasSensor)
    dispatch({ type: "SET_ANSWER", key: "wiredSensor", value: hasSensor })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "config-wired-sensor" })
    dispatch({ type: "SET_STEP", step: "config-show-code" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Wired Sensor</h1>
          <p className="text-[#4B5563] leading-relaxed">Are you connecting a wired sensor to your Mysa thermostat?</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <TooltipButton tooltip="A wired sensor is an external temperature sensor that can be placed in a different room to provide more accurate temperature readings for your HVAC system. It connects to your thermostat with a wire and helps ensure even heating/cooling throughout your home.">
              <span className="text-blue-600 text-xl mr-3">ℹ️</span>
            </TooltipButton>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">What is a wired sensor?</h3>
              <p className="text-blue-700 text-sm">
                A wired sensor is an external temperature sensor placed in another room for more accurate temperature
                control throughout your home.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasWiredSensor === true ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(true)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasWiredSensor === true}
                onChange={() => handleSelection(true)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">Yes, I'm connecting a wired sensor</h3>
                <p className="text-sm text-[#4B5563] mt-1">I have a wired sensor to install in another room</p>
              </div>
            </div>
          </div>

          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
              hasWiredSensor === false ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelection(false)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                checked={hasWiredSensor === false}
                onChange={() => handleSelection(false)}
                className="mr-3"
              />
              <div>
                <h3 className="font-medium text-[#2D2D2D]">No, I'm not using a wired sensor</h3>
                <p className="text-sm text-[#4B5563] mt-1">I'll use the thermostat's built-in temperature sensor</p>
              </div>
            </div>
          </div>
        </div>

        {hasWiredSensor === true && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              <strong>Note:</strong> You'll receive additional wiring instructions for your sensor during the physical
              installation steps.
            </p>
          </div>
        )}

        <InstallButton
          title="Continue"
          onPress={handleContinue}
          className="w-full"
          disabled={hasWiredSensor === null}
        />
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { TooltipButton } from "../shared/components/TooltipButton"
import { useInstall } from "../shared/context/InstallContext"

export function ConfigWireIdentification() {
  const { dispatch, state } = useInstall()
  const [selectedWires, setSelectedWires] = useState<string[]>([])
  const [otherWires, setOtherWires] = useState("")

  // Check if user has a heat pump to show appropriate wires
  const hasHeatPump = state.answers.heatPump

  const conventionalWires = [
    { label: "W / W1", description: "Heating (usually white)" },
    { label: "W2", description: "Second stage heating (usually white)" },
    { label: "Y / Y1", description: "Cooling (usually yellow)" },
    { label: "Y2", description: "Second stage cooling (usually yellow)" },
    { label: "G / G1", description: "Fan (usually green)" },
    { label: "R", description: "Power (usually red)" },
    { label: "Rh / Rc", description: "Power heating/cooling (red)" },
    { label: "C", description: "Common (usually blue/black)" },
  ]

  const heatPumpWires = [
    { label: "O", description: "Reversing valve (usually orange)" },
    { label: "B", description: "Reversing valve (usually blue)" },
    { label: "Y / Y1", description: "Cooling (usually yellow)" },
    { label: "Y2", description: "Second stage cooling (usually yellow)" },
    { label: "G / G1", description: "Fan (usually green)" },
    { label: "R", description: "Power (usually red)" },
    { label: "Rh / Rc", description: "Power heating/cooling (red)" },
    { label: "C", description: "Common (usually blue/black)" },
    { label: "W / W1", description: "Auxiliary heat (usually white)" },
    { label: "W2", description: "Second stage auxiliary heat (usually white)" },
  ]

  const commonWires = hasHeatPump ? heatPumpWires : conventionalWires

  const lessCommonWires = ["Y3", "W3", "OB/O/B", "W/B", "Y/O", "Multipurpose (*)"]

  const handleWireToggle = (wire: string) => {
    setSelectedWires((prev) => (prev.includes(wire) ? prev.filter((w) => w !== wire) : [...prev, wire]))
  }

  const handleContinue = () => {
    const allWires = [...selectedWires]
    if (otherWires.trim()) {
      allWires.push(
        ...otherWires
          .split(",")
          .map((w) => w.trim())
          .filter((w) => w),
      )
    }

    dispatch({ type: "SET_ANSWER", key: "wires", value: allWires })
    dispatch({ type: "COMPLETE_STEP", step: "config-wire-identification" })
    dispatch({ type: "SET_STEP", step: "config-dual-fuel" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Wire Identification</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Which wires does your old thermostat have? Select all that apply.
          </p>
        </div>

        {hasHeatPump && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">Heat Pump System Detected</h3>
            <p className="text-blue-700 text-sm">
              The wire options below are optimized for heat pump systems. Look for O or B wires for the reversing valve.
            </p>
          </div>
        )}

        {!hasHeatPump && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-green-800 mb-2">Conventional System Detected</h3>
            <p className="text-green-700 text-sm">
              The wire options below are optimized for conventional heating systems. Look for W/W1 wires for heating.
            </p>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">
            Common Wires for {hasHeatPump ? "Heat Pump" : "Conventional"} Systems:
          </h3>
          <div className="space-y-3">
            {commonWires.map((wire) => (
              <div
                key={wire.label}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedWires.includes(wire.label)
                    ? "border-[#BAE5D4] bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleWireToggle(wire.label)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedWires.includes(wire.label)}
                      onChange={() => handleWireToggle(wire.label)}
                      className="mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-[#2D2D2D]">{wire.label}</h4>
                      <p className="text-sm text-[#4B5563]">{wire.description}</p>
                    </div>
                  </div>
                  <TooltipButton
                    tooltip={`The ${wire.label} terminal is typically used for ${wire.description.toLowerCase()}. Look for a terminal labeled exactly as shown.`}
                  >
                    <span className="text-blue-600 text-lg">ℹ️</span>
                  </TooltipButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <details className="border border-gray-200 rounded-lg">
            <summary className="p-4 cursor-pointer font-medium text-[#2D2D2D] hover:bg-gray-50">
              Less Common Wires (click to expand)
            </summary>
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                {lessCommonWires.map((wire) => (
                  <label key={wire} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWires.includes(wire)}
                      onChange={() => handleWireToggle(wire)}
                      className="rounded"
                    />
                    <span className="text-sm text-[#4B5563]">{wire}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Other wires (comma-separated):</label>
          <input
            type="text"
            value={otherWires}
            onChange={(e) => setOtherWires(e.target.value)}
            placeholder="e.g., X, AUX, E"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BAE5D4]"
          />
        </div>

        <InstallButton
          title="Continue"
          onPress={handleContinue}
          className="w-full"
          disabled={selectedWires.length === 0}
        />
      </div>
    </div>
  )
}

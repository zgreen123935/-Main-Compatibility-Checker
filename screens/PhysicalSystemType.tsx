"use client"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"

export function PhysicalSystemType() {
  const { dispatch } = useInstall()
  const [systemType, setSystemType] = useState<string | null>(null)

  const systemTypes = [
    {
      id: "forced-air",
      title: "Forced Air Only",
      description: "Ducts and vents throughout the home",
    },
    {
      id: "hydronic",
      title: "Hydronic/Radiant Only",
      description: "Baseboards, radiators, or in-floor heating",
    },
    {
      id: "both",
      title: "Both Forced Air & Radiant",
      description: "Same thermostat controls both systems",
    },
    {
      id: "fan-coil",
      title: "Fan Coil Unit",
      description: "Condo/apartment multi-speed fan unit",
    },
  ]

  const handleSelection = (type: string) => {
    setSystemType(type)
    dispatch({ type: "SET_ANSWER", key: "systemType", value: type })
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "physical-system-type" })
    dispatch({ type: "SET_STEP", step: "physical-heating-sources" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">System Type</h1>
          <p className="text-[#4B5563] leading-relaxed">What type of system does your thermostat control?</p>
        </div>

        <div className="space-y-4 mb-8">
          {systemTypes.map((type) => (
            <div
              key={type.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                systemType === type.id ? "border-[#BAE5D4] bg-green-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleSelection(type.id)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  checked={systemType === type.id}
                  onChange={() => handleSelection(type.id)}
                  className="mr-3"
                />
                <div>
                  <h3 className="font-medium text-[#2D2D2D]">{type.title}</h3>
                  <p className="text-sm text-[#4B5563] mt-1">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <InstallButton title="Continue" onPress={handleContinue} className="w-full" disabled={systemType === null} />
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"
import { computeConfig } from "../shared/configLogic"
import type { ConfigInput, ConfigOutput } from "../shared/types"

export function ConfigShowCode() {
  const { state, dispatch } = useInstall()
  const [config, setConfig] = useState<ConfigOutput | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      const configInput: ConfigInput = {
        jumperRemoved: state.answers.jumperRemoved || false,
        dualLabel: state.answers.dualLabel || false,
        heatPump: state.answers.heatPump || false,
        ranNewCWire: state.answers.ranNewCWire || false,
        wires: state.answers.wires || [],
        dualFuel: state.answers.dualFuel || false,
        wiredSensor: state.answers.wiredSensor || false,
      }

      const result = computeConfig(configInput)
      setConfig(result)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [state.answers])

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "config-show-code" })
    dispatch({ type: "SET_STEP", step: "physical-label-wires" })
  }

  const handleGoBack = () => {
    dispatch({ type: "SET_STEP", step: "config-wire-identification" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-[#4B5563]">Computing your configuration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-medium text-[#2D2D2D] mb-4">Configuration Complete</h1>
          <p className="text-[#4B5563]">Here is our best configuration match for your system:</p>
        </div>

        <div className="bg-white border-2 border-[#BAE5D4] rounded-lg p-6 mb-8">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <div className="text-6xl font-bold text-[#2D2D2D] mb-2">{config?.configCode}</div>
            <div className="text-[#6B7280] font-semibold">Config Code</div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[#4B5563] font-medium">Heating Type:</span>
              <span className="text-[#2D2D2D] font-semibold">{config?.heatingType}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#4B5563] font-medium">Cooling Type:</span>
              <span className="text-[#2D2D2D] font-semibold">{config?.coolingType}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#4B5563] font-medium">Emergency Heating:</span>
              <span className="text-[#2D2D2D] font-semibold">{config?.emergencyHeat}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#4B5563] font-medium">Reversing Valve:</span>
              <span className="text-[#2D2D2D] font-semibold">{config?.reversingValve}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#BAE5D4] rounded-lg p-4 mb-8 text-center">
          <p className="text-[#2D2D2D]">
            💡 Remember this configuration code - you'll need it during the final setup in your Mysa app.
          </p>
        </div>

        <div className="space-y-4">
          <InstallButton title="Continue to Physical Installation" onPress={handleContinue} className="w-full" />

          <InstallButton
            title="Something doesn't look right?"
            onPress={handleGoBack}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

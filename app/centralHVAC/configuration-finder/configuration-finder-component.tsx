"use client"

import type React from "react"
import { useState } from "react"

interface Capabilities {
  cooling: boolean
  heating: boolean
  emergencyHeat: boolean
  auxiliaryHeat: boolean
  stages: {
    heat: number
    cool: number
  }
}

interface ConfigurationFinderProps {
  onConfigurationFound: (capabilities: Capabilities) => void
}

const ConfigurationFinder: React.FC<ConfigurationFinderProps> = ({ onConfigurationFound }) => {
  const [selectedWires, setSelectedWires] = useState<string[]>([])
  const [systemType, setSystemType] = useState<"furnace" | "heat-pump">("furnace")

  const wires = ["R", "G", "Y", "W", "C", "W2", "Y2"]

  const handleWireChange = (wire: string) => {
    setSelectedWires((prevSelectedWires) => {
      if (prevSelectedWires.includes(wire)) {
        return prevSelectedWires.filter((w) => w !== wire)
      } else {
        return [...prevSelectedWires, wire]
      }
    })
  }

  const getWireDescription = (wire: string): string => {
    switch (wire) {
      case "R":
        return "24V power"
      case "G":
        return "Fan"
      case "Y":
        return "Cooling"
      case "W":
        return "Heating"
      case "C":
        return "Common wire (required for some smart thermostats)"
      case "W2":
        if (systemType === "heat-pump") {
          return "Emergency/Auxiliary heat (backup heat source)"
        } else {
          return "Second stage heat / Auxiliary heat"
        }
      case "Y2":
        return "Second stage cooling"
      default:
        return ""
    }
  }

  const detectSystemType = () => {
    const capabilities: Capabilities = {
      cooling: selectedWires.includes("Y"),
      heating: selectedWires.includes("W"),
      emergencyHeat: false,
      auxiliaryHeat: false,
      stages: {
        heat: 1,
        cool: 1,
      },
    }

    if (systemType === "furnace") {
      if (selectedWires.includes("W2")) {
        capabilities.stages.heat = 2
      }
      if (selectedWires.includes("Y2")) {
        capabilities.stages.cool = 2
      }
    } else if (systemType === "heat-pump") {
      // For heat pumps, W2 without Y2 indicates emergency/auxiliary heat
      if (selectedWires.includes("W2") && !selectedWires.includes("Y2")) {
        capabilities.emergencyHeat = true
        capabilities.auxiliaryHeat = true
      }
      // W2 with Y2 would be staged heating (less common in heat pumps)
      else if (selectedWires.includes("W2") && selectedWires.includes("Y2")) {
        capabilities.stages.heat = 2
        capabilities.stages.cool = 2
      }
    }

    onConfigurationFound(capabilities)
  }

  return (
    <div>
      <h2>HVAC Configuration Finder</h2>
      <div>
        <label>System Type:</label>
        <select value={systemType} onChange={(e) => setSystemType(e.target.value as "furnace" | "heat-pump")}>
          <option value="furnace">Furnace</option>
          <option value="heat-pump">Heat Pump</option>
        </select>
      </div>
      <div>
        <h3>Select Wires:</h3>
        {wires.map((wire) => (
          <div key={wire}>
            <label>
              <input
                type="checkbox"
                value={wire}
                checked={selectedWires.includes(wire)}
                onChange={() => handleWireChange(wire)}
              />
              {wire} - {getWireDescription(wire)}
            </label>
          </div>
        ))}
      </div>
      <button onClick={detectSystemType}>Detect Configuration</button>
    </div>
  )
}

export default ConfigurationFinder

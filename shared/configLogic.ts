import type { ConfigInput, ConfigOutput } from "./types"

interface WireAnalysis {
  hasW1: boolean
  hasW2: boolean
  hasY1: boolean
  hasY2: boolean
  hasG: boolean
  hasO: boolean
  hasB: boolean
  hasAuxHeat: boolean
  heatingStages: number
  coolingStages: number
  fanControl: "hvac" | "thermostat"
  reversingValve: "cool" | "heat" | "none"
}

function analyzeWires(input: ConfigInput): WireAnalysis {
  const wires = input.wires || []

  // Normalize wire names for easier checking
  const normalizedWires = wires.map((w) => w.toUpperCase().replace(/\s/g, ""))

  const hasW1 = normalizedWires.some((w) => w.includes("W1") || w === "W")
  const hasW2 = normalizedWires.some((w) => w.includes("W2"))
  const hasY1 = normalizedWires.some((w) => w.includes("Y1") || w === "Y")
  const hasY2 = normalizedWires.some((w) => w.includes("Y2"))
  const hasG = normalizedWires.some((w) => w.includes("G1") || w === "G")
  const hasO = normalizedWires.some((w) => w === "O")
  const hasB = normalizedWires.some((w) => w === "B")

  // Determine heating and cooling stages
  const heatingStages = hasW2 ? 2 : hasW1 ? 1 : 0
  const coolingStages = hasY2 ? 2 : hasY1 ? 1 : 0

  // For heat pumps, auxiliary heat is determined by W1/W2 presence
  const hasAuxHeat = input.heatPump && (hasW1 || hasW2)

  // Fan control determination:
  // HVAC fan control: When heating is active (W1/W2), G is NOT active
  // Thermostat fan control: When heating is active (W1/W2), G IS active
  // For heat pumps with aux heat, we assume thermostat fan control
  // For conventional systems, we use a heuristic based on system complexity
  let fanControl: "hvac" | "thermostat" = "hvac"

  if (input.heatPump && hasAuxHeat) {
    fanControl = "thermostat"
  } else if (!input.heatPump && hasG && (heatingStages >= 2 || coolingStages >= 2)) {
    // Multi-stage conventional systems often use thermostat fan control
    fanControl = "thermostat"
  }

  // Determine reversing valve operation for heat pumps
  let reversingValve: "cool" | "heat" | "none" = "none"
  if (input.heatPump) {
    if (hasO) {
      reversingValve = "cool" // O terminal energized on cooling
    } else if (hasB) {
      reversingValve = "heat" // B terminal energized on heating
    } else {
      reversingValve = "cool" // Default assumption
    }
  }

  return {
    hasW1,
    hasW2,
    hasY1,
    hasY2,
    hasG,
    hasO,
    hasB,
    hasAuxHeat,
    heatingStages,
    coolingStages,
    fanControl,
    reversingValve,
  }
}

function getConfigurationCode(analysis: WireAnalysis, isHeatPump: boolean, isFanCoil: boolean): ConfigOutput {
  // Fan Coil Unit
  if (isFanCoil) {
    return {
      configCode: "45B",
      heatingType: "Fan Coil Unit",
      coolingType: "Fan Coil Unit",
      emergencyHeat: "None",
      reversingValve: "None",
    }
  }

  // Heat Pump Systems
  if (isHeatPump) {
    const { heatingStages, coolingStages, hasAuxHeat, fanControl, reversingValve } = analysis

    // 1H/1C systems
    if (heatingStages <= 1 && coolingStages <= 1) {
      if (!hasAuxHeat) {
        if (reversingValve === "cool") {
          return {
            configCode: "31M",
            heatingType: "Heat Pump",
            coolingType: "Single Stage",
            emergencyHeat: "None",
            reversingValve: "O Terminal (Cool)",
          }
        } else {
          return {
            configCode: "31I",
            heatingType: "Heat Pump",
            coolingType: "Single Stage",
            emergencyHeat: "None",
            reversingValve: "B Terminal (Heat)",
          }
        }
      } else {
        // With aux heat, use thermostat fan control codes
        if (reversingValve === "cool") {
          return {
            configCode: fanControl === "thermostat" ? "31P" : "31O",
            heatingType: "Heat Pump with Auxiliary",
            coolingType: "Single Stage",
            emergencyHeat: "Electric",
            reversingValve: "O Terminal (Cool)",
          }
        } else {
          return {
            configCode: fanControl === "thermostat" ? "31L" : "31K",
            heatingType: "Heat Pump with Auxiliary",
            coolingType: "Single Stage",
            emergencyHeat: "Electric",
            reversingValve: "B Terminal (Heat)",
          }
        }
      }
    }

    // 2H/2C systems
    if (heatingStages >= 2 && coolingStages >= 2) {
      if (!hasAuxHeat) {
        if (reversingValve === "cool") {
          return {
            configCode: "86M",
            heatingType: "Two Stage Heat Pump",
            coolingType: "Two Stage",
            emergencyHeat: "None",
            reversingValve: "O Terminal (Cool)",
          }
        } else {
          return {
            configCode: "86I",
            heatingType: "Two Stage Heat Pump",
            coolingType: "Two Stage",
            emergencyHeat: "None",
            reversingValve: "B Terminal (Heat)",
          }
        }
      } else {
        if (reversingValve === "cool") {
          return {
            configCode: "86P",
            heatingType: "Two Stage Heat Pump with Auxiliary",
            coolingType: "Two Stage",
            emergencyHeat: "Electric",
            reversingValve: "O Terminal (Cool)",
          }
        } else {
          return {
            configCode: "86L",
            heatingType: "Two Stage Heat Pump with Auxiliary",
            coolingType: "Two Stage",
            emergencyHeat: "Electric",
            reversingValve: "B Terminal (Heat)",
          }
        }
      }
    }
  }

  // Conventional HVAC Systems
  const { heatingStages, coolingStages, fanControl } = analysis

  // 1heat/1cool
  if (heatingStages <= 1 && coolingStages <= 1) {
    return {
      configCode: fanControl === "thermostat" ? "11B" : "11A",
      heatingType: "Single Stage",
      coolingType: "Single Stage",
      emergencyHeat: "None",
      reversingValve: "None",
    }
  }

  // 2heat/1cool
  if (heatingStages >= 2 && coolingStages <= 1) {
    return {
      configCode: fanControl === "thermostat" ? "61B" : "61A",
      heatingType: "Two Stage",
      coolingType: "Single Stage",
      emergencyHeat: "None",
      reversingValve: "None",
    }
  }

  // 2heat/2cool
  if (heatingStages >= 2 && coolingStages >= 2) {
    return {
      configCode: fanControl === "thermostat" ? "66B" : "66A",
      heatingType: "Two Stage",
      coolingType: "Two Stage",
      emergencyHeat: "None",
      reversingValve: "None",
    }
  }

  // Default fallback
  return {
    configCode: "11A",
    heatingType: "Single Stage",
    coolingType: "Single Stage",
    emergencyHeat: "None",
    reversingValve: "None",
  }
}

export function computeConfig(input: ConfigInput): ConfigOutput {
  const analysis = analyzeWires(input)

  // Check if it's a fan coil unit based on system type
  const isFanCoil = input.systemType === "fan-coil"

  return getConfigurationCode(analysis, input.heatPump || false, isFanCoil)
}

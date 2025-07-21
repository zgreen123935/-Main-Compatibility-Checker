"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, CheckCircle, Copy, RotateCcw, Info, AlertTriangle, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ConfigurationFinder() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showSupportContact, setShowSupportContact] = useState(false)
  const [showHeatPumpValidation, setShowHeatPumpValidation] = useState(false)
  const [formData, setFormData] = useState({
    systemType: "",
    wiring: {
      R: false,
      C: false,
      Y: false,
      Y2: false,
      W: false,
      W2: false,
      G: false,
      O: false,
      B: false,
      E: false, // Emergency heat
    },
    fanCoilType: "", // For FCU systems
    wireNotShown: false,
  })
  const [configCode, setConfigCode] = useState("")
  const [alternativeCode, setAlternativeCode] = useState("")
  const [configDetails, setConfigDetails] = useState<any>(null)
  const [alternativeDetails, setAlternativeDetails] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [showAlternative, setShowAlternative] = useState(false)
  const [detectedCapabilities, setDetectedCapabilities] = useState({
    heating: false,
    cooling: false,
    heatPump: false,
    emergencyHeat: false,
    fanControl: false,
    stages: { heat: 0, cool: 0 },
  })
  const [detectedSystemType, setDetectedSystemType] = useState("")

  const systemTypes = [
    { id: "forced-air-gas", label: "Forced Air with Gas/Oil Heat", description: "Traditional furnace with ductwork" },
    {
      id: "forced-air-electric",
      label: "Forced Air with Electric Heat",
      description: "Electric furnace with ductwork",
    },
    { id: "heat-pump", label: "Heat Pump System", description: "Heat pump for heating and cooling" },
    { id: "hydronic", label: "Hydronic/Radiant System", description: "Boiler or radiant heating system" },
    { id: "fan-coil", label: "Fan Coil Unit (FCU)", description: "Individual room units with fan speed control" },
    { id: "cooling-only", label: "Cooling Only", description: "Air conditioning without heating" },
    { id: "not-sure", label: "I'm Not Sure", description: "Let us determine your system type based on your wiring" },
  ]

  const fanCoilOptions = [
    { id: "2-speed", label: "2 Fan Speeds", description: "Low, High, and Auto" },
    { id: "3-speed", label: "3 Fan Speeds", description: "Low, Medium, High, and Auto" },
  ]

  const baseWireDescriptions = {
    R: "Power (24V) - Usually red wire - Required for all systems",
    C: "Common - Usually blue or black wire - Recommended for reliable power",
    Y: "1st Stage Cooling - Usually yellow wire",
    Y2: "2nd Stage Cooling - Usually light blue wire",
    W: "1st Stage Heating - Usually white wire",
    W2: "2nd Stage Heating / Auxiliary Heat - Usually brown or dark blue wire - May be labeled as Aux Heat on some systems",
    G: "Fan Control - Usually green wire",
    E: "Emergency/Auxiliary Heat - Usually brown or yellow wire",
  }

  const heatPumpWireDescriptions = {
    O: "Heat Pump Reversing Valve (O) - Usually orange wire",
    B: "Heat Pump Reversing Valve (B) - Usually dark blue wire",
  }

  // Get wire descriptions based on system type
  const getWireDescriptions = () => {
    if (
      formData.systemType === "heat-pump" ||
      formData.systemType === "not-sure" ||
      detectedSystemType === "heat-pump"
    ) {
      return { ...baseWireDescriptions, ...heatPumpWireDescriptions }
    }
    return baseWireDescriptions
  }

  // Intelligent system type detection based on wiring
  const detectSystemType = (wiring: typeof formData.wiring) => {
    const hasHeating = wiring.W || wiring.W2
    const hasCooling = wiring.Y || wiring.Y2
    const hasReversing = wiring.O || wiring.B
    const hasEmergency = wiring.E

    // Heat pump detection
    if (hasReversing) {
      return "heat-pump"
    }

    // Cooling only
    if (hasCooling && !hasHeating) {
      return "cooling-only"
    }

    // If has both heating and cooling, likely forced air
    if (hasHeating && hasCooling) {
      // Could be gas/oil or electric - default to gas/oil as more common
      return "forced-air-gas"
    }

    // Heating only
    if (hasHeating && !hasCooling) {
      return "forced-air-gas"
    }

    return ""
  }

  // Get friendly system type name
  const getSystemTypeName = (type: string) => {
    const systemType = systemTypes.find((s) => s.id === type)
    return systemType ? systemType.label : type
  }

  // Configuration codes database
  const configCodes = {
    "01A": { type: "Forced Air Cooling", description: "No heat, 1 stage cooling, no fan control" },
    "01B": { type: "Forced Air Cooling", description: "No heat, 1 stage cooling, with fan control" },
    "04B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: Cooling only with low, high and auto fan speeds",
    },
    "05B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: Cooling only, with low, medium, high and auto fan speeds",
    },
    "06A": { type: "Forced Air Cooling", description: "No heat, 2 stage cooling, no fan control" },
    "06B": { type: "Forced Air Cooling", description: "No heat, 2 stage cooling, with fan control" },
    "10A": { type: "Forced Air Heating with oil/gas", description: "1 stage heat, no cooling, no fan control" },
    "10B": { type: "Forced Air Heating with oil/gas", description: "1 stage heat, no cooling, with fan control" },
    "10C": {
      type: "Forced Air Heating with oil/gas",
      description: "1 stage heat, no cooling, no fan control, with emergency heat",
    },
    "10D": {
      type: "Forced Air Heating with oil/gas",
      description: "1 stage heat, no cooling, with fan control, with emergency heat",
    },
    "11A": { type: "Forced Air Cooling + oil/gas heat", description: "1 stage heat, 1 stage cool, no fan control" },
    "11B": { type: "Forced Air Cooling + oil/gas heat", description: "1 stage heat, 1 stage cool, with fan control" },
    "11C": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "1 stage heat, 1 stage cool, no fan control, with emergency heat",
    },
    "11D": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "1 stage heat, 1 stage cool, with fan control, with emergency heat",
    },
    "12B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, no cooling, fan speed control low, high and off",
    },
    "13B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, no cooling, fan speed control low, medium, high and off",
    },
    "14B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, 1 stage cooling, fan speed control low, high and off",
    },
    "15B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, 1 stage cooling, fan speed control low, medium, high and off",
    },
    "16A": { type: "Forced Air Cooling + oil/gas heat", description: "1 stage heat, 2 stage cool, no fan control" },
    "16B": { type: "Forced Air Cooling + oil/gas heat", description: "1 stage heat, 2 stage cool, with fan control" },
    "16C": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "1 stage heat, 2 stage cool, no fan control, with emergency heat",
    },
    "16D": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "1 stage heat, 2 stage cool, with fan control, with emergency heat",
    },
    "20A": { type: "Forced Air electric strip heat", description: "1 stage heat, no cooling, no fan control" },
    "20B": { type: "Forced Air electric strip heat", description: "1 stage heat, no cooling, with fan control" },
    "20C": {
      type: "Forced Air electric strip heat",
      description: "1 stage heat, no cooling, no fan control, with emergency heat",
    },
    "20D": {
      type: "Forced Air electric strip heat",
      description: "1 stage heat, no cooling, with fan control, with emergency heat",
    },
    "21A": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 1 stage cool, no fan control",
    },
    "21B": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 1 stage cool, with fan control",
    },
    "21C": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 1 stage cool, no fan control, with emergency heat",
    },
    "21D": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 1 stage cool, with fan control, with emergency heat",
    },
    "22B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, no cooling, fan speed control low, high and off",
    },
    "23B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, no cooling, fan speed control low, medium, high and off",
    },
    "24B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, 1 stage cooling, fan speed control low, high and off",
    },
    "25B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, 1 stage cooling, fan speed control low, medium, high and off",
    },
    "26A": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 2 stage cool, no fan control",
    },
    "26B": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 2 stage cool, with fan control",
    },
    "26C": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 2 stage cool, no fan control, with emergency heat",
    },
    "26D": {
      type: "Forced Air Cooling + electric strip heat",
      description: "1 stage heat, 2 stage cool, with fan control, with emergency heat",
    },
    "31I": {
      type: "Forced Air Heat pump system",
      description: "1 stage heat, 1 stage cool, no fan control, energize the reversing valve calls for heat",
    },
    "31J": {
      type: "Forced Air Heat pump system",
      description: "1 stage heat, 1 stage cool, with fan control, energize the reversing valve calls for heat",
    },
    "31K": {
      type: "Forced Air Heat pump system",
      description:
        "1 stage heat, 1 stage cool, no fan control, with emergency heat, energize the reversing valve calls for heat",
    },
    "31L": {
      type: "Forced Air Heat pump system",
      description:
        "1 stage heat, 1 stage cool, with fan control, with emergency heat, energize the reversing valve calls for heat",
    },
    "31M": {
      type: "Forced Air Heat pump system",
      description: "1 stage heat, 1 stage cool, no fan control, energize the reversing valve calls for cool",
    },
    "31N": {
      type: "Forced Air Heat pump system",
      description: "1 stage heat, 1 stage cool, with fan control, energize the reversing valve calls for cool",
    },
    "31O": {
      type: "Forced Air Heat pump system",
      description:
        "1 stage heat, 1 stage cool, no fan control, with emergency heat, energize the reversing valve calls for cool",
    },
    "31P": {
      type: "Forced Air Heat pump system",
      description:
        "1 stage heat, 1 stage cool, with fan control, with emergency heat, energize the reversing valve calls for cool",
    },
    "32B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, no cooling, fan speed control low, high and off",
    },
    "33B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, no cooling, fan speed control low, medium, high and off",
    },
    "34B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, 1 stage cooling, fan speed control low, high and off",
    },
    "34J": {
      type: "Heat Pump with two fan speeds",
      description:
        "Heat Pump with 1 stage heat, 1 stage cool, fan speed control low, high and off, energize the reversing valve calls for heat",
    },
    "34N": {
      type: "Heat Pump with two fan speeds",
      description:
        "Heat Pump with 1 stage heat, 1 stage cool, fan speed control low, high and off, energize the reversing valve calls for cool",
    },
    "35B": {
      type: "Fan Coil Unit (FCU)",
      description: "Fan Coil Mode: 1 stage heat, 1 stage cooling, fan speed control low, medium, high and off",
    },
    "35J": {
      type: "Heat Pump with three fan speeds",
      description:
        "Heat Pump with 1 stage heat, 1 stage cool, fan speed control low, medium, high and off, energize the reversing valve calls for heat",
    },
    "35N": {
      type: "Heat Pump with three fan speeds",
      description:
        "Heat Pump with 1 stage heat, 1 stage cool, fan speed control low, medium, high and off, energize the reversing valve calls for cool",
    },
    "40A": { type: "Hydronic Heating system", description: "1 stage heat, no cooling, no fan control" },
    "40B": { type: "Hydronic Heating system", description: "1 stage heat, no cooling, with fan control" },
    "40C": {
      type: "Hydronic Heating system",
      description: "1 stage heat, no cooling, no fan control, with emergency heat",
    },
    "40D": {
      type: "Hydronic Heating system",
      description: "1 stage heat, no cooling, with fan control, with emergency heat",
    },
    "41A": { type: "Hydronic Heating system", description: "1 stage heat, 1 stage cool, no fan control" },
    "41B": { type: "Hydronic Heating system", description: "1 stage heat, 1 stage cool, with fan control" },
    "41C": {
      type: "Hydronic Heating system",
      description: "1 stage heat, 1 stage cool, no fan control, with emergency heat",
    },
    "41D": {
      type: "Hydronic Heating system",
      description: "1 stage heat, 1 stage cool, with fan control, with emergency heat",
    },
    "42B": {
      type: "Hydronic Heating system + fan speed control",
      description: "1 stage heat, no cooling, fan speed control low, high and off",
    },
    "43B": {
      type: "Hydronic Heating system + fan speed control",
      description: "1 stage heat, no cooling, fan speed control low, medium, high and off",
    },
    "44B": {
      type: "Hydronic Heating system + fan speed control",
      description: "1 stage heat, 1 stage cool, fan speed control low, high and off",
    },
    "45B": {
      type: "Hydronic Heating system + fan speed control",
      description: "1 stage heat, 1 stage cool, fan speed control low, medium, high and off",
    },
    "46A": { type: "Hydronic Heating system", description: "1 stage heat, 2 stage cool, no fan control" },
    "46B": { type: "Hydronic Heating system", description: "1 stage heat, 2 stage cool, with fan control" },
    "46C": {
      type: "Hydronic Heating system",
      description: "1 stage heat, 2 stage cool, no fan control, with emergency heat",
    },
    "46D": {
      type: "Hydronic Heating system",
      description: "1 stage heat, 2 stage cool, with fan control, with emergency heat",
    },
    "60A": { type: "Forced Air Heating with oil/gas", description: "2 stage heat, no cooling, no fan control" },
    "60B": { type: "Forced Air Heating with oil/gas", description: "2 stage heat, no cooling, with fan control" },
    "60C": {
      type: "Forced Air Heating with oil/gas",
      description: "2 stage heat, no cooling, no fan control, with emergency heat",
    },
    "60D": {
      type: "Forced Air Heating with oil/gas",
      description: "2 stage heat, no cooling, with fan control, with emergency heat",
    },
    "61A": { type: "Forced Air Cooling + oil/gas heat", description: "2 stage heat, 1 stage cool, no fan control" },
    "61B": { type: "Forced Air Cooling + oil/gas heat", description: "2 stage heat, 1 stage cool, with fan control" },
    "61C": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "2 stage heat, 1 stage cool no fan control, with emergency heat",
    },
    "61D": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "2 stage heat, 1 stage cool, with fan control, with emergency heat",
    },
    "66A": { type: "Forced Air Cooling + oil/gas heat", description: "2 stage heat, 2 stage cool, no fan control" },
    "66B": { type: "Forced Air Cooling + oil/gas heat", description: "2 stage heat, 2 stage cool, with fan control" },
    "66C": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "2 stage heat, 2 stage cool no fan control, with emergency heat",
    },
    "66D": {
      type: "Forced Air Cooling + oil/gas heat",
      description: "2 stage heat, 2 stage cool, with fan control, with emergency heat",
    },
    "70A": { type: "Forced Air electric strip heat", description: "2 stage heat, no cooling, no fan control" },
    "70B": { type: "Forced Air electric strip heat", description: "2 stage heat, no cooling, with fan control" },
    "70C": {
      type: "Forced Air electric strip heat",
      description: "2 stage heat, no cooling, no fan control, with emergency heat",
    },
    "70D": {
      type: "Forced Air electric strip heat",
      description: "2 stage heat, no cooling, with fan control, with emergency heat",
    },
    "71A": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 1 stage cool, no fan control",
    },
    "71B": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 1 stage cool, with fan control",
    },
    "71C": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 1 stage cool, no fan control, with emergency heat",
    },
    "71D": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 1 stage cool, with fan control, with emergency heat",
    },
    "76A": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 2 stage cool, no fan control",
    },
    "76B": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 2 stage cool, with fan control",
    },
    "76C": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 2 stage cool, no fan control, with emergency heat",
    },
    "76D": {
      type: "Forced Air Cooling + electric strip heat",
      description: "2 stage heat, 2 stage cool, with fan control, with emergency heat",
    },
    "86I": {
      type: "Forced Air Heat pump system",
      description: "2 stage heat, 2 stage cool, no fan control, energize the reversing valve calls for heat",
    },
    "86J": {
      type: "Forced Air Heat pump system",
      description: "2 stage heat, 2 stage cool, with fan control, energize the reversing valve calls for heat",
    },
    "86K": {
      type: "Forced Air Heat pump system",
      description:
        "2 stage heat, 2 stage cool, no fan control, with emergency heat, energize the reversing valve calls for heat",
    },
    "86L": {
      type: "Forced Air Heat pump system",
      description:
        "2 stage heat, 2 stage cool, with fan control, with emergency heat, energize the reversing valve calls for heat",
    },
    "86M": {
      type: "Forced Air Heat pump system",
      description: "2 stage heat, 2 stage cool, no fan control, energize the reversing valve calls for cool",
    },
    "86N": {
      type: "Forced Air Heat pump system",
      description: "2 stage heat, 2 stage cool, with fan control, energize the reversing valve calls for cool",
    },
    "86O": {
      type: "Forced Air Heat pump system",
      description:
        "2 stage heat, 2 stage cool, no fan control, with emergency heat, energize the reversing valve calls for cool",
    },
    "86P": {
      type: "Forced Air Heat pump system",
      description:
        "2 stage heat, 2 stage cool, with fan control, with emergency heat, energize the reversing valve calls for cool",
    },
    "90A": { type: "Hydronic Heating system", description: "2 stage heat, no cooling, no fan control" },
    "90B": { type: "Hydronic Heating system", description: "2 stage heat, no cooling, with fan control" },
    "90C": {
      type: "Hydronic Heating system",
      description: "2 stage heat, no cooling, no fan control, with emergency heat",
    },
    "90D": {
      type: "Hydronic Heating system",
      description: "2 stage heat, no cooling, with fan control, with emergency heat",
    },
    "91A": { type: "Hydronic Heating system", description: "2 stage heat, 1 stage cool, no fan control" },
    "91B": { type: "Hydronic Heating system", description: "2 stage heat, 1 stage cool, with fan control" },
    "91C": {
      type: "Hydronic Heating system",
      description: "2 stage heat, 1 stage cool, no fan control, with emergency heat",
    },
    "91D": {
      type: "Hydronic Heating system",
      description: "2 stage heat, 1 stage cool, with fan control, with emergency heat",
    },
    "96A": { type: "Hydronic Heating system", description: "2 stage heat, 2 stage cool, no fan control" },
    "96B": { type: "Hydronic Heating system", description: "2 stage heat, 2 stage cool, with fan control" },
    "96C": {
      type: "Hydronic Heating system",
      description: "2 stage heat, 2 stage cool, no fan control, with emergency heat",
    },
    "96D": {
      type: "Hydronic Heating system",
      description: "2 stage heat, 2 stage cool, with fan control, with emergency heat",
    },
  }

  // Auto-detect capabilities based on wiring
  useEffect(() => {
    const capabilities = {
      heating: formData.wiring.W || formData.wiring.W2,
      cooling: formData.wiring.Y || formData.wiring.Y2,
      heatPump: formData.wiring.O || formData.wiring.B,
      emergencyHeat: formData.wiring.E || (detectedCapabilities.heatPump && formData.wiring.W2 && !formData.wiring.Y2),
      fanControl: formData.wiring.G,
      stages: {
        heat: (formData.wiring.W ? 1 : 0) + (formData.wiring.W2 ? 1 : 0),
        cool: (formData.wiring.Y ? 1 : 0) + (formData.wiring.Y2 ? 1 : 0),
      },
    }
    setDetectedCapabilities(capabilities)

    // Auto-detect system type if "not-sure" was selected
    if (formData.systemType === "not-sure") {
      const detected = detectSystemType(formData.wiring)
      setDetectedSystemType(detected)
    }
  }, [formData.wiring, formData.systemType, detectedCapabilities.heatPump])

  // Reset O and B wires when system type changes away from heat pump
  useEffect(() => {
    if (formData.systemType !== "heat-pump" && detectedSystemType !== "heat-pump") {
      setFormData((prev) => ({
        ...prev,
        wiring: {
          ...prev.wiring,
          O: false,
          B: false,
        },
      }))
    }
  }, [formData.systemType, detectedSystemType])

  const canGenerateCode = () => {
    const hasSystemType = formData.systemType !== "" && formData.systemType !== "not-sure"
    const hasDetectedType = formData.systemType === "not-sure" && detectedSystemType !== ""
    const hasRequiredWires = formData.wiring.R
    const hasSystemWires = formData.wiring.Y || formData.wiring.Y2 || formData.wiring.W || formData.wiring.W2
    const effectiveSystemType = formData.systemType === "not-sure" ? detectedSystemType : formData.systemType
    const hasFanCoilType = effectiveSystemType !== "fan-coil" || formData.fanCoilType !== ""
    const noWireNotShown = !formData.wireNotShown

    return (hasSystemType || hasDetectedType) && hasRequiredWires && hasSystemWires && hasFanCoilType && noWireNotShown
  }

  const generateConfigCode = (useAlternative = false) => {
    const effectiveSystemType = formData.systemType === "not-sure" ? detectedSystemType : formData.systemType
    const { wiring, fanCoilType } = formData
    const { heating, cooling, heatPump, emergencyHeat, fanControl, stages } = detectedCapabilities

    // Auto-detect reversing valve from wiring (with alternative option)
    let reversingValveType = ""
    if (heatPump) {
      if (useAlternative) {
        // Use opposite of what's wired
        reversingValveType = wiring.O ? "B" : wiring.B ? "O" : "O" // Default to O if neither
      } else {
        // Use what's actually wired
        reversingValveType = wiring.O ? "O" : wiring.B ? "B" : "O" // Default to O if neither
      }
    }

    // Determine base system type
    let baseCode = ""

    if (effectiveSystemType === "cooling-only") {
      if (stages.cool === 1) baseCode = "01"
      else if (stages.cool === 2) baseCode = "06"
    } else if (effectiveSystemType === "forced-air-gas") {
      if (stages.heat === 1 && stages.cool === 0) baseCode = "10"
      else if (stages.heat === 1 && stages.cool === 1) baseCode = "11"
      else if (stages.heat === 1 && stages.cool === 2) baseCode = "16"
      else if (stages.heat === 2 && stages.cool === 0) baseCode = "60"
      else if (stages.heat === 2 && stages.cool === 1) baseCode = "61"
      else if (stages.heat === 2 && stages.cool === 2) baseCode = "66"
    } else if (effectiveSystemType === "forced-air-electric") {
      if (stages.heat === 1 && stages.cool === 0) baseCode = "20"
      else if (stages.heat === 1 && stages.cool === 1) baseCode = "21"
      else if (stages.heat === 1 && stages.cool === 2) baseCode = "26"
      else if (stages.heat === 2 && stages.cool === 0) baseCode = "70"
      else if (stages.heat === 2 && stages.cool === 1) baseCode = "71"
      else if (stages.heat === 2 && stages.cool === 2) baseCode = "76"
    } else if (effectiveSystemType === "heat-pump") {
      if (stages.heat === 1 && stages.cool === 1) baseCode = "31"
      else if (stages.heat === 2 && stages.cool === 2) baseCode = "86"
      else if (fanCoilType === "2-speed") baseCode = "34"
      else if (fanCoilType === "3-speed") baseCode = "35"
    } else if (effectiveSystemType === "hydronic") {
      if (stages.heat === 1 && stages.cool === 0) baseCode = "40"
      else if (stages.heat === 1 && stages.cool === 1) baseCode = "41"
      else if (stages.heat === 1 && stages.cool === 2) baseCode = "46"
      else if (stages.heat === 2 && stages.cool === 0) baseCode = "90"
      else if (stages.heat === 2 && stages.cool === 1) baseCode = "91"
      else if (stages.heat === 2 && stages.cool === 2) baseCode = "96"

      // Special fan speed control codes for hydronic
      if (fanControl && stages.cool === 0) {
        if (fanCoilType === "2-speed") baseCode = stages.heat === 1 ? "42" : "92"
        else if (fanCoilType === "3-speed") baseCode = stages.heat === 1 ? "43" : "93"
      } else if (fanControl && stages.cool === 1) {
        if (fanCoilType === "2-speed") baseCode = stages.heat === 1 ? "44" : "94"
        else if (fanCoilType === "3-speed") baseCode = stages.heat === 1 ? "45" : "95"
      }
    } else if (effectiveSystemType === "fan-coil") {
      if (stages.heat === 0 && stages.cool === 1) {
        baseCode = fanCoilType === "2-speed" ? "04" : "05"
      } else if (stages.heat === 1 && stages.cool === 0) {
        if (effectiveSystemType.includes("electric")) {
          baseCode = fanCoilType === "2-speed" ? "22" : "23"
        } else if (effectiveSystemType.includes("hydronic")) {
          baseCode = fanCoilType === "2-speed" ? "32" : "33"
        } else {
          baseCode = fanCoilType === "2-speed" ? "12" : "13"
        }
      } else if (stages.heat === 1 && stages.cool === 1) {
        if (effectiveSystemType.includes("electric")) {
          baseCode = fanCoilType === "2-speed" ? "24" : "25"
        } else if (effectiveSystemType.includes("hydronic")) {
          baseCode = fanCoilType === "2-speed" ? "34" : "35"
        } else {
          baseCode = fanCoilType === "2-speed" ? "14" : "15"
        }
      }
    }

    // Determine suffix letter
    let suffix = ""

    if (heatPump) {
      // Heat pump specific suffixes - use detected or alternative reversing valve
      if (reversingValveType === "B") {
        // B wire = energize for heating
        if (!fanControl && !emergencyHeat) suffix = "I"
        else if (fanControl && !emergencyHeat) suffix = "J"
        else if (!fanControl && emergencyHeat) suffix = "K"
        else if (fanControl && emergencyHeat) suffix = "L"
      } else {
        // O wire or default = energize for cooling
        if (!fanControl && !emergencyHeat) suffix = "M"
        else if (fanControl && !emergencyHeat) suffix = "N"
        else if (!fanControl && emergencyHeat) suffix = "O"
        else if (fanControl && emergencyHeat) suffix = "P"
      }
    } else if (
      effectiveSystemType === "fan-coil" ||
      baseCode.includes("2") ||
      baseCode.includes("3") ||
      baseCode.includes("4") ||
      baseCode.includes("5")
    ) {
      // Fan coil units always use B suffix
      suffix = "B"
    } else {
      // Standard forced air and hydronic systems
      if (!fanControl && !emergencyHeat) suffix = "A"
      else if (fanControl && !emergencyHeat) suffix = "B"
      else if (!fanControl && emergencyHeat) suffix = "C"
      else if (fanControl && emergencyHeat) suffix = "D"
    }

    return baseCode + suffix
  }

  const handleNext = () => {
    // Check for heat pump validation before proceeding
    if (currentStep === 2 && formData.systemType === "heat-pump" && !formData.wiring.O && !formData.wiring.B) {
      setShowHeatPumpValidation(true)
      return // Don't proceed
    }

    // Hide heat pump validation if it was showing
    setShowHeatPumpValidation(false)

    if (currentStep === 1) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      // Always go to step 3 (results) after step 2
      setCurrentStep(3)
    } else if (currentStep === 3) {
      // Generate configuration codes when completing step 3
      const primaryCode = generateConfigCode(false)
      const altCode = generateConfigCode(true)

      setConfigCode(primaryCode)
      const primaryDetails = configCodes[primaryCode as keyof typeof configCodes]
      setConfigDetails(
        primaryDetails || {
          type: "Unknown Configuration",
          description: "Configuration code not found in database",
        },
      )

      if (detectedCapabilities.heatPump && altCode !== primaryCode) {
        setAlternativeCode(altCode)
        const altDetails = configCodes[altCode as keyof typeof configCodes]
        setAlternativeDetails(
          altDetails || {
            type: "Unknown Configuration",
            description: "Alternative configuration code not found in database",
          },
        )
      } else {
        setAlternativeCode("")
        setAlternativeDetails(null)
      }

      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    setCurrentStep(1)
    setFormData({
      systemType: "",
      wiring: {
        R: false,
        C: false,
        Y: false,
        Y2: false,
        W: false,
        W2: false,
        G: false,
        O: false,
        B: false,
        E: false,
      },
      fanCoilType: "",
      wireNotShown: false,
    })
    setShowResults(false)
    setShowAlternative(false)
    setShowSupportContact(false)
    setShowHeatPumpValidation(false)
    setConfigCode("")
    setAlternativeCode("")
    setConfigDetails(null)
    setAlternativeDetails(null)
    setDetectedSystemType("")
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.systemType !== ""
      case 2:
        if (formData.wireNotShown) {
          return true // Allow proceeding to show support contact
        }
        const hasRequiredWires = formData.wiring.R // R wire is always required
        const hasSystemWires = formData.wiring.Y || formData.wiring.Y2 || formData.wiring.W || formData.wiring.W2

        // Additional validation for heat pump systems
        if (formData.systemType === "heat-pump") {
          const hasReversingValve = formData.wiring.O || formData.wiring.B
          return hasRequiredWires && hasSystemWires && hasReversingValve
        }

        return hasRequiredWires && hasSystemWires
      case 3:
        const effectiveSystemType = formData.systemType === "not-sure" ? detectedSystemType : formData.systemType
        if (effectiveSystemType === "fan-coil") {
          return formData.fanCoilType !== ""
        }
        return true
      default:
        return false
    }
  }

  // Show support contact if wire not shown is selected
  useEffect(() => {
    if (formData.wireNotShown) {
      setShowSupportContact(true)
      setShowResults(false)
    } else {
      setShowSupportContact(false)
    }
  }, [formData.wireNotShown])

  // Auto-generate code when reaching step 3 for non-fan-coil systems
  useEffect(() => {
    if (currentStep === 3 && !showResults) {
      const effectiveSystemType = formData.systemType === "not-sure" ? detectedSystemType : formData.systemType
      if (effectiveSystemType !== "fan-coil" && canGenerateCode()) {
        // Auto-generate for non-fan-coil systems
        const primaryCode = generateConfigCode(false)
        const altCode = generateConfigCode(true)

        setConfigCode(primaryCode)
        const primaryDetails = configCodes[primaryCode as keyof typeof configCodes]
        setConfigDetails(
          primaryDetails || {
            type: "Unknown Configuration",
            description: "Configuration code not found in database",
          },
        )

        if (detectedCapabilities.heatPump && altCode !== primaryCode) {
          setAlternativeCode(altCode)
          const altDetails = configCodes[altCode as keyof typeof configCodes]
          setAlternativeDetails(
            altDetails || {
              type: "Unknown Configuration",
              description: "Alternative configuration code not found in database",
            },
          )
        } else {
          setAlternativeCode("")
          setAlternativeDetails(null)
        }

        setShowResults(true)
      }
    }
  }, [currentStep, formData.systemType, detectedSystemType, showResults])

  return (
    <div className="w-full">
      {showSupportContact ? (
        /* Support Contact Section */
        <div>
          <div className="text-center mb-8">
            <AlertTriangle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">Need Additional Support?</h3>
            <p className="text-lg text-[#6B7280]">
              Our support team can help identify your specific wiring configuration
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader className="bg-orange-50 text-center">
              <CardTitle className="text-xl text-[#2D2D2D]">Contact Mysa Support</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Before contacting support:</strong> Take a clear photo of your current thermostat's wiring
                  connections. This will help our team provide faster assistance.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-[#BAE5D4] hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Phone className="w-8 h-8 text-[#2D2D2D] mx-auto mb-3" />
                    <h4 className="text-md font-medium text-[#2D2D2D] mb-2">Phone Support</h4>
                    <p className="text-[#6B7280] text-sm mb-3">Speak directly with our technical support team</p>
                    <Button className="bg-[#2D2D2D] hover:bg-[#1a1a1a] text-white w-full text-sm">Call Support</Button>
                    <p className="text-xs text-[#6B7280] mt-2">Mon-Fri 9AM-5PM EST</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#BAE5D4] hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <Mail className="w-8 h-8 text-[#2D2D2D] mx-auto mb-3" />
                    <h4 className="text-md font-medium text-[#2D2D2D] mb-2">Email Support</h4>
                    <p className="text-[#6B7280] text-sm mb-3">Send us your wiring photos and system details</p>
                    <Button
                      variant="outline"
                      className="bg-transparent border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white w-full text-sm"
                    >
                      Email Support
                    </Button>
                    <p className="text-xs text-[#6B7280] mt-2">Response within 24 hours</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset} className="bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      ) : !showResults ? (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 mb-4">Step {currentStep} of 3</Badge>
            <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">Find Your Configuration Code</h3>
            <p className="text-lg text-[#6B7280]">
              Answer a few questions to generate your personalized Mysa configuration code
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#6B7280]">Progress</span>
              <span className="text-sm text-[#6B7280]">{currentStep}/3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#BAE5D4] h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentStep / 3) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* System Type Detection Alert */}
          {formData.systemType === "not-sure" && detectedSystemType && currentStep === 2 && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>System Type Detected:</strong> Based on your wiring, we've identified your system as{" "}
                <strong>{getSystemTypeName(detectedSystemType)}</strong>. If this doesn't seem right, you can go back
                and select a different system type.
              </AlertDescription>
            </Alert>
          )}

          {/* Detected Capabilities Alert */}
          {currentStep === 2 && (detectedCapabilities.heating || detectedCapabilities.cooling) && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Auto-detected capabilities:</strong>{" "}
                {detectedCapabilities.heating && `${detectedCapabilities.stages.heat}-stage heating`}
                {detectedCapabilities.heating && detectedCapabilities.cooling && ", "}
                {detectedCapabilities.cooling && `${detectedCapabilities.stages.cool}-stage cooling`}
                {detectedCapabilities.fanControl && ", fan control"}
                {detectedCapabilities.heatPump && ", heat pump"}
                {detectedCapabilities.emergencyHeat && ", emergency heat"}
              </AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <Card className="mb-8">
            <CardContent className="p-6">
              {currentStep === 1 && (
                <div>
                  <h4 className="text-xl font-medium text-[#2D2D2D] mb-4">What type of HVAC system do you have?</h4>
                  <p className="text-[#6B7280] mb-6">
                    Select the type that best describes your heating and cooling system
                  </p>
                  <RadioGroup
                    value={formData.systemType}
                    onValueChange={(value) => setFormData({ ...formData, systemType: value })}
                  >
                    <div className="space-y-3">
                      {systemTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 ${
                            type.id === "not-sure" ? "border-blue-200 bg-blue-50" : ""
                          }`}
                        >
                          <RadioGroupItem value={type.id} id={type.id} />
                          <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                            <div className="font-medium text-[#2D2D2D] text-sm">{type.label}</div>
                            <div className="text-xs text-[#6B7280]">{type.description}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h4 className="text-xl font-medium text-[#2D2D2D] mb-4">
                    Which wires are connected to your current thermostat?
                  </h4>
                  <p className="text-[#6B7280] mb-6">
                    Check the box for each wire that's connected. Look at the terminals on your current thermostat.
                  </p>
                  <div className="space-y-3">
                    {Object.entries(getWireDescriptions()).map(([wire, description]) => (
                      <div key={wire} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={wire}
                          checked={formData.wiring[wire as keyof typeof formData.wiring]}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              wiring: { ...formData.wiring, [wire]: checked },
                            })
                          }
                        />
                        <Label htmlFor={wire} className="flex-1 cursor-pointer">
                          <div className="font-medium text-[#2D2D2D] text-sm">{wire} Wire</div>
                          <div className="text-xs text-[#6B7280]">{description}</div>
                        </Label>
                      </div>
                    ))}

                    {/* C-Wire Warning */}
                    {!formData.wiring.C && (
                      <Alert className="mb-4 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <div className="space-y-2">
                            <p className="text-sm">
                              <strong>C-Wire (Common Wire) Required:</strong> A C-wire is required for all Mysa
                              thermostats to ensure reliable power and proper operation.
                            </p>
                            <div className="text-xs">
                              <p className="font-medium mb-1">If you don't see a C-wire connected:</p>
                              <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>
                                  Check if you have an unused wire in your thermostat bundle that can be used as a
                                  C-wire
                                </li>
                                <li>You will need to install a C-Wire Power Adapter to provide the required power</li>
                              </ul>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* My Wire Is Not Shown Option */}
                    <div className="flex items-start space-x-3 p-3 border-2 border-orange-200 rounded-lg bg-orange-50">
                      <Checkbox
                        id="wireNotShown"
                        checked={formData.wireNotShown}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            wireNotShown: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="wireNotShown" className="flex-1 cursor-pointer">
                        <div className="font-medium text-orange-800 text-sm">My Wire Is Not Shown</div>
                        <div className="text-xs text-orange-700">
                          Select this if you have wires that aren't listed above
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h4 className="text-xl font-medium text-[#2D2D2D] mb-4">Configuration Code</h4>

                  {(formData.systemType === "fan-coil" || detectedSystemType === "fan-coil") && !showResults && (
                    <div className="mb-6">
                      <p className="text-[#6B7280] mb-4">How many fan speeds does your Fan Coil Unit support?</p>
                      <RadioGroup
                        value={formData.fanCoilType}
                        onValueChange={(value) => setFormData({ ...formData, fanCoilType: value })}
                      >
                        <div className="space-y-3">
                          {fanCoilOptions.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50"
                            >
                              <RadioGroupItem value={option.id} id={option.id} />
                              <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                <div className="font-medium text-[#2D2D2D] text-sm">{option.label}</div>
                                <div className="text-xs text-[#6B7280]">{option.description}</div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {((formData.systemType !== "fan-coil" && detectedSystemType !== "fan-coil") || showResults) && (
                    <div className="text-center py-6">
                      <p className="text-[#6B7280] mb-4">
                        Your configuration code is being generated based on your selections.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Heat Pump Validation Alert - only shows when trying to proceed */}
          {showHeatPumpValidation && (
            <Alert className="mb-6 border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Heat Pump Confirmation Required:</strong> You've selected "Heat Pump System" but haven't
                    selected an O or B wire. It's very uncommon for heat pumps to not have one of these reversing valve
                    wires.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        setFormData({ ...formData, systemType: "" })
                        setShowHeatPumpValidation(false)
                        setCurrentStep(1)
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Change System Type
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowHeatPumpValidation(false)
                        handleNext()
                      }}
                      variant="outline"
                      className="bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200"
                    >
                      Confirm This Is a Heat Pump
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1} className="bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-[#2D2D2D] hover:bg-[#1a1a1a] text-white"
            >
              {currentStep === 3 ? "Generate Configuration Code" : "Next"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : (
        /* Results Section */
        <div>
          <div className="text-center mb-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">Configuration Complete!</h3>
            <p className="text-lg text-[#6B7280]">Your Mysa configuration code has been generated</p>
          </div>

          <Card className="mb-8">
            <CardHeader className="bg-[#BAE5D4] text-center">
              <CardTitle className="text-xl text-[#2D2D2D]">Your Configuration Code</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="text-3xl font-mono font-bold text-[#2D2D2D] mb-2">{configCode}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(configCode)}
                  className="bg-transparent"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </div>
              <p className="text-[#6B7280] mb-4">Enter this code in the Mysa app during thermostat setup</p>
            </CardContent>
          </Card>

          {/* Heat Pump Feedback Section */}
          {detectedCapabilities.heatPump && alternativeCode && alternativeCode !== configCode && !showAlternative && (
            <Card className="mb-8 border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-lg text-[#2D2D2D] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Heat Pump Configuration Check
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-[#6B7280] mb-4 text-sm">
                  After installing your Mysa thermostat with the code above, test both heating and cooling modes.
                </p>
                <p className="text-[#6B7280] mb-4 text-sm">
                  <strong>Is your heating and cooling working as expected?</strong>
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    Yes, it's working correctly
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowAlternative(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    No, try alternative configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alternative Configuration */}
          {showAlternative && alternativeCode && (
            <Card className="mb-8 border-blue-200">
              <CardHeader className="bg-blue-50 text-center">
                <CardTitle className="text-xl text-[#2D2D2D]">Alternative Configuration Code</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="text-3xl font-mono font-bold text-[#2D2D2D] mb-2">{alternativeCode}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(alternativeCode)}
                    className="bg-transparent"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Alternative Code
                  </Button>
                </div>
                <Alert className="mb-4 border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    This alternative configuration uses the opposite reversing valve logic. Try this code if your
                    heating and cooling modes are reversed.
                  </AlertDescription>
                </Alert>
                <p className="text-[#6B7280] text-sm">
                  <strong>Alternative Description:</strong> {alternativeDetails?.description}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#2D2D2D]">System Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-[#2D2D2D] text-sm">System Type:</span>
                    <span className="ml-2 text-[#6B7280] text-sm">{configDetails?.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#2D2D2D] text-sm">Description:</span>
                    <p className="text-[#6B7280] mt-1 text-sm">{configDetails?.description}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[#2D2D2D] text-sm">Connected Wires:</span>
                    <span className="ml-2 text-[#6B7280] text-sm">
                      {Object.entries(formData.wiring)
                        .filter(([_, connected]) => connected)
                        .map(([wire, _]) => wire)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[#2D2D2D]">Detected Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] text-sm">Heating:</span>
                    <span className={`text-sm ${detectedCapabilities.heating ? "text-green-600" : "text-gray-400"}`}>
                      {detectedCapabilities.heating ? `${detectedCapabilities.stages.heat} Stage(s)` : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] text-sm">Cooling:</span>
                    <span className={`text-sm ${detectedCapabilities.cooling ? "text-green-600" : "text-gray-400"}`}>
                      {detectedCapabilities.cooling ? `${detectedCapabilities.stages.cool} Stage(s)` : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] text-sm">Heat Pump:</span>
                    <span className={`text-sm ${detectedCapabilities.heatPump ? "text-green-600" : "text-gray-400"}`}>
                      {detectedCapabilities.heatPump ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] text-sm">Fan Control:</span>
                    <span className={`text-sm ${detectedCapabilities.fanControl ? "text-green-600" : "text-gray-400"}`}>
                      {detectedCapabilities.fanControl ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] text-sm">Emergency Heat:</span>
                    <span
                      className={`text-sm ${detectedCapabilities.emergencyHeat ? "text-green-600" : "text-gray-400"}`}
                    >
                      {detectedCapabilities.emergencyHeat ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset} className="bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

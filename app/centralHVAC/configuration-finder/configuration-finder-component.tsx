"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ArrowLeft, ArrowRight, ExternalLink, HelpCircle } from "lucide-react"

// Configuration codes data
const configurationCodes = {
  "0000": { systemType: "Gas Furnace", description: "Basic gas furnace with single-stage heating" },
  "0001": { systemType: "Gas Furnace", description: "Gas furnace with two-stage heating" },
  "0010": { systemType: "Gas Furnace", description: "Gas furnace with single-stage heating and cooling" },
  "0011": { systemType: "Gas Furnace", description: "Gas furnace with two-stage heating and cooling" },
  "0100": { systemType: "Gas Furnace", description: "Gas furnace with single-stage heating and variable speed fan" },
  "0101": { systemType: "Gas Furnace", description: "Gas furnace with two-stage heating and variable speed fan" },
  "0110": {
    systemType: "Gas Furnace",
    description: "Gas furnace with single-stage heating, cooling, and variable speed fan",
  },
  "0111": {
    systemType: "Gas Furnace",
    description: "Gas furnace with two-stage heating, cooling, and variable speed fan",
  },
  "1000": { systemType: "Heat Pump", description: "Heat pump with single-stage heating and cooling" },
  "1001": { systemType: "Heat Pump", description: "Heat pump with two-stage heating and cooling" },
  "1010": { systemType: "Heat Pump", description: "Heat pump with single-stage heating, cooling, and emergency heat" },
  "1011": { systemType: "Heat Pump", description: "Heat pump with two-stage heating, cooling, and emergency heat" },
  "1100": {
    systemType: "Heat Pump",
    description: "Heat pump with single-stage heating, cooling, and variable speed fan",
  },
  "1101": { systemType: "Heat Pump", description: "Heat pump with two-stage heating, cooling, and variable speed fan" },
  "1110": {
    systemType: "Heat Pump",
    description: "Heat pump with single-stage heating, cooling, emergency heat, and variable speed fan",
  },
  "1111": {
    systemType: "Heat Pump",
    description: "Heat pump with two-stage heating, cooling, emergency heat, and variable speed fan",
  },
  "2000": { systemType: "Fan Coil", description: "Fan coil with single-stage heating and cooling" },
  "2001": { systemType: "Fan Coil", description: "Fan coil with two-stage heating and cooling" },
  "2100": {
    systemType: "Fan Coil",
    description: "Fan coil with single-stage heating, cooling, and variable speed fan",
  },
  "2101": { systemType: "Fan Coil", description: "Fan coil with two-stage heating, cooling, and variable speed fan" },
}

type WireType = "R" | "C" | "W" | "W2" | "Y" | "Y2" | "G" | "O" | "B"
type SystemType = "gas-furnace" | "heat-pump" | "fan-coil" | "not-sure"

interface WireSelection {
  [key: string]: boolean
}

export function ConfigurationFinderComponent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [systemType, setSystemType] = useState<SystemType | null>(null)
  const [selectedWires, setSelectedWires] = useState<WireSelection>({})
  const [fanSpeeds, setFanSpeeds] = useState<string | null>(null)
  const [configCode, setConfigCode] = useState<string | null>(null)
  const [showCWireWarning, setShowCWireWarning] = useState(false)
  const [showHeatPumpConfirmation, setShowHeatPumpConfirmation] = useState(false)
  const [showAlternativeConfig, setShowAlternativeConfig] = useState(false)

  // Check for C-wire when component mounts or wires change
  useEffect(() => {
    if (Object.keys(selectedWires).length > 0 && !selectedWires["C"]) {
      setShowCWireWarning(true)
    } else {
      setShowCWireWarning(false)
    }
  }, [selectedWires])

  // Auto-generate config code when all required steps are completed
  useEffect(() => {
    if (shouldShowResults()) {
      const code = generateConfigCode()
      setConfigCode(code)
    }
  }, [selectedWires, fanSpeeds, systemType])

  const getWireDescriptions = () => {
    const baseWires = {
      R: "24V power from transformer",
      C: "Common wire (return path for 24V power) - REQUIRED",
      W: "Heat call (single-stage heating)",
      Y: "Cool call (single-stage cooling)",
      G: "Fan control",
    }

    if (systemType === "not-sure") {
      return {
        ...baseWires,
        W2: "Second-stage heat or Emergency/Auxiliary heat",
        Y2: "Second-stage cooling",
        O: "Heat pump reversing valve (cooling mode)",
        B: "Heat pump reversing valve (heating mode)",
      }
    }

    if (systemType === "heat-pump") {
      return {
        ...baseWires,
        W2: "Emergency/Auxiliary heat",
        Y2: "Second-stage cooling",
        O: "Heat pump reversing valve (cooling mode)",
        B: "Heat pump reversing valve (heating mode)",
      }
    }

    if (systemType === "fan-coil") {
      return {
        ...baseWires,
        W2: "Second-stage heating",
        Y2: "Second-stage cooling",
      }
    }

    // Gas furnace
    return {
      ...baseWires,
      W2: "Second-stage heating",
      Y2: "Second-stage cooling",
    }
  }

  const getAvailableWires = (): WireType[] => {
    const baseWires: WireType[] = ["R", "C", "W", "Y", "G"]

    if (systemType === "not-sure") {
      return [...baseWires, "W2", "Y2", "O", "B"]
    }

    if (systemType === "heat-pump") {
      return [...baseWires, "W2", "Y2", "O", "B"]
    }

    if (systemType === "fan-coil") {
      return [...baseWires, "W2", "Y2"]
    }

    // Gas furnace
    return [...baseWires, "W2", "Y2"]
  }

  const handleWireToggle = (wire: WireType) => {
    setSelectedWires((prev) => ({
      ...prev,
      [wire]: !prev[wire],
    }))
  }

  const detectSystemType = (): SystemType => {
    if (selectedWires["O"] || selectedWires["B"]) {
      return "heat-pump"
    }
    if (selectedWires["W"] && selectedWires["Y"]) {
      return "gas-furnace"
    }
    if (selectedWires["W"] || selectedWires["Y"]) {
      return "fan-coil"
    }
    return "gas-furnace" // default
  }

  const generateConfigCode = (): string => {
    let detectedSystemType = systemType

    // If user selected "I'm Not Sure", detect based on wiring
    if (systemType === "not-sure") {
      detectedSystemType = detectSystemType()
    }

    // Generate 4-bit code based on wiring
    let code = ""

    // Bit 0: Heat pump indicator
    if (detectedSystemType === "heat-pump") {
      code += "1"
    } else if (detectedSystemType === "fan-coil") {
      code += "2"
    } else {
      code += "0"
    }

    // Bit 1: Variable speed fan
    if (fanSpeeds === "variable") {
      code += "1"
    } else {
      code += "0"
    }

    // Bit 2: Cooling stage
    if (selectedWires["Y2"]) {
      code += "1"
    } else if (selectedWires["Y"]) {
      code += "1"
    } else {
      code += "0"
    }

    // Bit 3: Heating stage or emergency heat
    if (detectedSystemType === "heat-pump" && selectedWires["W2"] && !selectedWires["Y2"]) {
      // Heat pump with W2 but no Y2 = emergency heat
      code += "1"
    } else if (selectedWires["W2"]) {
      code += "1"
    } else {
      code += "0"
    }

    return code
  }

  const getConfigInfo = (code: string) => {
    return (
      configurationCodes[code as keyof typeof configurationCodes] || {
        systemType: "Unknown",
        description: "Configuration not found",
      }
    )
  }

  const shouldShowResults = () => {
    if (systemType === "fan-coil") {
      return currentStep >= 3 && Object.keys(selectedWires).length > 0
    }
    return currentStep >= 4 && Object.keys(selectedWires).length > 0 && fanSpeeds
  }

  const canProceedFromStep2 = () => {
    if (!selectedWires["C"]) return false

    // Heat pump validation
    if (systemType === "heat-pump" && !selectedWires["O"] && !selectedWires["B"]) {
      return false
    }

    return Object.keys(selectedWires).length > 1 // At least C and one other wire
  }

  const handleNextStep = () => {
    if (currentStep === 2) {
      // Check for heat pump without O or B wire
      if (systemType === "heat-pump" && !selectedWires["O"] && !selectedWires["B"]) {
        setShowHeatPumpConfirmation(true)
        return
      }

      // Skip step 3 for fan coil systems
      if (systemType === "fan-coil") {
        setCurrentStep(4) // Go directly to results
        return
      }
    }

    setCurrentStep((prev) => prev + 1)
  }

  const handlePreviousStep = () => {
    if (currentStep === 4 && systemType === "fan-coil") {
      setCurrentStep(2) // Skip step 3 when going back
      return
    }
    setCurrentStep((prev) => prev - 1)
  }

  const resetTool = () => {
    setCurrentStep(1)
    setSystemType(null)
    setSelectedWires({})
    setFanSpeeds(null)
    setConfigCode(null)
    setShowCWireWarning(false)
    setShowHeatPumpConfirmation(false)
    setShowAlternativeConfig(false)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">What type of HVAC system do you have?</h3>
        <p className="text-[#6B7280]">Select your system type to get started with the configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: "gas-furnace", label: "Gas Furnace", description: "Traditional gas heating with optional cooling" },
          { id: "heat-pump", label: "Heat Pump", description: "Electric heating and cooling system" },
          { id: "fan-coil", label: "Fan Coil", description: "Hydronic heating and cooling system" },
          { id: "not-sure", label: "I'm Not Sure", description: "Let us determine based on your wiring" },
        ].map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              systemType === option.id ? "ring-2 ring-[#E91E63] bg-pink-50" : ""
            }`}
            onClick={() => setSystemType(option.id as SystemType)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {systemType === option.id && <CheckCircle className="w-5 h-5 text-[#E91E63]" />}
                {option.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{option.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setCurrentStep(2)}
          disabled={!systemType}
          className="bg-[#E91E63] hover:bg-[#d81b60] text-white"
        >
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">Select Your Wires</h3>
        <p className="text-[#6B7280]">Choose all the wires connected to your current thermostat.</p>
      </div>

      {showCWireWarning && (
        <Alert className="border-[#E91E63] bg-pink-50">
          <AlertCircle className="h-4 w-4 text-[#E91E63]" />
          <AlertDescription className="text-[#E91E63]">
            <div className="flex items-center justify-between">
              <span>A C-wire is required for all Mysa thermostats.</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-[#E91E63] text-[#E91E63] bg-transparent">
                  I have a C-wire adapter
                </Button>
                <Button size="sm" className="bg-[#E91E63] hover:bg-[#d81b60] text-white">
                  Buy C-wire adapter
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {getAvailableWires().map((wire) => {
          const descriptions = getWireDescriptions()
          return (
            <Card
              key={wire}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedWires[wire] ? "ring-2 ring-[#E91E63] bg-pink-50" : ""
              }`}
              onClick={() => handleWireToggle(wire)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedWires[wire] && <CheckCircle className="w-5 h-5 text-[#E91E63]" />}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{wire}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{descriptions[wire as keyof typeof descriptions]}</CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-[#6B7280] mb-2">My wire is not shown</p>
          <Button variant="outline" size="sm">
            Contact Mysa Support <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {showHeatPumpConfirmation && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <div className="space-y-3">
              <p>
                You selected "Heat Pump" but didn't choose an O or B wire. Heat pumps typically require one of these
                wires for the reversing valve.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHeatPumpConfirmation(false)}
                  className="border-orange-500 text-orange-700 bg-transparent"
                >
                  Go Back & Add Wire
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowHeatPumpConfirmation(false)
                    if (systemType === "fan-coil") {
                      setCurrentStep(4)
                    } else {
                      setCurrentStep(3)
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Continue Anyway
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePreviousStep}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <Button
          onClick={handleNextStep}
          disabled={!canProceedFromStep2()}
          className="bg-[#E91E63] hover:bg-[#d81b60] text-white"
        >
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">Fan Speed Control</h3>
        <p className="text-[#6B7280]">How many fan speeds does your system support?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: "fixed", label: "Fixed Speed", description: "Single fan speed (most common)" },
          { id: "variable", label: "Variable Speed", description: "Multiple fan speeds or ECM motor" },
        ].map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              fanSpeeds === option.id ? "ring-2 ring-[#E91E63] bg-pink-50" : ""
            }`}
            onClick={() => setFanSpeeds(option.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {fanSpeeds === option.id && <CheckCircle className="w-5 h-5 text-[#E91E63]" />}
                {option.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{option.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePreviousStep}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(4)}
          disabled={!fanSpeeds}
          className="bg-[#E91E63] hover:bg-[#d81b60] text-white"
        >
          Generate Code <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const renderResults = () => {
    if (!configCode) return null

    const configInfo = getConfigInfo(configCode)
    const detectedSystemType = systemType === "not-sure" ? detectSystemType() : systemType

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-medium text-[#2D2D2D] mb-4">Your Configuration Code</h3>
          <p className="text-[#6B7280]">Use this code when setting up your Mysa thermostat.</p>
        </div>

        <Card className="border-2 border-[#E91E63] bg-pink-50">
          <CardHeader className="text-center">
            <div className="text-6xl font-mono font-bold text-[#E91E63] mb-4">{configCode}</div>
            <CardTitle className="text-xl text-[#2D2D2D]">{configInfo.systemType}</CardTitle>
            <CardDescription className="text-[#6B7280]">{configInfo.description}</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selected Wires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedWires)
                  .filter(([_, selected]) => selected)
                  .map(([wire]) => (
                    <Badge key={wire} className="bg-[#E91E63] text-white font-mono">
                      {wire}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">System Type:</span>
                <span className="font-medium">{configInfo.systemType}</span>
              </div>
              {fanSpeeds && (
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Fan Control:</span>
                  <span className="font-medium">{fanSpeeds === "variable" ? "Variable Speed" : "Fixed Speed"}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {detectedSystemType === "heat-pump" && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">Heat Pump Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                If this configuration doesn't work as expected, try the alternative heat pump setup.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowAlternativeConfig(!showAlternativeConfig)}
                className="border-blue-500 text-blue-700 bg-transparent"
              >
                {showAlternativeConfig ? "Hide" : "Show"} Alternative Configuration
              </Button>
              {showAlternativeConfig && (
                <div className="mt-4 p-4 bg-white rounded border">
                  <p className="text-sm text-[#6B7280] mb-2">Alternative configuration code:</p>
                  <div className="text-2xl font-mono font-bold text-blue-600">
                    {configCode.replace(/^1/, "0")} {/* Convert heat pump to gas furnace equivalent */}
                  </div>
                  <p className="text-sm text-[#6B7280] mt-2">
                    This treats your heat pump as a conventional system if the primary configuration has issues.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetTool}>
            Start Over
          </Button>
          <div className="space-x-2">
            <Button variant="outline">Save Configuration</Button>
            <Button className="bg-[#E91E63] hover:bg-[#d81b60] text-white">Continue to Installation</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-[#2D2D2D]">Configuration Code Finder</CardTitle>
              <CardDescription className="text-[#6B7280]">
                Step {currentStep} of {systemType === "fan-coil" ? "3" : "4"}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((step) => {
                const maxSteps = systemType === "fan-coil" ? 3 : 4
                if (step > maxSteps) return null

                return (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep ? "bg-[#E91E63] text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                )
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {(currentStep === 4 || shouldShowResults()) && renderResults()}
        </CardContent>
      </Card>
    </div>
  )
}

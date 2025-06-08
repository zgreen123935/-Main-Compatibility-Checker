"use client"

import type React from "react"

import { useState, useRef } from "react"
import { InstallButton } from "./InstallButton"

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
  x?: number
  y?: number
}

interface InteractiveTrainingProps {
  imageFile: File
  imageUrl: string
  initialDetection: any
  onComplete: (correctedWires: string[]) => void
  onCancel: () => void
}

interface ClickPoint {
  x: number
  y: number
  terminal: string
  wireColor?: string
}

export function InteractiveTraining({
  imageFile,
  imageUrl,
  initialDetection,
  onComplete,
  onCancel,
}: InteractiveTrainingProps) {
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([])
  const [selectedTerminal, setSelectedTerminal] = useState("R")
  const [selectedWireColor, setSelectedWireColor] = useState("red")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [systemType, setSystemType] = useState<"heat-pump" | "conventional" | "unknown">("unknown")
  const [imageQuality, setImageQuality] = useState<"excellent" | "good" | "fair" | "poor">("good")
  const [feedback, setFeedback] = useState("")
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Common terminals and wire colors
  const commonTerminals = [
    "R",
    "Rc",
    "Rh",
    "C",
    "Y",
    "Y1",
    "Y2",
    "G",
    "W",
    "W1",
    "W2",
    "O",
    "B",
    "O/B",
    "ACC+",
    "ACC-",
    "AUX",
    "E",
    "L",
    "S",
  ]

  const wireColors = [
    { name: "red", hex: "#dc2626" },
    { name: "blue", hex: "#2563eb" },
    { name: "yellow", hex: "#eab308" },
    { name: "green", hex: "#16a34a" },
    { name: "white", hex: "#6b7280" },
    { name: "orange", hex: "#ea580c" },
    { name: "black", hex: "#1f2937" },
    { name: "brown", hex: "#92400e" },
    { name: "purple", hex: "#7c3aed" },
    { name: "pink", hex: "#db2777" },
    { name: "gray", hex: "#6b7280" },
  ]

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !containerRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Check if clicking on existing point to remove it
    const existingPointIndex = clickPoints.findIndex((point) => Math.abs(point.x - x) < 3 && Math.abs(point.y - y) < 3)

    if (existingPointIndex !== -1) {
      // Remove existing point
      setClickPoints((prev) => prev.filter((_, index) => index !== existingPointIndex))
    } else {
      // Add new point
      const newPoint: ClickPoint = {
        x,
        y,
        terminal: selectedTerminal,
        wireColor: selectedWireColor,
      }
      setClickPoints((prev) => [...prev, newPoint])
    }
  }

  const handleSubmitTraining = async () => {
    setIsSubmitting(true)

    try {
      // Create corrected wire connections
      const correctedConnections: WireConnection[] = clickPoints.map((point) => ({
        terminal: point.terminal,
        hasWire: true,
        wireColor: point.wireColor,
        confidence: 1.0, // User is certain
        x: point.x,
        y: point.y,
      }))

      // Submit training data
      const trainingData = {
        imageUrl,
        imageHash: initialDetection?.imageHash || "unknown",
        userVerifiedConnections: correctedConnections,
        aiDetectedConnections: initialDetection?.wireConnections || [],
        systemType,
        imageQuality,
        userFeedback: feedback,
        clickCoordinates: clickPoints,
        correctionType: "interactive_training",
      }

      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_training",
          data: trainingData,
        }),
      })

      if (response.ok) {
        console.log("Interactive training data submitted successfully")
      }

      // Return the corrected wires
      const correctedWires = clickPoints.map((point) => point.terminal)
      onComplete([...new Set(correctedWires)]) // Remove duplicates
    } catch (error) {
      console.error("Error submitting training data:", error)
      // Still complete with user selections
      const correctedWires = clickPoints.map((point) => point.terminal)
      onComplete([...new Set(correctedWires)])
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSelectedWires = () => {
    const wires = clickPoints.map((point) => point.terminal)
    return [...new Set(wires)] // Remove duplicates
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-[95vh] overflow-y-auto w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-[#2D2D2D]">Interactive Wire Training</h3>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Section */}
            <div>
              <h4 className="font-medium text-[#2D2D2D] mb-3">Click on wire connections in the image:</h4>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Instructions:</strong> Click directly on each terminal that has a wire connected. Click again
                  to remove a point. Select the terminal name and wire color before clicking.
                </p>
              </div>

              <div
                ref={containerRef}
                className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100"
                style={{ maxHeight: "400px" }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl || "/placeholder.svg"}
                  alt="Thermostat wiring"
                  className="w-full h-auto cursor-crosshair"
                  onClick={handleImageClick}
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />

                {/* Overlay click points */}
                {clickPoints.map((point, index) => (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                    }}
                  >
                    <div className="relative">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                        style={{
                          backgroundColor: wireColors.find((c) => c.name === point.wireColor)?.hex || "#dc2626",
                        }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {point.terminal}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                Marked connections: {clickPoints.length} | Selected wires: {getSelectedWires().join(", ") || "None"}
              </div>
            </div>

            {/* Controls Section */}
            <div>
              <h4 className="font-medium text-[#2D2D2D] mb-3">Selection Controls:</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Terminal to mark:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {commonTerminals.map((terminal) => (
                      <button
                        key={terminal}
                        onClick={() => setSelectedTerminal(terminal)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          selectedTerminal === terminal
                            ? "bg-[#BAE5D4] text-[#2D2D2D] border-2 border-[#2D2D2D]"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {terminal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Wire color:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {wireColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedWireColor(color.name)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          selectedWireColor === color.name
                            ? "bg-gray-800 text-white border-2 border-gray-900"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full border border-gray-400"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">System Type:</label>
                  <div className="flex gap-2">
                    {(["heat-pump", "conventional", "unknown"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSystemType(type)}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          systemType === type
                            ? "bg-[#BAE5D4] text-[#2D2D2D]"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {type === "heat-pump" ? "Heat Pump" : type === "conventional" ? "Conventional" : "Unknown"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Photo Quality:</label>
                  <div className="flex gap-2">
                    {(["excellent", "good", "fair", "poor"] as const).map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setImageQuality(quality)}
                        className={`px-3 py-2 rounded-lg text-sm capitalize ${
                          imageQuality === quality
                            ? "bg-[#BAE5D4] text-[#2D2D2D]"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Feedback (optional):</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Any issues with the AI detection? Suggestions?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                {/* Current AI Detection vs User Selection */}
                {initialDetection?.connectedWires && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h5 className="font-medium text-gray-800 mb-2">Comparison:</h5>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>AI detected:</strong> {initialDetection.connectedWires.join(", ") || "None"}
                      </div>
                      <div>
                        <strong>You marked:</strong> {getSelectedWires().join(", ") || "None"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <InstallButton
              title={`Submit Training & Continue (${getSelectedWires().length} wires)`}
              onPress={handleSubmitTraining}
              loading={isSubmitting}
              disabled={clickPoints.length === 0}
              className="flex-1"
            />
            <InstallButton title="Cancel" onPress={onCancel} variant="secondary" className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

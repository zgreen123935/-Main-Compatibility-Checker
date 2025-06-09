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
  id: string // Add unique ID for each point
}

interface SavedConnection {
  terminal: string
  wireColor: string
  id: string
  x: number
  y: number
}

export function InteractiveTraining({
  imageFile,
  imageUrl,
  initialDetection,
  onComplete,
  onCancel,
}: InteractiveTrainingProps) {
  const [clickPoints, setClickPoints] = useState<ClickPoint[]>([])
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([])
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

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Simplified click handler - only adds, never removes
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !containerRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Create new connection and immediately save it
    const newConnection: SavedConnection = {
      terminal: selectedTerminal,
      wireColor: selectedWireColor,
      x,
      y,
      id: generateId(),
    }

    // Add to saved connections immediately
    setSavedConnections((prev) => [...prev, newConnection])

    // Also add to click points for visual display
    const newPoint: ClickPoint = {
      x,
      y,
      terminal: selectedTerminal,
      wireColor: selectedWireColor,
      id: newConnection.id,
    }

    setClickPoints((prev) => [...prev, newPoint])

    console.log(`Added connection: ${selectedTerminal} at ${x.toFixed(1)}%, ${y.toFixed(1)}%`)
    console.log(`Total saved connections:`, savedConnections.length + 1)
  }

  // Remove a specific connection by ID
  const removeConnection = (id: string) => {
    setSavedConnections((prev) => prev.filter((conn) => conn.id !== id))
    setClickPoints((prev) => prev.filter((point) => point.id !== id))
  }

  // Clear all connections
  const clearAllConnections = () => {
    setSavedConnections([])
    setClickPoints([])
  }

  const handleSubmitTraining = async () => {
    setIsSubmitting(true)

    try {
      console.log("Submitting training with saved connections:", savedConnections)

      // Create corrected wire connections from saved connections
      const correctedConnections: WireConnection[] = savedConnections.map((conn) => ({
        terminal: conn.terminal,
        hasWire: true,
        wireColor: conn.wireColor,
        confidence: 1.0,
        x: conn.x,
        y: conn.y,
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
        clickCoordinates: savedConnections,
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
      const correctedWires = savedConnections.map((conn) => conn.terminal)
      onComplete([...new Set(correctedWires)]) // Remove duplicates
    } catch (error) {
      console.error("Error submitting training data:", error)
      // Still complete with user selections
      const correctedWires = savedConnections.map((conn) => conn.terminal)
      onComplete([...new Set(correctedWires)])
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUniqueTerminals = () => {
    const terminals = savedConnections.map((conn) => conn.terminal)
    return [...new Set(terminals)]
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
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-[#2D2D2D]">Click on wire connections:</h4>
                <button
                  onClick={clearAllConnections}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                  disabled={savedConnections.length === 0}
                >
                  Clear All ({savedConnections.length})
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>Simple Training Steps:</strong>
                  <br />• <strong>Step 1:</strong> Select a terminal name below (e.g., "Rc")
                  <br />• <strong>Step 2:</strong> Click on that wire connection in the image
                  <br />• <strong>Step 3:</strong> Connection is automatically saved!
                  <br />• <strong>Step 4:</strong> Select next terminal and repeat
                  <br />• <strong>Remove:</strong> Use the "×" button next to saved connections
                </p>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 mb-3">
                <p className="text-sm font-medium text-yellow-800">
                  🎯 Currently selecting: <strong>{selectedTerminal}</strong> ({selectedWireColor})
                  <br />
                  Click anywhere on the <strong>{selectedTerminal}</strong> wire connection in the image
                </p>
              </div>

              {/* Saved Connections List */}
              {savedConnections.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <h5 className="font-medium text-green-800 mb-2">✅ Saved Connections:</h5>
                  <div className="space-y-1">
                    {savedConnections.map((conn) => (
                      <div key={conn.id} className="flex items-center justify-between bg-white rounded px-2 py-1">
                        <span className="text-sm">
                          <strong>{conn.terminal}</strong> ({conn.wireColor})
                        </span>
                        <button
                          onClick={() => removeConnection(conn.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                {clickPoints.map((point) => (
                  <div
                    key={point.id}
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

              <div className="mt-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">
                    <strong>Total connections:</strong> {savedConnections.length}
                  </span>
                  <span className="text-gray-600">
                    <strong>Unique terminals:</strong> {getUniqueTerminals().length}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Terminals: {getUniqueTerminals().join(", ") || "None selected"}
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div>
              <h4 className="font-medium text-[#2D2D2D] mb-3">Selection Controls:</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Terminal to mark next:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {commonTerminals.map((terminal) => {
                      const count = savedConnections.filter((conn) => conn.terminal === terminal).length
                      const isSelected = selectedTerminal === terminal
                      return (
                        <button
                          key={terminal}
                          onClick={() => setSelectedTerminal(terminal)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium relative transition-colors ${
                            isSelected
                              ? "bg-[#BAE5D4] text-[#2D2D2D] border-2 border-[#2D2D2D]"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {terminal}
                          {count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">Wire color:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {wireColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedWireColor(color.name)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
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
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
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
                        className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
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
                        <strong>You marked:</strong> {getUniqueTerminals().join(", ") || "None"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <InstallButton
              title={`Submit Training & Continue (${getUniqueTerminals().length} wires)`}
              onPress={handleSubmitTraining}
              loading={isSubmitting}
              disabled={savedConnections.length === 0}
              className="flex-1"
            />
            <InstallButton title="Cancel" onPress={onCancel} variant="secondary" className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

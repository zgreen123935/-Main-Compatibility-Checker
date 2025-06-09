"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
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
  id: string
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
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)
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

  // Auto-save training data when connections change
  useEffect(() => {
    if (autoSaveEnabled && savedConnections.length > 0) {
      const timeoutId = setTimeout(() => {
        savePartialTrainingData()
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [savedConnections, autoSaveEnabled])

  // Save partial training data (without completing the flow)
  const savePartialTrainingData = async () => {
    if (savedConnections.length === 0) return

    try {
      const partialTrainingData = {
        imageUrl,
        imageHash: initialDetection?.imageHash || "unknown",
        userVerifiedConnections: savedConnections.map((conn) => ({
          terminal: conn.terminal,
          hasWire: true,
          wireColor: conn.wireColor,
          confidence: 1.0,
          x: conn.x,
          y: conn.y,
        })),
        aiDetectedConnections: initialDetection?.wireConnections || [],
        systemType,
        imageQuality,
        userFeedback: feedback,
        clickCoordinates: savedConnections,
        correctionType: "partial_training",
        isComplete: false, // Mark as partial save
        timestamp: Date.now(),
      }

      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_partial",
          data: partialTrainingData,
        }),
      })

      if (response.ok) {
        setLastSaveTime(new Date())
        console.log("Partial training data auto-saved")
      }
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }

  // Manual save function
  const saveTrainingNow = async () => {
    await savePartialTrainingData()
  }

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current || !containerRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    const newConnection: SavedConnection = {
      terminal: selectedTerminal,
      wireColor: selectedWireColor,
      x,
      y,
      id: generateId(),
    }

    setSavedConnections((prev) => [...prev, newConnection])

    const newPoint: ClickPoint = {
      x,
      y,
      terminal: selectedTerminal,
      wireColor: selectedWireColor,
      id: newConnection.id,
    }

    setClickPoints((prev) => [...prev, newPoint])

    console.log(`Added connection: ${selectedTerminal} at ${x.toFixed(1)}%, ${y.toFixed(1)}%`)
  }

  const removeConnection = (id: string) => {
    setSavedConnections((prev) => prev.filter((conn) => conn.id !== id))
    setClickPoints((prev) => prev.filter((point) => point.id !== id))
  }

  const clearAllConnections = () => {
    setSavedConnections([])
    setClickPoints([])
  }

  const calculateAIAccuracy = (aiPredictions: string[], userSelections: string[]) => {
    if (aiPredictions.length === 0) return 0
    const correct = aiPredictions.filter((pred) => userSelections.includes(pred)).length
    return correct / aiPredictions.length
  }

  // Final submission (marks training as complete)
  const handleSubmitTraining = async () => {
    setIsSubmitting(true)

    // Always save training data - even if user just confirms AI suggestions
    const shouldSaveTraining =
      savedConnections.length > 0 || (initialDetection?.connectedWires && initialDetection.connectedWires.length > 0)

    if (!shouldSaveTraining) {
      console.log("No training data to save - user made no selections")
      onComplete([])
      return
    }

    // If user didn't make any corrections, use AI suggestions as confirmed training data
    const finalConnections =
      savedConnections.length > 0
        ? savedConnections
        : (initialDetection?.connectedWires || []).map((terminal, index) => ({
            terminal,
            wireColor: "unknown", // We don't have color info from AI-only detection
            x: 50 + index * 5, // Spread them across the image
            y: 50 + index * 5,
            id: generateId(),
          }))

    try {
      console.log("Submitting final training with saved connections:", savedConnections)

      const correctedConnections: WireConnection[] = finalConnections.map((conn) => ({
        terminal: conn.terminal,
        hasWire: true,
        wireColor: conn.wireColor,
        confidence: savedConnections.length > 0 ? 1.0 : 0.8, // Lower confidence for AI-only confirmations
        x: conn.x,
        y: conn.y,
      }))

      const finalTrainingData = {
        imageUrl,
        imageHash: initialDetection?.imageHash || "unknown",
        userVerifiedConnections: correctedConnections,
        aiDetectedConnections: initialDetection?.wireConnections || [],
        systemType,
        imageQuality,
        userFeedback: feedback,
        clickCoordinates: finalConnections,
        correctionType: savedConnections.length > 0 ? "user_corrections" : "ai_confirmation",
        isComplete: true,
        timestamp: Date.now(),
        // New learning metadata
        learningMetadata: {
          userMadeCorrections: savedConnections.length > 0,
          aiAccuracy: calculateAIAccuracy(
            initialDetection?.connectedWires || [],
            finalConnections.map((c) => c.terminal),
          ),
          trainingType: savedConnections.length > 0 ? "corrective" : "confirmatory",
          confidenceBoost: savedConnections.length > 0 ? 0.2 : 0.1,
        },
      }

      const response = await fetch("/api/wire-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_training",
          data: finalTrainingData,
        }),
      })

      if (response.ok) {
        console.log("Final training data submitted successfully")
      }

      const correctedWires = savedConnections.map((conn) => conn.terminal)
      onComplete([...new Set(correctedWires)])
    } catch (error) {
      console.error("Error submitting training data:", error)
      const correctedWires = savedConnections.map((conn) => conn.terminal)
      onComplete([...new Set(correctedWires)])
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enhanced cancel that can optionally save partial data
  const handleCancel = async () => {
    if (savedConnections.length > 0) {
      const shouldSave = confirm(
        `You have ${savedConnections.length} marked connections. Save this training data before cancelling?`,
      )

      if (shouldSave) {
        await savePartialTrainingData()
      }
    }
    onCancel()
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
            <div className="flex items-center gap-4">
              {/* Auto-save status */}
              <div className="text-sm text-gray-600">
                {autoSaveEnabled ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Auto-save ON</span>
                    {lastSaveTime && <span className="text-xs">(saved {lastSaveTime.toLocaleTimeString()})</span>}
                  </div>
                ) : (
                  <span className="text-gray-500">Auto-save OFF</span>
                )}
              </div>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>
          </div>

          {/* Save Controls */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                  <span className="text-sm">Auto-save training data</span>
                </label>
                <button
                  onClick={saveTrainingNow}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  disabled={savedConnections.length === 0}
                >
                  Save Now
                </button>
              </div>
              <div className="text-xs text-gray-500">
                {savedConnections.length > 0
                  ? autoSaveEnabled
                    ? "Auto-saves 2s after changes"
                    : "Manual save only"
                  : "No data to save"}
              </div>
            </div>
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
                  <strong>Training Steps:</strong>
                  <br />• Select terminal → Click wire → Automatically saved!
                  <br />• Training data saves automatically as you work
                  <br />• Use "×" button to remove individual connections
                  <br />• Your progress is preserved even if you cancel
                </p>
              </div>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2 mb-3">
                <p className="text-sm font-medium text-yellow-800">
                  🎯 Currently selecting: <strong>{selectedTerminal}</strong> ({selectedWireColor})
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
              title={`Complete Training & Continue (${getUniqueTerminals().length} wires)`}
              onPress={handleSubmitTraining}
              loading={isSubmitting}
              disabled={savedConnections.length === 0}
              className="flex-1"
            />
            <InstallButton title="Cancel" onPress={handleCancel} variant="secondary" className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

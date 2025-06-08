"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { InstallButton } from "./InstallButton"
import { PhotoGuide } from "./PhotoGuide"

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
}

interface WireDetectionProps {
  onWiresDetected: (wires: string[]) => void
  onSkip: () => void
}

interface AnalysisResult {
  detectedTerminals: string[]
  wireConnections: WireConnection[]
  connectedWires: string[]
  confidence: number
  isThermostatImage: boolean
  reasons: string[]
  rawAnalysis?: string
}

export function WireDetection({ onWiresDetected, onSkip }: WireDetectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedWires, setSelectedWires] = useState<string[]>([])
  const [ocrComplete, setOcrComplete] = useState(false)
  const [showRawAnalysis, setShowRawAnalysis] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualTerminals, setManualTerminals] = useState<string[]>([])
  const [newTerminal, setNewTerminal] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Common thermostat terminals for manual selection
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

  useEffect(() => {
    if (analysisResult?.connectedWires) {
      setSelectedWires(analysisResult.connectedWires)
    }
  }, [analysisResult])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    await processImage(file)
  }

  const processImage = async (file: File) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("image", file)
      formData.append("mode", showRawAnalysis ? "raw" : "standard")

      const response = await fetch("/api/analyze-wiring", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult(result)
      } else {
        throw new Error("Analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setAnalysisResult({
        detectedTerminals: [],
        wireConnections: [],
        connectedWires: [],
        confidence: 0,
        isThermostatImage: false,
        reasons: ["Analysis failed. Please try again or use manual selection."],
      })
    } finally {
      setIsProcessing(false)
      setOcrComplete(true)
    }
  }

  const handleWireToggle = (terminal: string) => {
    setSelectedWires((prev) => (prev.includes(terminal) ? prev.filter((w) => w !== terminal) : [...prev, terminal]))
  }

  const handleConfirm = () => {
    onWiresDetected(selectedWires)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
    setAnalysisResult(null)
    setOcrComplete(false)
    setSelectedWires([])
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const handleAddManualTerminal = () => {
    if (newTerminal && !manualTerminals.includes(newTerminal)) {
      setManualTerminals([...manualTerminals, newTerminal])
      setSelectedWires([...selectedWires, newTerminal])
      setNewTerminal("")
    }
  }

  const toggleManualMode = () => {
    setManualMode(!manualMode)
    if (!manualMode && analysisResult) {
      // Initialize manual terminals with detected ones
      setManualTerminals(analysisResult.detectedTerminals)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Wire Detection</h3>

      <div className="mb-6">
        <p className="text-[#4B5563] mb-4">
          Take a clear photo of your thermostat wiring. We'll identify terminals and try to detect which ones have wires
          connected.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">📸 Photo Tips for Better Detection:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure all wire terminals and labels are clearly visible</li>
            <li>• Use good lighting - avoid shadows over the wiring area</li>
            <li>• Take the photo straight-on, not at an angle</li>
            <li>• Ensure wires and their colors are clearly visible</li>
          </ul>
        </div>

        <PhotoGuide />

        <div className="flex items-center mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showRawAnalysis}
              onChange={() => setShowRawAnalysis(!showRawAnalysis)}
              className="mr-2"
            />
            <span className="text-sm text-[#4B5563]">Show detailed analysis (for troubleshooting)</span>
          </label>
        </div>

        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" ref={fileInputRef} />

        {!previewUrl ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#BAE5D4]"
            onClick={triggerFileInput}
          >
            <div className="text-6xl mb-4">📷</div>
            <p className="text-[#6B7280] mb-2">Click to upload a photo of your thermostat wiring</p>
            <p className="text-sm text-[#6B7280]">JPG or PNG, max 5MB</p>
          </div>
        ) : (
          <div className="text-center">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="Uploaded image"
              className="max-h-64 mx-auto mb-4 rounded-lg"
            />

            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-[#4B5563]">Analyzing terminals and wire connections...</p>
              </div>
            ) : ocrComplete && analysisResult ? (
              <div>
                {analysisResult.isThermostatImage ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-green-800">✅ Thermostat Detected</h4>
                      <button
                        onClick={toggleManualMode}
                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-colors"
                      >
                        {manualMode ? "Use Auto Detection" : "Switch to Manual"}
                      </button>
                    </div>

                    {!manualMode ? (
                      // Automatic detection mode
                      <div>
                        {analysisResult.detectedTerminals.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-medium text-green-800 mb-2">
                              Select terminals that have wires connected:
                            </h5>
                            <p className="text-sm text-green-700 mb-3">
                              We found {analysisResult.detectedTerminals.length} terminals. Check only those with actual
                              wires attached.
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                              {analysisResult.wireConnections?.map((connection) => {
                                const isSelected = selectedWires.includes(connection.terminal)

                                return (
                                  <label
                                    key={connection.terminal}
                                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                      isSelected
                                        ? "border-[#BAE5D4] bg-green-50"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => handleWireToggle(connection.terminal)}
                                      className="rounded"
                                    />
                                    <div className="flex-1">
                                      <span className="font-medium text-[#2D2D2D]">{connection.terminal}</span>
                                      {connection.wireColor && (
                                        <span className="text-xs text-gray-600 ml-2">
                                          ({connection.wireColor} wire)
                                        </span>
                                      )}
                                      <div className={`text-xs ${getConfidenceColor(connection.confidence)}`}>
                                        {Math.round(connection.confidence * 100)}% confidence
                                      </div>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>

                            <div className="mt-3 text-sm text-green-700">
                              Selected: {selectedWires.length} terminals with wires
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Manual selection mode
                      <div className="mb-4">
                        <h5 className="font-medium text-green-800 mb-2">Manually select terminals with wires:</h5>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {commonTerminals.map((terminal) => (
                            <button
                              key={terminal}
                              onClick={() => handleWireToggle(terminal)}
                              className={`px-3 py-1 rounded-full text-sm ${
                                selectedWires.includes(terminal)
                                  ? "bg-[#BAE5D4] text-[#2D2D2D]"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {terminal}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={newTerminal}
                            onChange={(e) => setNewTerminal(e.target.value.toUpperCase())}
                            placeholder="Custom terminal (e.g. X1)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                          />
                          <button
                            onClick={handleAddManualTerminal}
                            disabled={!newTerminal}
                            className="px-3 py-2 bg-[#2D2D2D] text-white rounded-md disabled:bg-gray-400"
                          >
                            Add
                          </button>
                        </div>

                        <div className="mt-3 text-sm text-green-700">
                          Selected: {selectedWires.length} terminals with wires
                        </div>
                      </div>
                    )}

                    {showRawAnalysis && analysisResult.rawAnalysis && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <h5 className="font-medium text-gray-800 mb-2">Detailed Analysis:</h5>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-60">
                          {analysisResult.rawAnalysis}
                        </pre>
                      </div>
                    )}

                    {analysisResult.reasons && analysisResult.reasons.length > 0 && (
                      <div className="mt-4 text-sm text-green-700">
                        <strong>Analysis notes:</strong>
                        <ul className="list-disc pl-5 mt-1">
                          {analysisResult.reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Unclear Image</h4>
                    <p className="text-yellow-700 text-sm">
                      We couldn't clearly identify this as a thermostat. Try taking a clearer photo or use manual
                      selection.
                    </p>
                    <button
                      onClick={toggleManualMode}
                      className="mt-2 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-full transition-colors"
                    >
                      Switch to Manual Selection
                    </button>
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <button onClick={triggerFileInput} className="text-[#2D2D2D] underline">
                    Try another photo
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {analysisResult?.detectedTerminals.length || manualMode ? (
          <InstallButton
            title={`Use Selected Wires (${selectedWires.length})`}
            onPress={handleConfirm}
            disabled={isProcessing || selectedWires.length === 0}
          />
        ) : (
          <InstallButton
            title={previewUrl ? "Continue with Photo" : "Upload Photo"}
            onPress={previewUrl ? handleConfirm : triggerFileInput}
            disabled={isProcessing}
            loading={isProcessing}
          />
        )}
        <InstallButton title="Skip - Select Wires Manually" onPress={onSkip} variant="secondary" />
      </div>
    </div>
  )
}

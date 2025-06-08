"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { InstallButton } from "./InstallButton"
import { PhotoGuide } from "./PhotoGuide"
import { TrainingFeedback } from "./TrainingFeedback"

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
  imageHash: string
  similarConfigurations?: any[]
}

export function WireDetection({ onWiresDetected, onSkip }: WireDetectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedWires, setSelectedWires] = useState<string[]>([])
  const [ocrComplete, setOcrComplete] = useState(false)
  const [showTrainingFeedback, setShowTrainingFeedback] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
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

    setOriginalFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    await processImage(file)
  }

  const processImage = async (file: File) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

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
        imageHash: "",
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
    // Show training feedback if we have analysis results
    if (analysisResult && originalFile) {
      setShowTrainingFeedback(true)
    } else {
      onWiresDetected(selectedWires)
    }
  }

  const handleTrainingSubmitted = () => {
    setShowTrainingFeedback(false)
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Smart Wire Detection</h3>

      <div className="mb-6">
        <p className="text-[#4B5563] mb-4">
          Take a clear photo of your thermostat wiring. Our AI learns from every installation to improve detection
          accuracy.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">🧠 AI Learning System:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your feedback helps improve detection for everyone</li>
            <li>• We compare against thousands of verified installations</li>
            <li>• Detection accuracy improves with each submission</li>
          </ul>
        </div>

        <PhotoGuide />

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
                <p className="text-[#4B5563]">Analyzing with AI and comparing to training database...</p>
              </div>
            ) : ocrComplete && analysisResult ? (
              <div>
                {analysisResult.isThermostatImage ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-green-800">✅ Thermostat Detected</h4>
                      <button
                        onClick={() => setManualMode(!manualMode)}
                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full transition-colors"
                      >
                        {manualMode ? "Use AI Detection" : "Manual Override"}
                      </button>
                    </div>

                    {analysisResult.similarConfigurations && analysisResult.similarConfigurations.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <h5 className="font-medium text-blue-800 mb-1">🔍 Training Data Match</h5>
                        <p className="text-sm text-blue-700">
                          Found {analysisResult.similarConfigurations.length} similar configurations in our database.
                          Detection enhanced with verified patterns.
                        </p>
                      </div>
                    )}

                    {!manualMode ? (
                      <div className="mb-4">
                        <h5 className="font-medium text-green-800 mb-2">AI-Detected Wire Connections:</h5>
                        <p className="text-sm text-green-700 mb-3">
                          Review and correct the detected connections. Your feedback improves our AI.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {analysisResult.wireConnections?.map((connection) => {
                            const isSelected = selectedWires.includes(connection.terminal)

                            return (
                              <label
                                key={connection.terminal}
                                className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  isSelected ? "border-[#BAE5D4] bg-green-50" : "border-gray-200 hover:border-gray-300"
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
                                    <span className="text-xs text-gray-600 ml-2">({connection.wireColor})</span>
                                  )}
                                  <div className={`text-xs ${getConfidenceColor(connection.confidence)}`}>
                                    {Math.round(connection.confidence * 100)}% confidence
                                  </div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <h5 className="font-medium text-green-800 mb-2">Manual Terminal Selection:</h5>
                        <div className="flex flex-wrap gap-2">
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
                      </div>
                    )}

                    <div className="mt-3 text-sm text-green-700">
                      Selected: {selectedWires.length} terminals with wires
                    </div>

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
                      We couldn't clearly identify this as a thermostat. Your feedback will help us improve detection.
                    </p>
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
        <InstallButton
          title={`Continue with Selected Wires (${selectedWires.length})`}
          onPress={handleConfirm}
          disabled={isProcessing || selectedWires.length === 0}
        />
        <InstallButton title="Skip - Select Wires Manually" onPress={onSkip} variant="secondary" />
      </div>

      {showTrainingFeedback && analysisResult && originalFile && (
        <TrainingFeedback
          originalImage={originalFile}
          imageUrl={previewUrl!}
          imageHash={analysisResult.imageHash}
          aiDetectedConnections={analysisResult.wireConnections}
          userSelectedWires={selectedWires}
          onSubmit={handleTrainingSubmitted}
          onSkip={handleTrainingSubmitted}
        />
      )}
    </div>
  )
}

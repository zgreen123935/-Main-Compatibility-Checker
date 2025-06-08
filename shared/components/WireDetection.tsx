"use client"

import type React from "react"

import { useState, useRef } from "react"
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
}

export function WireDetection({ onWiresDetected, onSkip }: WireDetectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedWires, setSelectedWires] = useState<string[]>([])
  const [ocrComplete, setOcrComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

      const response = await fetch("/api/analyze-wiring", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const analysis = {
          detectedTerminals: result.detectedTerminals || [],
          wireConnections: result.wireConnections || [],
          connectedWires: result.connectedWires || [],
          confidence: result.confidence,
          isThermostatImage: result.isThermostatImage,
          reasons: result.reasons || [],
        }
        setAnalysisResult(analysis)
        // Pre-select the detected connected wires
        setSelectedWires(analysis.connectedWires)
      } else {
        await performClientSideAnalysis(file)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      await performClientSideAnalysis(file)
    } finally {
      setIsProcessing(false)
      setOcrComplete(true)
    }
  }

  const performClientSideAnalysis = async (file: File) => {
    try {
      const { createWorker } = await import("tesseract.js")
      const worker = await createWorker()

      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_+",
        tessedit_pageseg_mode: "6",
      })

      const { data } = await worker.recognize(file)

      // Simple client-side analysis
      const terminals = findTerminalLabels(data.text)
      const analysis = {
        detectedTerminals: terminals,
        wireConnections: terminals.map((terminal) => ({
          terminal,
          hasWire: true, // Assume all detected terminals have wires for client-side
          confidence: 0.7,
        })),
        connectedWires: terminals,
        confidence: terminals.length > 0 ? 70 : 30,
        isThermostatImage: terminals.length > 0,
        reasons: terminals.length > 0 ? [`Found ${terminals.length} terminals`] : ["No terminals detected"],
      }

      setAnalysisResult(analysis)
      setSelectedWires(analysis.connectedWires)
      await worker.terminate()
    } catch (error) {
      console.error("Client-side analysis error:", error)
      setAnalysisResult({
        detectedTerminals: [],
        wireConnections: [],
        connectedWires: [],
        confidence: 0,
        isThermostatImage: false,
        reasons: ["Analysis failed"],
      })
    }
  }

  function findTerminalLabels(text: string): string[] {
    const normalizedText = text.toUpperCase()
    const terminals = [
      "R",
      "Rh",
      "Rc",
      "RH",
      "RC",
      "W",
      "W1",
      "W2",
      "Y",
      "Y1",
      "Y2",
      "G",
      "G1",
      "C",
      "COM",
      "O",
      "B",
      "O/B",
      "AUX",
      "AUX1",
      "AUX2",
      "ACC",
      "ACC+",
      "ACC-",
    ]

    return terminals.filter((terminal) => {
      const patterns = [new RegExp(`\\b${terminal}\\b`, "g"), new RegExp(`${terminal}\\s*(WIRE|TERMINAL)`, "g")]
      return patterns.some((pattern) => pattern.test(normalizedText))
    })
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Automatic Wire Detection</h3>

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
                    <h4 className="font-medium text-green-800 mb-3">✅ Thermostat Detected</h4>

                    {analysisResult.detectedTerminals.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-medium text-green-800 mb-2">Select terminals that have wires connected:</h5>
                        <p className="text-sm text-green-700 mb-3">
                          We found {analysisResult.detectedTerminals.length} terminals. Check only those with actual
                          wires attached.
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          {analysisResult.detectedTerminals.map((terminal) => {
                            const connection = analysisResult.wireConnections?.find((c) => c.terminal === terminal)
                            const isSelected = selectedWires.includes(terminal)

                            return (
                              <label
                                key={terminal}
                                className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  isSelected ? "border-[#BAE5D4] bg-green-50" : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleWireToggle(terminal)}
                                  className="rounded"
                                />
                                <div className="flex-1">
                                  <span className="font-medium text-[#2D2D2D]">{terminal}</span>
                                  {connection?.wireColor && (
                                    <span className="text-xs text-gray-600 ml-2">({connection.wireColor} wire?)</span>
                                  )}
                                  {connection && (
                                    <div className={`text-xs ${getConfidenceColor(connection.confidence)}`}>
                                      {Math.round(connection.confidence * 100)}% confidence
                                    </div>
                                  )}
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Unclear Image</h4>
                    <p className="text-yellow-700 text-sm">
                      We couldn't clearly identify this as a thermostat. Try taking a clearer photo or use manual
                      selection.
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
        {analysisResult?.detectedTerminals.length ? (
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

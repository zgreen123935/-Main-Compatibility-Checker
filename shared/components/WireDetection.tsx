"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { InstallButton } from "./InstallButton"
import { PhotoGuide } from "./PhotoGuide"
import { InteractiveTraining } from "./InteractiveTraining"

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
  const [showInteractiveTraining, setShowInteractiveTraining] = useState(false)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        reasons: ["Analysis failed. Please use interactive training to correct."],
        imageHash: "",
      })
    } finally {
      setIsProcessing(false)
      setOcrComplete(true)
    }
  }

  const handleStartTraining = () => {
    setShowInteractiveTraining(true)
  }

  const handleTrainingComplete = (correctedWires: string[]) => {
    setSelectedWires(correctedWires)
    setShowInteractiveTraining(false)
    onWiresDetected(correctedWires)
  }

  const handleQuickConfirm = () => {
    onWiresDetected(selectedWires)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
    setAnalysisResult(null)
    setOcrComplete(false)
    setSelectedWires([])
    setShowInteractiveTraining(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Smart Wire Detection & Training</h3>

      <div className="mb-6">
        <p className="text-[#4B5563] mb-4">
          Upload a photo and help train our AI by correcting any detection errors. Your corrections improve the system
          for everyone!
        </p>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">🎯 Interactive Training Mode:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click on terminals in your photo to mark wire connections</li>
            <li>• Correct any mistakes the AI made</li>
            <li>• Add terminals the AI missed</li>
            <li>• Your corrections train the AI for better future detection</li>
          </ul>
        </div>

        <PhotoGuide />

        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" ref={fileInputRef} />

        {!previewUrl ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#BAE5D4] transition-colors"
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
              className="max-h-64 mx-auto mb-4 rounded-lg border"
            />

            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-[#4B5563]">Analyzing image with AI...</p>
              </div>
            ) : ocrComplete && analysisResult ? (
              <div>
                {analysisResult.confidence > 50 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Detection Results</h4>
                    <p className="text-green-700 text-sm mb-3">
                      Confidence: {analysisResult.confidence}% | Found {analysisResult.connectedWires.length} wire
                      connections
                    </p>

                    {analysisResult.connectedWires.length > 0 && (
                      <div className="mb-3">
                        <strong className="text-green-800">Detected wires:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisResult.connectedWires.map((wire) => (
                            <span
                              key={wire}
                              className="bg-[#BAE5D4] text-[#2D2D2D] px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {wire}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleQuickConfirm}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                      >
                        ✓ Looks Correct
                      </button>
                      <button
                        onClick={handleStartTraining}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        🎯 Correct & Train
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Low Confidence Detection</h4>
                    <p className="text-yellow-700 text-sm mb-3">
                      Detection confidence: {analysisResult.confidence}%. Please help train the AI by marking the
                      correct connections.
                    </p>
                    <button
                      onClick={handleStartTraining}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                    >
                      🎯 Start Interactive Training
                    </button>
                  </div>
                )}

                <div className="flex gap-2 justify-center mt-3">
                  <button onClick={triggerFileInput} className="text-[#2D2D2D] underline text-sm">
                    Try another photo
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {!showInteractiveTraining && (
        <div className="flex flex-col gap-3">
          {analysisResult && selectedWires.length > 0 ? (
            <InstallButton
              title={`Continue with ${selectedWires.length} Selected Wires`}
              onPress={handleQuickConfirm}
              disabled={isProcessing}
            />
          ) : (
            <InstallButton
              title={previewUrl ? "Start Interactive Training" : "Upload Photo"}
              onPress={previewUrl ? handleStartTraining : triggerFileInput}
              disabled={isProcessing}
            />
          )}
          <InstallButton title="Skip - Select Wires Manually" onPress={onSkip} variant="secondary" />
        </div>
      )}

      {showInteractiveTraining && originalFile && previewUrl && (
        <InteractiveTraining
          imageFile={originalFile}
          imageUrl={previewUrl}
          initialDetection={analysisResult}
          onComplete={handleTrainingComplete}
          onCancel={() => setShowInteractiveTraining(false)}
        />
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"
import { PhotoGuide } from "../shared/components/PhotoGuide"
import { WireDetection } from "../shared/components/WireDetection"

interface AnalysisResult {
  isThermostatImage: boolean
  systemType: "heat-pump" | "conventional" | "unknown"
  detectedWires: string[]
  confidence: number
  reasons: string[]
  wireConnections?: { terminal: string; hasWire: boolean; confidence: number; wireColor?: string }[]
  connectedWires: any
}

export function UploadPhoto() {
  const { dispatch } = useInstall()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [detectedWires, setDetectedWires] = useState<string[]>([])
  const [showModeSelection, setShowModeSelection] = useState(true)
  const [selectedMode, setSelectedMode] = useState<"training" | "detection" | "skip" | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      dispatch({ type: "SET_PHOTO", url })
    }
  }

  const handleModeSelection = (mode: "training" | "detection" | "skip") => {
    setSelectedMode(mode)
    setShowModeSelection(false)
  }

  const handleWiresDetected = (wires: string[]) => {
    setDetectedWires(wires)
    // Store the detected wires for later use in wire identification step
    dispatch({ type: "SET_ANSWER", key: "detectedWires", value: wires })
  }

  const handleSystemConfirmation = (isHeatPump: boolean) => {
    dispatch({ type: "SET_ANSWER", key: "heatPump", value: isHeatPump })
    handleContinue()
  }

  const handleContinue = () => {
    dispatch({ type: "COMPLETE_STEP", step: "upload-photo" })
    dispatch({ type: "SET_STEP", step: "remove-cover" })
  }

  const handleSkip = () => {
    dispatch({ type: "COMPLETE_STEP", step: "upload-photo" })
    dispatch({ type: "SET_STEP", step: "remove-cover" })
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Document Your Wiring</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Take a photo of your current thermostat wiring. You can help train our AI or just get quick wire detection.
          </p>
        </div>

        {/* Mode Selection */}
        {showModeSelection && (
          <div className="mb-8">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-4 text-center">Choose your approach:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="border-2 rounded-lg p-4 cursor-pointer transition-colors border-gray-200 hover:border-[#BAE5D4] hover:bg-green-50"
                onClick={() => handleModeSelection("training")}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-medium text-[#2D2D2D] mb-2">AI Training Mode</h3>
                  <p className="text-sm text-[#4B5563]">
                    Upload photo, click on terminals to train AI, help improve detection for everyone
                  </p>
                </div>
              </div>

              <div
                className="border-2 rounded-lg p-4 cursor-pointer transition-colors border-gray-200 hover:border-[#BAE5D4] hover:bg-green-50"
                onClick={() => handleModeSelection("detection")}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🤖</div>
                  <h3 className="font-medium text-[#2D2D2D] mb-2">Smart Detection</h3>
                  <p className="text-sm text-[#4B5563]">
                    Upload photo, let AI detect wires automatically, quick review and continue
                  </p>
                </div>
              </div>

              <div
                className="border-2 rounded-lg p-4 cursor-pointer transition-colors border-gray-200 hover:border-[#BAE5D4] hover:bg-green-50"
                onClick={() => handleModeSelection("skip")}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">⏭️</div>
                  <h3 className="font-medium text-[#2D2D2D] mb-2">Skip Photo</h3>
                  <p className="text-sm text-[#4B5563]">
                    Skip photo upload, manually select wires later in the process
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skip Mode */}
        {selectedMode === "skip" && (
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="text-4xl mb-4">⏭️</div>
              <h3 className="text-lg font-medium text-[#2D2D2D] mb-2">Photo Skipped</h3>
              <p className="text-[#4B5563]">
                You'll be able to manually select your wires later in the installation process.
              </p>
            </div>
            <InstallButton title="Continue" onPress={handleContinue} className="w-full" />
          </div>
        )}

        {/* Training or Detection Mode */}
        {(selectedMode === "training" || selectedMode === "detection") && (
          <>
            <PhotoGuide />

            <WireDetection
              onWiresDetected={handleWiresDetected}
              onSkip={handleSkip}
              trainingMode={selectedMode === "training"}
              onSystemDetected={(systemType) => {
                if (systemType !== "unknown") {
                  dispatch({ type: "SET_ANSWER", key: "heatPump", value: systemType === "heat-pump" })
                }
              }}
            />

            {detectedWires.length > 0 && (
              <div className="mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-800 mb-2">✅ Wires Detected & Saved</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Found {detectedWires.length} wire connections. These will be pre-selected in the wire identification
                    step.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {detectedWires.map((wire) => (
                      <span
                        key={wire}
                        className="bg-[#BAE5D4] text-[#2D2D2D] px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {wire}
                      </span>
                    ))}
                  </div>
                </div>
                <InstallButton title="Continue with Detected Wires" onPress={handleContinue} className="w-full" />
              </div>
            )}
          </>
        )}

        {/* Back to mode selection */}
        {!showModeSelection && selectedMode !== "skip" && detectedWires.length === 0 && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setShowModeSelection(true)
                setSelectedMode(null)
                setPreviewUrl(null)
                setSelectedFile(null)
              }}
              className="text-[#2D2D2D] underline"
            >
              ← Back to mode selection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { InstallButton } from "./InstallButton"
import { PhotoGuide } from "./PhotoGuide"
import { InteractiveTraining } from "./InteractiveTraining"
import { useInstall } from "../context/InstallContext"

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
}

interface WireDetectionProps {
  onWiresDetected: (wires: string[], analysisResult?: any) => void
  onSkip: () => void
  trainingMode?: boolean
  onSystemDetected?: (systemType: "heat-pump" | "conventional" | "unknown") => void
}

interface AnalysisResult {
  detectedTerminals: string[]
  wireConnections: WireConnection[]
  connectedWires: string[]
  jumperConnections?: { fromTerminal: string; toTerminal: string }[]
  confidence: number
  isThermostatImage: boolean
  reasons: string[]
  imageHash: string
  similarConfigurations?: any[]
  exactMatch?: any
  trainingSource?: "exact_match" | "similar_images" | "ai_only"
}

export function WireDetection({ onWiresDetected, onSkip, trainingMode = false, onSystemDetected }: WireDetectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedWires, setSelectedWires] = useState<string[]>([])
  const [ocrComplete, setOcrComplete] = useState(false)
  const [showInteractiveTraining, setShowInteractiveTraining] = useState(false)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { dispatch } = useInstall()

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
    setErrorMessage(null)

    if (trainingMode) {
      // In training mode, go directly to interactive training
      setShowInteractiveTraining(true)
    } else {
      // In smart detection mode, analyze first
      await processImage(file)
    }
  }

  const processImage = async (file: File) => {
    setIsProcessing(true)
    setErrorMessage(null)

    try {
      console.log("Starting image processing...")

      const formData = new FormData()
      formData.append("image", file)

      console.log("Sending request to /api/analyze-wiring...")

      const response = await fetch("/api/analyze-wiring", {
        method: "POST",
        body: formData,
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("Analysis result:", result)

        setAnalysisResult(result)

        // Notify parent of system type detection
        if (onSystemDetected && result.systemType) {
          onSystemDetected(result.systemType)
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("API error:", errorData)
        throw new Error(errorData.details || errorData.error || "Analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      const errorMsg = error instanceof Error ? error.message : "Analysis failed"
      setErrorMessage(errorMsg)

      setAnalysisResult({
        detectedTerminals: [],
        wireConnections: [],
        connectedWires: [],
        confidence: 0,
        isThermostatImage: false,
        reasons: [`Analysis failed: ${errorMsg}. Please use interactive training to correct.`],
        imageHash: "",
        trainingSource: "ai_only",
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
    // Save the selected wires without resetting previous selections
    setSelectedWires((prev) => {
      // Combine previous selections with new ones, removing duplicates
      const combined = [...new Set([...prev, ...correctedWires])]
      return combined
    })
    setShowInteractiveTraining(false)
    onWiresDetected(correctedWires, analysisResult)
  }

  const handleQuickConfirm = async () => {
    // Save confirmation as training data
    if (analysisResult && selectedWires.length > 0) {
      try {
        const confirmationTrainingData = {
          imageUrl: previewUrl,
          imageHash: analysisResult.imageHash,
          userVerifiedConnections: selectedWires.map((wire, index) => ({
            terminal: wire,
            hasWire: true,
            wireColor: "confirmed", // Mark as confirmed AI suggestion
            confidence: 0.9,
            x: 50 + index * 5,
            y: 50 + index * 5,
          })),
          jumperConnections: analysisResult.jumperConnections || [],
          aiDetectedConnections: analysisResult.wireConnections || [],
          systemType: analysisResult.systemType || "unknown",
          imageQuality: "good",
          userFeedback: "User confirmed AI suggestions",
          correctionType: "ai_confirmation",
          isComplete: true,
          timestamp: Date.now(),
          learningMetadata: {
            userMadeCorrections: false,
            aiAccuracy: 1.0, // User confirmed, so AI was 100% accurate
            trainingType: "confirmatory",
            confidenceBoost: 0.15,
          },
        }

        // Save the confirmation as training data
        await fetch("/api/wire-training", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submit_training",
            data: confirmationTrainingData,
          }),
        })

        console.log("AI confirmation saved as training data")
      } catch (error) {
        console.error("Failed to save confirmation training:", error)
      }
    }

    // Set automated decisions and notify parent
    if (analysisResult) {
      const hasCWire =
        selectedWires.includes("C") ||
        analysisResult.wireConnections?.some((w: any) => w.terminal?.toUpperCase() === "C" && w.hasWire)

      const hasJumpers = analysisResult.jumperConnections && analysisResult.jumperConnections.length > 0

      // Store automated decisions in context
      dispatch({
        type: "SET_ANSWER",
        key: "automatedDecisions",
        value: {
          hasCWireDetected: hasCWire,
          hasJumpersDetected: hasJumpers,
          detectedWires: selectedWires,
          detectedJumpers: analysisResult.jumperConnections || [],
        },
      })

      console.log("WireDetection - Setting automated decisions:", {
        hasCWireDetected: hasCWire,
        hasJumpersDetected: hasJumpers,
        detectedWires: selectedWires,
      })
    }

    onWiresDetected(selectedWires, analysisResult)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
    setAnalysisResult(null)
    setOcrComplete(false)
    setSelectedWires([])
    setShowInteractiveTraining(false)
    setErrorMessage(null)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const renderAnalysisResult = () => {
    if (!analysisResult) return null

    // Handle error case
    if (errorMessage) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-red-800 mb-2">❌ Analysis Error</h4>
          <p className="text-red-700 text-sm mb-3">{errorMessage}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleStartTraining}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              🎯 Use Interactive Training
            </button>
            <button
              onClick={triggerFileInput}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
            >
              📷 Try Another Photo
            </button>
          </div>
        </div>
      )
    }

    // Handle exact match case
    if (analysisResult.trainingSource === "exact_match" && analysisResult.exactMatch) {
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-purple-800 mb-2">🎯 Exact Match Found!</h4>
          <p className="text-purple-700 text-sm mb-3">
            This exact image was previously trained on{" "}
            {new Date(analysisResult.exactMatch.timestamp).toLocaleDateString()}. Using your previous selections.
          </p>

          {analysisResult.connectedWires.length > 0 && (
            <div className="mb-3">
              <strong className="text-purple-800">Your previous training:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysisResult.connectedWires.map((wire) => (
                  <span key={wire} className="bg-[#BAE5D4] text-[#2D2D2D] px-2 py-1 rounded-full text-xs font-medium">
                    {wire}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleQuickConfirm}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              ✓ Use Previous Training
            </button>
            <button
              onClick={handleStartTraining}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              🎯 Retrain This Image
            </button>
          </div>
        </div>
      )
    }

    // Handle AI detection with similarity matching
    if (analysisResult.confidence > 50) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-green-800 mb-2">
            ✅ Detection Results
            {analysisResult.trainingSource === "similar_images" && " (Enhanced by Training Data)"}
          </h4>
          <p className="text-green-700 text-sm mb-3">
            Confidence: {analysisResult.confidence}% | Found {analysisResult.connectedWires.length} wire connections
            {analysisResult.similarConfigurations &&
              analysisResult.similarConfigurations.length > 0 &&
              ` | Based on ${analysisResult.similarConfigurations.length} similar trained images`}
          </p>

          {analysisResult.connectedWires.length > 0 && (
            <div className="mb-3">
              <strong className="text-green-800">Detected wires:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysisResult.connectedWires.map((wire) => (
                  <span key={wire} className="bg-[#BAE5D4] text-[#2D2D2D] px-2 py-1 rounded-full text-xs font-medium">
                    {wire}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysisResult.jumperConnections && analysisResult.jumperConnections.length > 0 && (
            <div className="mb-3">
              <strong className="text-amber-800">Detected jumpers:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysisResult.jumperConnections.map((jumper, idx) => (
                  <span key={idx} className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                    {jumper.fromTerminal} → {jumper.toTerminal}
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
      )
    }

    // Handle low confidence detection
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-yellow-800 mb-2">⚠️ Low Confidence Detection</h4>
        <p className="text-yellow-700 text-sm mb-3">
          Detection confidence: {analysisResult.confidence}%. Please help train the AI by marking the correct
          connections.
        </p>
        <button
          onClick={handleStartTraining}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
        >
          🎯 Start Interactive Training
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">
        {trainingMode ? "AI Training Mode" : "Smart Wire Detection"}
      </h3>

      <div className="mb-6">
        {trainingMode ? (
          <p className="text-[#4B5563] mb-4">
            Upload a photo and click directly on wire terminals to train our AI. Your training helps improve detection
            for everyone!
          </p>
        ) : (
          <p className="text-[#4B5563] mb-4">
            Upload a photo and our AI will automatically detect wire connections. If you've trained this image before,
            we'll remember your previous selections!
          </p>
        )}

        <PhotoGuide />

        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" ref={fileInputRef} />

        {!previewUrl ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#BAE5D4] transition-colors"
            onClick={triggerFileInput}
          >
            <div className="text-6xl mb-4">📷</div>
            <p className="text-[#6B7280] mb-2">
              {trainingMode ? "Upload photo to start training" : "Upload photo for AI detection"}
            </p>
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
                <p className="text-sm text-[#6B7280]">Checking for previous training data...</p>
              </div>
            ) : ocrComplete && analysisResult && !trainingMode ? (
              <div>
                {renderAnalysisResult()}

                <div className="flex gap-2 justify-center mt-3">
                  <button onClick={triggerFileInput} className="text-[#2D2D2D] underline text-sm">
                    Try another photo
                  </button>
                </div>
              </div>
            ) : trainingMode ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-purple-800 mb-2">🎯 Ready for Training</h4>
                <p className="text-purple-700 text-sm mb-3">
                  Click "Start Interactive Training" to begin marking wire connections on your photo.
                </p>
                <button
                  onClick={handleStartTraining}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                >
                  🎯 Start Interactive Training
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {!showInteractiveTraining && !trainingMode && (
        <div className="flex flex-col gap-3">
          {analysisResult && selectedWires.length > 0 && !errorMessage ? (
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

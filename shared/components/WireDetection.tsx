"use client"

import type React from "react"

import { useState, useRef } from "react"
import { InstallButton } from "./InstallButton"
import { useInstall } from "../context/InstallContext"
import { PhotoGuide } from "./PhotoGuide"

interface WireDetectionProps {
  onWiresDetected: (wires: string[]) => void
  onSkip: () => void
}

interface AnalysisResult {
  detectedWires: string[]
  confidence: number
  isThermostatImage: boolean
  reasons: string[]
}

export function WireDetection({ onWiresDetected, onSkip }: WireDetectionProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [ocrComplete, setOcrComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { state } = useInstall()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Process the image with OCR
    await processImage(file)
  }

  const processImage = async (file: File) => {
    setIsProcessing(true)

    try {
      // Use the server API for analysis
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/analyze-wiring", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setAnalysisResult({
          detectedWires: result.detectedWires || [],
          confidence: result.confidence,
          isThermostatImage: result.isThermostatImage,
          reasons: result.reasons || [],
        })
      } else {
        // Fallback to client-side analysis if API fails
        await performClientSideAnalysis(file)
      }
    } catch (error) {
      console.error("Analysis error:", error)
      // Fallback to client-side analysis
      await performClientSideAnalysis(file)
    } finally {
      setIsProcessing(false)
      setOcrComplete(true)
    }
  }

  const performClientSideAnalysis = async (file: File) => {
    try {
      // Import Tesseract.js dynamically to avoid SSR issues
      const { createWorker } = await import("tesseract.js")
      const worker = await createWorker()

      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_",
        tessedit_pageseg_mode: "6", // Assume a single uniform block of text
      })

      const { data } = await worker.recognize(file)

      // Thermostat wire labels - expanded to include more variations
      const thermostatWireLabels = [
        "R",
        "Rh",
        "Rc",
        "W",
        "W1",
        "W2",
        "Y",
        "Y1",
        "Y2",
        "G",
        "G1",
        "C",
        "O",
        "B",
        "E",
        "AUX",
        "COM",
        "COMMON",
        "HEAT",
        "COOL",
        "FAN",
        "PWR",
        "POWER",
        "24V",
        "24VAC",
      ]

      // Find wire labels with more flexible matching
      const detectedWires = findWireLabelsEnhanced(data.text, thermostatWireLabels)

      // More lenient detection for thermostat images
      const isThermostatImage = detectedWires.length > 0 || /thermostat|hvac|heat|cool|wire|terminal/i.test(data.text)

      setAnalysisResult({
        detectedWires,
        confidence: detectedWires.length > 0 ? 70 : 30,
        isThermostatImage,
        reasons:
          detectedWires.length > 0
            ? [`Found ${detectedWires.length} wire labels`]
            : ["No wire labels detected, but may be a thermostat"],
      })

      await worker.terminate()
    } catch (error) {
      console.error("Client-side analysis error:", error)
      setAnalysisResult({
        detectedWires: [],
        confidence: 0,
        isThermostatImage: false,
        reasons: ["Analysis failed - please try again or use manual selection"],
      })
    }
  }

  function findWireLabelsEnhanced(text: string, labelList: string[]): string[] {
    const normalizedText = text.toUpperCase()
    const foundLabels: string[] = []

    // First try exact matches with word boundaries
    labelList.forEach((label) => {
      // More flexible pattern matching for wire labels
      const patterns = [
        new RegExp(`(^|[^A-Z0-9])${label}([^A-Z0-9]|$)`, "g"), // Standard boundary match
        new RegExp(`${label}\\s*(WIRE|TERMINAL)`, "g"), // Label followed by WIRE or TERMINAL
        new RegExp(`(WIRE|TERMINAL)\\s*${label}`, "g"), // WIRE or TERMINAL followed by label
        new RegExp(`${label}\\s*:\\s*`, "g"), // Label followed by colon
        new RegExp(`"${label}"`, "g"), // Label in quotes
        new RegExp(`\$$${label}\$$`, "g"), // Label in parentheses
      ]

      if (patterns.some((pattern) => pattern.test(normalizedText))) {
        foundLabels.push(label)
      }
    })

    // Then try more aggressive matching for single-letter labels (R, W, Y, G, C, O, B)
    const singleLetterLabels = labelList.filter((label) => label.length === 1)
    singleLetterLabels.forEach((label) => {
      // Look for isolated occurrences of the letter that might be wire labels
      const matches = normalizedText.match(new RegExp(`[^A-Z]${label}[^A-Z]`, "g"))
      if (matches && matches.length > 0 && !foundLabels.includes(label)) {
        foundLabels.push(label)
      }
    })

    return [...new Set(foundLabels)] // Remove duplicates
  }

  const handleConfirm = () => {
    if (analysisResult && analysisResult.detectedWires.length > 0) {
      onWiresDetected(analysisResult.detectedWires)
    } else {
      // If no wires detected but user confirms, just continue
      onSkip()
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
    setAnalysisResult(null)
    setOcrComplete(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-medium text-[#2D2D2D] mb-4">Automatic Wire Detection</h3>

      <div className="mb-6">
        <p className="text-[#4B5563] mb-4">
          Take a clear photo of your thermostat wiring terminals with labels visible. Our system will try to identify
          the wire connections automatically.
        </p>

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
                <p className="text-[#4B5563]">Analyzing image...</p>
              </div>
            ) : ocrComplete && analysisResult ? (
              <div>
                {analysisResult.detectedWires.length > 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Wires Detected</h4>
                    <div>
                      <p className="font-medium text-green-800 mb-2">Detected Wires:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {analysisResult.detectedWires.map((wire) => (
                          <span key={wire} className="bg-[#BAE5D4] text-[#2D2D2D] px-3 py-1 rounded-full font-medium">
                            {wire}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ No Wire Labels Detected</h4>
                    <p className="text-yellow-700 text-sm">
                      We couldn't identify specific wire labels. Try taking a clearer photo or use manual selection.
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
        {analysisResult?.detectedWires.length ? (
          <InstallButton title="Use Detected Wires" onPress={handleConfirm} disabled={isProcessing} />
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

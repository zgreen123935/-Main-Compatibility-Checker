"use client"

import type React from "react"

import { useState, useRef } from "react"
import { InstallButton } from "./InstallButton"
import { createWorker } from "tesseract.js"
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

  // Common thermostat wire labels to look for
  const thermostatWireLabels = ["R", "Rh", "Rc", "W", "W1", "W2", "Y", "Y1", "Y2", "G", "C", "O", "B", "E", "AUX"]

  // Keywords that suggest this is a thermostat image
  const thermostatKeywords = ["THERMOSTAT", "HVAC", "HEAT", "COOL", "FAN", "TERMINAL", "WIRE"]

  // Keywords that suggest this is NOT a thermostat image
  const nonThermostatKeywords = [
    "SPREADSHEET",
    "EXCEL",
    "TABLE",
    "CHART",
    "GRAPH",
    "DOCUMENT",
    "PDF",
    "INVOICE",
    "RECEIPT",
    "MENU",
    "PRICE",
    "COST",
    "TOTAL",
    "SUM",
    "EMAIL",
    "MESSAGE",
    "TEXT",
    "PARAGRAPH",
    "ARTICLE",
    "BOOK",
  ]

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
    await processImage(url)
  }

  const processImage = async (imageUrl: string) => {
    setIsProcessing(true)

    try {
      // Initialize Tesseract.js worker
      const worker = await createWorker()

      // Set options to optimize for thermostat terminal labels
      await worker.setParameters({
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_",
      })

      // Recognize text in the image
      const { data } = await worker.recognize(imageUrl)

      // Analyze the results
      const result = analyzeImageContent(data.text, data.confidence)
      setAnalysisResult(result)

      // Terminate worker to free memory
      await worker.terminate()
      setOcrComplete(true)
    } catch (error) {
      console.error("OCR processing error:", error)
      alert("Error processing image. Please try again or use manual selection.")
    } finally {
      setIsProcessing(false)
    }
  }

  const analyzeImageContent = (text: string, confidence: number): AnalysisResult => {
    const normalizedText = text.toUpperCase()
    const reasons: string[] = []

    // Check for thermostat-specific wire labels
    const detectedWires = findWireLabels(text, thermostatWireLabels)

    // Check for thermostat-related keywords
    const hasThermostatKeywords = thermostatKeywords.some((keyword) => normalizedText.includes(keyword))

    // Check for non-thermostat keywords
    const hasNonThermostatKeywords = nonThermostatKeywords.some((keyword) => normalizedText.includes(keyword))

    // Calculate confidence that this is a thermostat image
    let thermostatConfidence = 0

    // Wire labels found (strong indicator)
    if (detectedWires.length >= 2) {
      thermostatConfidence += 40
      reasons.push(`Found ${detectedWires.length} wire labels`)
    } else if (detectedWires.length === 1) {
      thermostatConfidence += 15
      reasons.push(`Found 1 wire label`)
    }

    // Thermostat keywords found
    if (hasThermostatKeywords) {
      thermostatConfidence += 20
      reasons.push("Contains thermostat-related text")
    }

    // Non-thermostat keywords found (negative indicator)
    if (hasNonThermostatKeywords) {
      thermostatConfidence -= 30
      reasons.push("Contains non-thermostat content")
    }

    // OCR confidence factor
    if (confidence < 50) {
      thermostatConfidence -= 10
      reasons.push("Low image quality detected")
    }

    // Text length analysis (thermostats usually have minimal text)
    const wordCount = normalizedText.split(/\s+/).length
    if (wordCount > 50) {
      thermostatConfidence -= 15
      reasons.push("Too much text for a thermostat")
    }

    // Check for common thermostat wire patterns
    const hasWirePattern = /[RWYGOBC]\d*\s*[-:]\s*[RWYGOBC]\d*/i.test(text)
    if (hasWirePattern) {
      thermostatConfidence += 25
      reasons.push("Found wire connection patterns")
    }

    const isThermostatImage = thermostatConfidence >= 30 && detectedWires.length >= 1

    return {
      detectedWires,
      confidence: Math.max(0, Math.min(100, thermostatConfidence)),
      isThermostatImage,
      reasons,
    }
  }

  const findWireLabels = (text: string, labelList: string[]): string[] => {
    const normalizedText = text.toUpperCase().replace(/\s/g, "")
    const foundLabels: string[] = []

    labelList.forEach((label) => {
      // More strict pattern matching for wire labels
      const regex = new RegExp(`(^|[^A-Z0-9])${label}([^A-Z0-9]|$)`, "g")
      if (regex.test(normalizedText)) {
        foundLabels.push(label)
      }
    })

    return [...new Set(foundLabels)] // Remove duplicates
  }

  const handleConfirm = () => {
    if (analysisResult && analysisResult.isThermostatImage) {
      onWiresDetected(analysisResult.detectedWires)
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
                {analysisResult.isThermostatImage ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Thermostat Detected</h4>
                    <p className="text-green-700 text-sm mb-3">
                      Confidence: {analysisResult.confidence}% - {analysisResult.reasons.join(", ")}
                    </p>
                    {analysisResult.detectedWires.length > 0 ? (
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
                    ) : (
                      <p className="text-green-700">
                        No specific wire labels detected, but image appears to be a thermostat.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-red-800 mb-2">⚠️ Not a Thermostat Image</h4>
                    <p className="text-red-700 text-sm mb-3">
                      This doesn't appear to be a thermostat wiring photo. Reasons: {analysisResult.reasons.join(", ")}
                    </p>
                    <p className="text-red-700 text-sm">
                      Please upload a clear photo of your thermostat's wiring terminals, or use manual selection.
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
        {analysisResult?.isThermostatImage && analysisResult.detectedWires.length > 0 ? (
          <InstallButton title="Use Detected Wires" onPress={handleConfirm} disabled={isProcessing} />
        ) : (
          <InstallButton
            title="Upload Photo"
            onPress={triggerFileInput}
            disabled={isProcessing}
            loading={isProcessing}
          />
        )}
        <InstallButton title="Skip - Select Wires Manually" onPress={onSkip} variant="secondary" />
      </div>
    </div>
  )
}

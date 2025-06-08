"use client"

import type React from "react"

import { useState } from "react"
import { InstallButton } from "../shared/components/InstallButton"
import { useInstall } from "../shared/context/InstallContext"
import { PhotoGuide } from "../shared/components/PhotoGuide"

interface AnalysisResult {
  isThermostatImage: boolean
  systemType: "heat-pump" | "conventional" | "unknown"
  detectedWires: string[]
  confidence: number
  reasons: string[]
}

export function UploadPhoto() {
  const { dispatch } = useInstall()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

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

      // Analyze the image properly
      await analyzeImage(file)
    }
  }

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)

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
          isThermostatImage: result.isThermostatImage,
          systemType: result.systemType,
          detectedWires: result.detectedWires || [],
          confidence: result.confidence,
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
      setIsAnalyzing(false)
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
      const result = analyzeImageContent(data.text, data.confidence)
      setAnalysisResult(result)

      await worker.terminate()
    } catch (error) {
      console.error("Client-side analysis error:", error)
      // Set a default "unknown" result if analysis fails
      setAnalysisResult({
        isThermostatImage: false,
        systemType: "unknown",
        detectedWires: [],
        confidence: 0,
        reasons: ["Analysis failed - please use manual selection"],
      })
    }
  }

  const analyzeImageContent = (text: string, ocrConfidence: number): AnalysisResult => {
    const normalizedText = text.toUpperCase()
    const reasons: string[] = []

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
    const detectedWires = findWireLabelsEnhanced(text, thermostatWireLabels)

    // Thermostat indicators - expanded list
    const thermostatKeywords = [
      "THERMOSTAT",
      "HVAC",
      "HEAT",
      "COOL",
      "FAN",
      "TERMINAL",
      "WIRE",
      "WIRING",
      "FURNACE",
      "AC",
      "AIR",
      "CONDITIONING",
      "SYSTEM",
      "CONTROL",
      "TEMPERATURE",
      "HONEYWELL",
      "NEST",
      "ECOBEE",
      "MYSA",
      "EMERSON",
      "CARRIER",
      "TRANE",
    ]
    const hasThermostatKeywords = thermostatKeywords.some((keyword) => normalizedText.includes(keyword))

    // Non-thermostat indicators
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
      "AMOUNT",
      "EMAIL",
      "MESSAGE",
      "TEXT",
      "PARAGRAPH",
      "ARTICLE",
      "BOOK",
      "PAGE",
      "CELL",
      "ROW",
      "COLUMN",
      "FORMULA",
      "FUNCTION",
      "DATA",
      "REPORT",
      "FEATURE",
      "CATEGORY",
      "HARDWARE",
      "SOFTWARE",
      "COMPATIBILITY",
    ]
    const hasNonThermostatKeywords = nonThermostatKeywords.some((keyword) => normalizedText.includes(keyword))

    // Calculate confidence
    let confidence = 0

    // Wire label analysis - more weight on this
    if (detectedWires.length >= 3) {
      confidence += 60
      reasons.push(`Found ${detectedWires.length} wire labels`)
    } else if (detectedWires.length === 2) {
      confidence += 40
      reasons.push(`Found ${detectedWires.length} wire labels`)
    } else if (detectedWires.length === 1) {
      confidence += 20
      reasons.push("Found 1 wire label")
    }

    // Keyword analysis
    if (hasThermostatKeywords) {
      confidence += 25
      reasons.push("Contains thermostat-related text")
    }

    if (hasNonThermostatKeywords) {
      confidence -= 40
      reasons.push("Contains non-thermostat content")
    }

    // Text pattern analysis - look for common thermostat wiring patterns
    const wirePatterns = [
      /[RWYGOBC]\d*\s*[-:→]\s*[A-Z]/i, // R -> Y pattern
      /[RWYGOBC]\d*\s*terminal/i, // R terminal pattern
      /terminal\s*[RWYGOBC]\d*/i, // terminal R pattern
      /[RWYGOBC]\d*\s*wire/i, // R wire pattern
      /wire\s*[RWYGOBC]\d*/i, // wire R pattern
    ]

    const hasWirePattern = wirePatterns.some((pattern) => pattern.test(text))
    if (hasWirePattern) {
      confidence += 25
      reasons.push("Found wire connection patterns")
    }

    // Visual analysis - look for terminal-like layout
    const hasTerminalLayout =
      /[RWYGOBC]\s+[RWYGOBC]\s+[RWYGOBC]/i.test(text) || /[RWYGOBC]\n[RWYGOBC]\n[RWYGOBC]/i.test(text)
    if (hasTerminalLayout) {
      confidence += 20
      reasons.push("Found terminal-like layout")
    }

    // Text density analysis - relaxed for real thermostats which may have instructions
    const wordCount = normalizedText.split(/\s+/).filter((word) => word.length > 0).length
    if (wordCount > 200) {
      confidence -= 25
      reasons.push("Too much text for a thermostat")
    }

    // OCR quality factor - relaxed threshold
    if (ocrConfidence < 40) {
      confidence -= 10
      reasons.push("Low image quality")
    }

    // Number pattern analysis (spreadsheets often have many numbers)
    const numberMatches = text.match(/\d+/g) || []
    if (numberMatches.length > 30) {
      confidence -= 20
      reasons.push("Contains many numbers (typical of spreadsheets)")
    }

    // Final confidence calculation
    confidence = Math.max(0, Math.min(100, confidence))

    // Determine if this is a thermostat image - more lenient criteria
    // Either high confidence OR multiple wire labels
    const isThermostatImage = (confidence >= 30 && !hasNonThermostatKeywords) || detectedWires.length >= 2

    // Analyze system type
    let systemType: "heat-pump" | "conventional" | "unknown" = "unknown"
    if (isThermostatImage) {
      if (detectedWires.includes("O") || detectedWires.includes("B")) {
        systemType = "heat-pump"
      } else if (detectedWires.includes("W") || detectedWires.includes("W1") || detectedWires.includes("HEAT")) {
        systemType = "conventional"
      }
    }

    return {
      isThermostatImage,
      systemType,
      detectedWires,
      confidence,
      reasons,
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

  const handleRetakePhoto = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setAnalysisResult(null)
    setIsAnalyzing(false)
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-[#2D2D2D] mb-6">Document Your Wiring</h1>
          <p className="text-[#4B5563] leading-relaxed">
            Take a photo of your current thermostat wiring. Make sure all wires and labels are clearly visible—this will
            help later when connecting wires to your new Mysa.
          </p>
        </div>

        <PhotoGuide />

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8">
          {previewUrl ? (
            <div>
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Wiring photo preview"
                className="max-w-full h-64 object-contain mx-auto mb-4 rounded"
              />

              {isAnalyzing ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-[#BAE5D4] border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-[#4B5563]">Analyzing image...</p>
                </div>
              ) : analysisResult ? (
                <div>
                  {analysisResult.isThermostatImage ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h3 className="font-medium text-green-800 mb-2">✅ Thermostat Detected</h3>
                      <p className="text-green-700 mb-3">
                        Confidence: {analysisResult.confidence}% - {analysisResult.reasons.join(", ")}
                      </p>
                      {analysisResult.systemType !== "unknown" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h3 className="font-medium text-blue-800 mb-2">System Detection Results:</h3>
                          <p className="text-blue-700 mb-3">
                            We detected what appears to be a{" "}
                            {analysisResult.systemType === "heat-pump" ? "heat pump" : "conventional"} system. Is this
                            correct?
                          </p>
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleSystemConfirmation(analysisResult.systemType === "heat-pump")}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Yes, that's correct
                            </button>
                            <button
                              onClick={() => handleSystemConfirmation(analysisResult.systemType !== "heat-pump")}
                              className="bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-lg hover:bg-blue-50"
                            >
                              No, it's a {analysisResult.systemType === "heat-pump" ? "conventional" : "heat pump"}{" "}
                              system
                            </button>
                          </div>
                        </div>
                      )}
                      {analysisResult.detectedWires.length > 0 && (
                        <div>
                          <p className="font-medium text-green-800 mb-2">Detected Wires:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {analysisResult.detectedWires.map((wire) => (
                              <span
                                key={wire}
                                className="bg-[#BAE5D4] text-[#2D2D2D] px-3 py-1 rounded-full font-medium"
                              >
                                {wire}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h3 className="font-medium text-yellow-800 mb-2">⚠️ Thermostat Detection Uncertain</h3>
                      <p className="text-yellow-700 text-sm mb-3">
                        We're not sure if this is a thermostat wiring photo. Reasons:{" "}
                        {analysisResult.reasons.join(", ")}
                      </p>
                      <p className="text-yellow-700 text-sm">
                        You can try another photo or continue with this one if you're sure it shows your thermostat
                        wiring.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    <button onClick={handleRetakePhoto} className="text-[#2D2D2D] underline">
                      Try another photo
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-green-600 font-medium">Photo uploaded successfully!</p>
              )}
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">📷</div>
              <p className="text-[#6B7280] mb-4">Upload a photo of your current wiring</p>
              <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="photo-upload" />
              <label
                htmlFor="photo-upload"
                className="inline-block bg-[#2D2D2D] text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
              >
                Choose Photo
              </label>
              <p className="text-sm text-[#6B7280] mt-2">JPG or PNG, max 5MB</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!isAnalyzing && (!analysisResult || analysisResult.systemType === "unknown") && (
            <InstallButton
              title={selectedFile ? "Continue with Photo" : "Continue"}
              onPress={handleContinue}
              className="w-full"
            />
          )}

          <InstallButton
            title="Skip (I already documented)"
            onPress={handleSkip}
            variant="secondary"
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

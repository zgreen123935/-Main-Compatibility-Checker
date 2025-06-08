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
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_+",
        tessedit_pageseg_mode: "6",
        tessedit_ocr_engine_mode: "1",
      })

      const { data } = await worker.recognize(file)
      const result = analyzeImageContentAdvanced(data.text, data.confidence)
      setAnalysisResult(result)

      await worker.terminate()
    } catch (error) {
      console.error("Client-side analysis error:", error)
      setAnalysisResult({
        isThermostatImage: false,
        systemType: "unknown",
        detectedWires: [],
        confidence: 0,
        reasons: ["Analysis failed - please use manual selection"],
      })
    }
  }

  const analyzeImageContentAdvanced = (text: string, ocrConfidence: number): AnalysisResult => {
    const normalizedText = text.toUpperCase()
    const reasons: string[] = []

    // Comprehensive thermostat wire labels
    const thermostatWireLabels = [
      "R",
      "Rh",
      "Rc",
      "RH",
      "RC",
      "W",
      "W1",
      "W2",
      "W3",
      "Y",
      "Y1",
      "Y2",
      "Y3",
      "G",
      "G1",
      "G2",
      "C",
      "COM",
      "COMMON",
      "O",
      "B",
      "O/B",
      "OB",
      "E",
      "AUX",
      "AUX1",
      "AUX2",
      "ACC",
      "ACC+",
      "ACC-",
      "ACCP",
      "ACCM",
      "DEHUM",
      "HUM",
      "HUMID",
      "24V",
      "24VAC",
      "PWR",
      "POWER",
      "HEAT",
      "COOL",
      "FAN",
      "HP",
      "HEATPUMP",
      "REV",
      "REVERSE",
      "EM",
      "EMHEAT",
      "EMERGENCY",
      "BLOWER",
      "CONTACTOR",
      "SENSOR",
      "TEMP",
      "TEMPERATURE",
    ]

    // Enhanced wire detection
    const detectedWires = findWireLabelsAdvanced(text, thermostatWireLabels)

    // Thermostat indicators
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
      "BLOWER",
      "CONTACTOR",
      "REVERSING",
      "VALVE",
      "DEHUMIDIFICATION",
      "ELECTRIC",
      "STRIPS",
      "COMMON",
      "24V",
      "MODE",
    ]
    const hasThermostatKeywords = thermostatKeywords.some((keyword) => normalizedText.includes(keyword))

    // Calculate confidence
    let confidence = 0

    if (detectedWires.length >= 5) {
      confidence += 70
      reasons.push(`Found ${detectedWires.length} wire labels`)
    } else if (detectedWires.length >= 3) {
      confidence += 50
      reasons.push(`Found ${detectedWires.length} wire labels`)
    } else if (detectedWires.length >= 2) {
      confidence += 30
      reasons.push(`Found ${detectedWires.length} wire labels`)
    } else if (detectedWires.length === 1) {
      confidence += 15
      reasons.push("Found 1 wire label")
    }

    if (hasThermostatKeywords) {
      confidence += 20
      reasons.push("Contains thermostat-related text")
    }

    // Modern thermostat patterns
    const modernPatterns = [
      /reversing\s+valve/i,
      /24v\s+heat/i,
      /electric\s+heat\s+strips/i,
      /dehumidification/i,
      /blower.*contactor/i,
    ]

    if (modernPatterns.some((pattern) => pattern.test(text))) {
      confidence += 30
      reasons.push("Found modern thermostat patterns")
    }

    confidence = Math.max(0, Math.min(100, confidence))

    const isThermostatImage = confidence >= 25 || detectedWires.length >= 2

    // System type detection
    let systemType: "heat-pump" | "conventional" | "unknown" = "unknown"
    if (isThermostatImage) {
      if (
        detectedWires.includes("O") ||
        detectedWires.includes("B") ||
        detectedWires.includes("O/B") ||
        normalizedText.includes("REVERSING") ||
        normalizedText.includes("HEAT PUMP")
      ) {
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

  function findWireLabelsAdvanced(text: string, labelList: string[]): string[] {
    const normalizedText = text.toUpperCase()
    const foundLabels: string[] = []

    labelList.forEach((label) => {
      const patterns = [
        new RegExp(`\\b${label}\\b`, "g"),
        new RegExp(`${label}\\s*(WIRE|TERMINAL|TERM)`, "g"),
        new RegExp(`(WIRE|TERMINAL|TERM)\\s*${label}`, "g"),
        new RegExp(`${label}\\s*[:\\-]`, "g"),
        new RegExp(`[\$$\\[]${label}[\$$\\]]`, "g"),
        new RegExp(`${label}\\d*`, "g"),
        new RegExp(`${label}[\\+\\-]?`, "g"),
      ]

      if (patterns.some((pattern) => pattern.test(normalizedText))) {
        foundLabels.push(label)
      }
    })

    // Special handling for combined labels
    if (normalizedText.includes("O/B") || normalizedText.includes("OB")) {
      if (!foundLabels.includes("O/B")) foundLabels.push("O/B")
    }

    if (normalizedText.includes("ACC+")) foundLabels.push("ACC+")
    if (normalizedText.includes("ACC-")) foundLabels.push("ACC-")

    return [...new Set(foundLabels)]
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
                          <p className="font-medium text-green-800 mb-2">
                            Detected Wires ({analysisResult.detectedWires.length}):
                          </p>
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

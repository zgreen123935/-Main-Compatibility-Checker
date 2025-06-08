import { type NextRequest, NextResponse } from "next/server"
import { createWorker } from "tesseract.js"

interface ImageAnalysis {
  detectedWires: string[]
  systemType: "heat-pump" | "conventional" | "unknown"
  confidence: number
  isThermostatImage: boolean
  reasons: string[]
  suggestions: string[]
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Initialize Tesseract.js worker
    const worker = await createWorker()

    // Set parameters for better recognition of thermostat labels
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_",
    })

    // Recognize text in the image
    const { data } = await worker.recognize(buffer)

    // Analyze the image content
    const analysis = performAdvancedAnalysis(data.text, data.confidence)

    // Terminate worker to free memory
    await worker.terminate()

    return NextResponse.json({
      success: true,
      ...analysis,
      rawText: data.text,
      ocrConfidence: data.confidence,
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}

function performAdvancedAnalysis(text: string, ocrConfidence: number): ImageAnalysis {
  const normalizedText = text.toUpperCase()
  const reasons: string[] = []
  const suggestions: string[] = []

  // Thermostat wire labels
  const thermostatWireLabels = ["R", "Rh", "Rc", "W", "W1", "W2", "Y", "Y1", "Y2", "G", "C", "O", "B", "E", "AUX"]

  // Find wire labels
  const detectedWires = findWireLabels(text, thermostatWireLabels)

  // Thermostat indicators
  const thermostatKeywords = [
    "THERMOSTAT",
    "HVAC",
    "HEAT",
    "COOL",
    "FAN",
    "TERMINAL",
    "WIRE",
    "HONEYWELL",
    "NEST",
    "ECOBEE",
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
  ]
  const hasNonThermostatKeywords = nonThermostatKeywords.some((keyword) => normalizedText.includes(keyword))

  // Calculate confidence
  let confidence = 0

  // Wire label analysis
  if (detectedWires.length >= 3) {
    confidence += 50
    reasons.push(`Found ${detectedWires.length} wire labels`)
  } else if (detectedWires.length >= 2) {
    confidence += 30
    reasons.push(`Found ${detectedWires.length} wire labels`)
  } else if (detectedWires.length === 1) {
    confidence += 10
    reasons.push("Found 1 wire label")
  }

  // Keyword analysis
  if (hasThermostatKeywords) {
    confidence += 25
    reasons.push("Contains thermostat-related keywords")
  }

  if (hasNonThermostatKeywords) {
    confidence -= 40
    reasons.push("Contains non-thermostat content")
    suggestions.push("This appears to be a document or spreadsheet, not a thermostat")
  }

  // Text pattern analysis
  const hasWirePattern = /[RWYGOBC]\d*\s*[-:→]\s*[A-Z]/i.test(text)
  if (hasWirePattern) {
    confidence += 20
    reasons.push("Found wire connection patterns")
  }

  // Text density analysis
  const wordCount = normalizedText.split(/\s+/).filter((word) => word.length > 0).length
  if (wordCount > 100) {
    confidence -= 25
    reasons.push("Too much text for a thermostat")
    suggestions.push("Thermostat images typically have minimal text")
  }

  // OCR quality factor
  if (ocrConfidence < 60) {
    confidence -= 15
    reasons.push("Low image quality")
    suggestions.push("Try taking a clearer, well-lit photo")
  }

  // Number pattern analysis (spreadsheets often have many numbers)
  const numberMatches = text.match(/\d+/g) || []
  if (numberMatches.length > 20) {
    confidence -= 20
    reasons.push("Contains many numbers (typical of spreadsheets)")
  }

  // Final confidence calculation
  confidence = Math.max(0, Math.min(100, confidence))

  // Determine if this is a thermostat image
  const isThermostatImage = confidence >= 40 && detectedWires.length >= 1 && !hasNonThermostatKeywords

  // Analyze system type
  const systemType = analyzeSystemType(detectedWires)

  // Add suggestions based on analysis
  if (!isThermostatImage) {
    if (detectedWires.length === 0) {
      suggestions.push("Make sure wire labels are clearly visible in the photo")
    }
    if (hasNonThermostatKeywords) {
      suggestions.push("Please upload a photo of your actual thermostat wiring")
    }
    suggestions.push("Look for a rectangular device on your wall with wire terminals labeled R, W, Y, G, C, etc.")
  }

  return {
    detectedWires,
    systemType,
    confidence,
    isThermostatImage,
    reasons,
    suggestions,
  }
}

function findWireLabels(text: string, labelList: string[]): string[] {
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

function analyzeSystemType(detectedLabels: string[]): "heat-pump" | "conventional" | "unknown" {
  // Check for heat pump indicators (O or B terminals)
  if (detectedLabels.includes("O") || detectedLabels.includes("B")) {
    return "heat-pump"
  }

  // Check for conventional system indicators (W without O/B)
  if (
    (detectedLabels.includes("W") || detectedLabels.includes("W1")) &&
    !detectedLabels.includes("O") &&
    !detectedLabels.includes("B")
  ) {
    return "conventional"
  }

  return "unknown"
}

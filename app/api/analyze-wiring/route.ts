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
      tessedit_pageseg_mode: "6", // Assume a single uniform block of text
      tessjs_create_hocr: "1", // Enable HOCR output for position data
      tessjs_create_tsv: "1", // Enable TSV output for confidence data
    })

    // Recognize text in the image
    const { data } = await worker.recognize(buffer)

    // Analyze the image content
    const analysis = performAdvancedAnalysis(data.text, data.confidence, data.hocr, data.tsv)

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

function performAdvancedAnalysis(text: string, ocrConfidence: number, hocr?: string, tsv?: string): ImageAnalysis {
  const normalizedText = text.toUpperCase()
  const reasons: string[] = []
  const suggestions: string[] = []

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

  // Visual pattern analysis from HOCR/TSV if available
  let hasVisualWirePattern = false
  if (hocr) {
    // Look for terminal-like patterns in the HOCR data
    hasVisualWirePattern =
      /class='ocr_line'.*?span.*?span.*?span/i.test(hocr) && (/[RWYGOBC]<\/span>/i.test(hocr) || /terminal/i.test(hocr))
  }

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
  const hasThermostatKeywords = thermostatKeywords.some(
    (keyword) => normalizedText.includes(keyword) || (hocr && hocr.toUpperCase().includes(keyword)),
  )

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
  const hasNonThermostatKeywords = nonThermostatKeywords.some(
    (keyword) => normalizedText.includes(keyword) || (hocr && hocr.toUpperCase().includes(keyword)),
  )

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

  // Visual pattern analysis
  if (hasVisualWirePattern) {
    confidence += 30
    reasons.push("Found wire connection patterns")
  }

  // Keyword analysis
  if (hasThermostatKeywords) {
    confidence += 25
    reasons.push("Contains thermostat-related text")
  }

  if (hasNonThermostatKeywords) {
    confidence -= 40
    reasons.push("Contains non-thermostat content")
    suggestions.push("This appears to be a document or spreadsheet, not a thermostat")
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
  // This would be better with computer vision, but we can approximate with text layout
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
    suggestions.push("Thermostat images typically have minimal text")
  }

  // OCR quality factor - relaxed threshold
  if (ocrConfidence < 40) {
    confidence -= 10
    reasons.push("Low image quality")
    suggestions.push("Try taking a clearer, well-lit photo")
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
  // Either high confidence OR multiple wire labels OR visual wire pattern
  const isThermostatImage =
    (confidence >= 30 && !hasNonThermostatKeywords) || detectedWires.length >= 2 || hasVisualWirePattern

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

function analyzeSystemType(detectedLabels: string[]): "heat-pump" | "conventional" | "unknown" {
  // Check for heat pump indicators (O or B terminals)
  if (detectedLabels.includes("O") || detectedLabels.includes("B")) {
    return "heat-pump"
  }

  // Check for conventional system indicators (W without O/B)
  if (
    (detectedLabels.includes("W") || detectedLabels.includes("W1") || detectedLabels.includes("HEAT")) &&
    !detectedLabels.includes("O") &&
    !detectedLabels.includes("B")
  ) {
    return "conventional"
  }

  return "unknown"
}

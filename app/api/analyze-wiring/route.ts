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

    // Set parameters optimized for thermostat terminal detection
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_+",
      tessedit_pageseg_mode: "6", // Assume a single uniform block of text
      tessjs_create_hocr: "1", // Enable HOCR output for position data
      tessjs_create_tsv: "1", // Enable TSV output for confidence data
      tessedit_ocr_engine_mode: "1", // Use LSTM OCR engine mode
    })

    // Recognize text in the image with multiple attempts for better accuracy
    const { data } = await worker.recognize(buffer)

    // Also try with different page segmentation modes for better terminal detection
    await worker.setParameters({
      tessedit_pageseg_mode: "8", // Treat the image as a single word
    })
    const { data: data2 } = await worker.recognize(buffer)

    await worker.setParameters({
      tessedit_pageseg_mode: "7", // Treat the image as a single text line
    })
    const { data: data3 } = await worker.recognize(buffer)

    // Combine results from different OCR attempts
    const combinedText = `${data.text} ${data2.text} ${data3.text}`
    const avgConfidence = (data.confidence + data2.confidence + data3.confidence) / 3

    // Analyze the image content
    const analysis = performAdvancedAnalysis(combinedText, avgConfidence, data.hocr, data.tsv)

    // Terminate worker to free memory
    await worker.terminate()

    return NextResponse.json({
      success: true,
      ...analysis,
      rawText: combinedText,
      ocrConfidence: avgConfidence,
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

  // Comprehensive thermostat wire labels including modern variations
  const thermostatWireLabels = [
    // Basic labels
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
    // Modern thermostat labels
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
    // Heat pump specific
    "HP",
    "HEATPUMP",
    "REV",
    "REVERSE",
    // Emergency/Auxiliary
    "EM",
    "EMHEAT",
    "EMERGENCY",
    // Fan control
    "BLOWER",
    "CONTACTOR",
    // Sensor
    "SENSOR",
    "TEMP",
    "TEMPERATURE",
  ]

  // Find wire labels with enhanced pattern matching
  const detectedWires = findWireLabelsAdvanced(text, thermostatWireLabels)

  // Visual pattern analysis from HOCR/TSV if available
  let hasVisualWirePattern = false
  let visualWireCount = 0

  if (hocr) {
    // Look for terminal-like patterns in the HOCR data
    hasVisualWirePattern =
      /class='ocr_line'.*?span.*?span.*?span/i.test(hocr) && (/[RWYGOBC]<\/span>/i.test(hocr) || /terminal/i.test(hocr))

    // Count potential wire terminals from visual layout
    const wireMatches = hocr.match(/[RWYGOBC]\d*<\/span>/gi) || []
    visualWireCount = wireMatches.length
  }

  // Thermostat indicators - comprehensive list
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
    "BLOWER",
    "CONTACTOR",
    "REVERSING",
    "VALVE",
    "DEHUMIDIFICATION",
    "ELECTRIC",
    "STRIPS",
    "COMMON",
    "24V",
    "HEAT",
    "MODE",
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

  // Wire label analysis - highest weight
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

  // Visual pattern analysis
  if (hasVisualWirePattern || visualWireCount > 0) {
    confidence += 25
    reasons.push("Found wire terminal layout patterns")
  }

  // Keyword analysis
  if (hasThermostatKeywords) {
    confidence += 20
    reasons.push("Contains thermostat-related text")
  }

  if (hasNonThermostatKeywords) {
    confidence -= 40
    reasons.push("Contains non-thermostat content")
    suggestions.push("This appears to be a document or spreadsheet, not a thermostat")
  }

  // Advanced text pattern analysis for modern thermostats
  const modernThermostatPatterns = [
    /reversing\s+valve/i,
    /24v\s+heat/i,
    /electric\s+heat\s+strips/i,
    /dehumidification/i,
    /blower.*contactor/i,
    /aux\d*/i,
    /acc[+-]/i,
    /[rwygobc]\d*\s*[rwygobc]\d*/i, // Multiple terminals in sequence
  ]

  const hasModernPatterns = modernThermostatPatterns.some((pattern) => pattern.test(text))
  if (hasModernPatterns) {
    confidence += 30
    reasons.push("Found modern thermostat patterns")
  }

  // Heat pump specific detection
  const heatPumpIndicators = ["O/B", "REVERSING", "VALVE", "COOL", "MODE", "HEAT", "PUMP"]
  const hasHeatPumpIndicators = heatPumpIndicators.some((indicator) => normalizedText.includes(indicator))

  if (hasHeatPumpIndicators) {
    confidence += 15
    reasons.push("Found heat pump indicators")
  }

  // Text density analysis - more lenient for modern thermostats with descriptions
  const wordCount = normalizedText.split(/\s+/).filter((word) => word.length > 0).length
  if (wordCount > 300) {
    confidence -= 20
    reasons.push("High text density")
  }

  // OCR quality factor - more lenient
  if (ocrConfidence < 30) {
    confidence -= 10
    reasons.push("Low OCR confidence")
    suggestions.push("Try taking a clearer, well-lit photo")
  }

  // Final confidence calculation
  confidence = Math.max(0, Math.min(100, confidence))

  // Determine if this is a thermostat image - more sophisticated criteria
  const isThermostatImage =
    (confidence >= 25 && !hasNonThermostatKeywords) ||
    detectedWires.length >= 2 ||
    hasVisualWirePattern ||
    hasModernPatterns

  // Analyze system type with enhanced detection
  const systemType = analyzeSystemTypeAdvanced(detectedWires, text)

  // Add suggestions based on analysis
  if (!isThermostatImage) {
    if (detectedWires.length === 0) {
      suggestions.push("Make sure wire terminal labels are clearly visible")
      suggestions.push("Remove any thermostat cover to expose the wiring terminals")
    }
    suggestions.push("Look for terminals labeled with letters like R, W, Y, G, C, O, B")
  } else if (detectedWires.length < 3) {
    suggestions.push("Some wire labels may not be clearly visible - you can add them manually")
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

function findWireLabelsAdvanced(text: string, labelList: string[]): string[] {
  const normalizedText = text.toUpperCase()
  const foundLabels: string[] = []

  // Enhanced pattern matching for modern thermostat labels
  labelList.forEach((label) => {
    const patterns = [
      // Exact matches with boundaries
      new RegExp(`\\b${label}\\b`, "g"),
      // Labels with terminal/wire context
      new RegExp(`${label}\\s*(WIRE|TERMINAL|TERM)`, "g"),
      new RegExp(`(WIRE|TERMINAL|TERM)\\s*${label}`, "g"),
      // Labels with punctuation
      new RegExp(`${label}\\s*[:\\-]`, "g"),
      new RegExp(`[:\\-]\\s*${label}`, "g"),
      // Labels in parentheses or brackets
      new RegExp(`[\$$\\[]${label}[\$$\\]]`, "g"),
      // Labels with numbers (like Y1, W2, etc.)
      new RegExp(`${label}\\d*`, "g"),
      // Labels with special characters (like ACC+, ACC-)
      new RegExp(`${label}[\\+\\-]?`, "g"),
      // Isolated single characters that might be terminals
      ...(label.length === 1
        ? [
            new RegExp(`[^A-Z0-9]${label}[^A-Z0-9]`, "g"),
            new RegExp(`^${label}[^A-Z0-9]`, "g"),
            new RegExp(`[^A-Z0-9]${label}$`, "g"),
          ]
        : []),
    ]

    if (patterns.some((pattern) => pattern.test(normalizedText))) {
      foundLabels.push(label)
    }
  })

  // Special handling for combined labels like "O/B"
  if (normalizedText.includes("O/B") || normalizedText.includes("OB")) {
    if (!foundLabels.includes("O/B")) foundLabels.push("O/B")
    if (!foundLabels.includes("O")) foundLabels.push("O")
    if (!foundLabels.includes("B")) foundLabels.push("B")
  }

  // Special handling for ACC+/ACC-
  if (normalizedText.includes("ACC+") || normalizedText.includes("ACCP")) {
    foundLabels.push("ACC+")
  }
  if (normalizedText.includes("ACC-") || normalizedText.includes("ACCM")) {
    foundLabels.push("ACC-")
  }

  return [...new Set(foundLabels)] // Remove duplicates
}

function analyzeSystemTypeAdvanced(detectedLabels: string[], text: string): "heat-pump" | "conventional" | "unknown" {
  const normalizedText = text.toUpperCase()

  // Strong heat pump indicators
  const heatPumpIndicators = [
    detectedLabels.includes("O") || detectedLabels.includes("B") || detectedLabels.includes("O/B"),
    normalizedText.includes("REVERSING"),
    normalizedText.includes("HEAT PUMP"),
    normalizedText.includes("COOL MODE"),
    detectedLabels.includes("REV"),
  ]

  if (heatPumpIndicators.some((indicator) => indicator)) {
    return "heat-pump"
  }

  // Conventional system indicators
  const conventionalIndicators = [
    (detectedLabels.includes("W") || detectedLabels.includes("W1")) &&
      !detectedLabels.includes("O") &&
      !detectedLabels.includes("B"),
    normalizedText.includes("FURNACE") && !normalizedText.includes("HEAT PUMP"),
    normalizedText.includes("GAS") || normalizedText.includes("OIL"),
  ]

  if (conventionalIndicators.some((indicator) => indicator)) {
    return "conventional"
  }

  return "unknown"
}

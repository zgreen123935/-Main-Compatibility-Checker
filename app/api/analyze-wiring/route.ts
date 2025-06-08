import { type NextRequest, NextResponse } from "next/server"
import { createWorker } from "tesseract.js"

interface WireConnection {
  terminal: string
  hasWire: boolean
  wireColor?: string
  confidence: number
}

interface ImageAnalysis {
  detectedTerminals: string[]
  wireConnections: WireConnection[]
  connectedWires: string[]
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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Initialize Tesseract.js worker
    const worker = await createWorker()

    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_+",
      tessedit_pageseg_mode: "6",
      tessjs_create_hocr: "1",
      tessjs_create_tsv: "1",
      tessedit_ocr_engine_mode: "1",
    })

    const { data } = await worker.recognize(buffer)

    // Try different segmentation modes for better detection
    await worker.setParameters({ tessedit_pageseg_mode: "8" })
    const { data: data2 } = await worker.recognize(buffer)

    await worker.setParameters({ tessedit_pageseg_mode: "7" })
    const { data: data3 } = await worker.recognize(buffer)

    const combinedText = `${data.text} ${data2.text} ${data3.text}`
    const avgConfidence = (data.confidence + data2.confidence + data3.confidence) / 3

    // Analyze the image for terminals and wire connections with strict filtering
    const analysis = performPreciseWireAnalysis(combinedText, avgConfidence, data.hocr, data.tsv)

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

function performPreciseWireAnalysis(text: string, ocrConfidence: number, hocr?: string, tsv?: string): ImageAnalysis {
  const normalizedText = text.toUpperCase()
  const reasons: string[] = []
  const suggestions: string[] = []

  // STRICT terminal labels - only actual terminal designations
  const validTerminalLabels = [
    // Power terminals
    "R",
    "RH",
    "RC",
    "24V",
    // Heating terminals
    "W",
    "W1",
    "W2",
    "W3",
    "AUX",
    "AUX1",
    "AUX2",
    "E",
    "EM",
    // Cooling terminals
    "Y",
    "Y1",
    "Y2",
    "Y3",
    // Fan terminals
    "G",
    "G1",
    "G2",
    // Common terminals
    "C",
    "COM",
    // Heat pump terminals
    "O",
    "B",
    "O/B",
    "OB",
    // Accessory terminals
    "ACC",
    "ACC+",
    "ACC-",
    "ACCP",
    "ACCM",
    // Humidity/Dehumidification
    "HUM",
    "DEHUM",
    "HUMID",
  ]

  // Words that are NOT terminal labels (descriptive text to exclude)
  const excludeWords = [
    "HEAT",
    "COOL",
    "FAN",
    "BLOWER",
    "CONTACTOR",
    "REVERSING",
    "VALVE",
    "MODE",
    "ELECTRIC",
    "STRIPS",
    "DEHUMIDIFICATION",
    "COMMON",
    "POWER",
    "WIRE",
    "WIRING",
    "TERMINAL",
    "THERMOSTAT",
    "HVAC",
    "SYSTEM",
    "CONTROL",
    "TEMPERATURE",
    "AIR",
    "CONDITIONING",
    "FURNACE",
    "PUMP",
    "HEATING",
    "COOLING",
    "24VAC",
    "VOLTAGE",
    "SUPPLY",
    "RETURN",
    "INDOOR",
    "OUTDOOR",
  ]

  // Detect terminals with very strict filtering
  const detectedTerminals = findPreciseTerminalLabels(text, validTerminalLabels, excludeWords)

  // Analyze wire connections using enhanced heuristics
  const wireConnections = analyzeWireConnectionsPrecise(detectedTerminals, text, hocr)

  // Extract only terminals with high confidence wire connections
  const connectedWires = wireConnections
    .filter((connection) => connection.hasWire && connection.confidence > 0.6)
    .map((connection) => connection.terminal)

  // Thermostat validation
  const thermostatKeywords = ["THERMOSTAT", "HVAC", "REVERSING", "VALVE", "24V", "HEAT", "COOL"]

  const hasThermostatKeywords = thermostatKeywords.some((keyword) => normalizedText.includes(keyword))

  // Calculate confidence with stricter criteria
  let confidence = 0

  if (detectedTerminals.length >= 8) {
    confidence += 50
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  } else if (detectedTerminals.length >= 5) {
    confidence += 35
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  } else if (detectedTerminals.length >= 3) {
    confidence += 20
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  }

  if (connectedWires.length >= 5) {
    confidence += 40
    reasons.push(`Detected ${connectedWires.length} wire connections`)
  } else if (connectedWires.length >= 3) {
    confidence += 25
    reasons.push(`Detected ${connectedWires.length} wire connections`)
  }

  if (hasThermostatKeywords) {
    confidence += 20
    reasons.push("Contains thermostat-related text")
  }

  // Heat pump specific patterns
  const heatPumpPatterns = [/reversing\s+valve/i, /o\/b/i, /heat\s+pump/i, /cool\s+mode/i]

  if (heatPumpPatterns.some((pattern) => pattern.test(text))) {
    confidence += 15
    reasons.push("Found heat pump indicators")
  }

  confidence = Math.max(0, Math.min(100, confidence))

  const isThermostatImage = confidence >= 30 || detectedTerminals.length >= 4

  // System type analysis
  const systemType = analyzeSystemTypeAdvanced(connectedWires, text)

  // Add suggestions
  if (!isThermostatImage) {
    suggestions.push("Make sure wire terminal labels are clearly visible")
    suggestions.push("Remove any thermostat cover to expose the wiring terminals")
  }

  if (detectedTerminals.length > 15) {
    suggestions.push("Too many terminals detected - may be picking up descriptive text")
  }

  return {
    detectedTerminals,
    wireConnections,
    connectedWires,
    systemType,
    confidence,
    isThermostatImage,
    reasons,
    suggestions,
  }
}

function findPreciseTerminalLabels(text: string, validLabels: string[], excludeWords: string[]): string[] {
  const normalizedText = text.toUpperCase()
  const foundLabels: string[] = []

  validLabels.forEach((label) => {
    // Skip if this label is actually an excluded descriptive word
    if (excludeWords.includes(label)) {
      return
    }

    // Very strict pattern matching - must be isolated terminal labels
    const strictPatterns = [
      // Exact word boundaries
      new RegExp(`\\b${label}\\b(?!\\s+(HEAT|COOL|FAN|WIRE|TERMINAL|STRIPS|MODE|VALVE))`, "g"),
      // Terminal with number (like Y1, W2)
      new RegExp(`\\b${label}\\d+\\b(?!\\s+(HEAT|COOL|FAN|WIRE|TERMINAL))`, "g"),
      // Terminal with +/- (like ACC+, ACC-)
      new RegExp(`\\b${label}[\\+\\-]\\b`, "g"),
      // Combined terminals (like O/B)
      ...(label.includes("/") ? [new RegExp(`\\b${label}\\b`, "g")] : []),
    ]

    // Additional check: make sure it's not part of a longer descriptive phrase
    const isValidTerminal = strictPatterns.some((pattern) => {
      const matches = normalizedText.match(pattern)
      if (!matches) return false

      // For each match, check context to ensure it's a terminal label
      return matches.some((match) => {
        const matchIndex = normalizedText.indexOf(match)
        const beforeText = normalizedText.substring(Math.max(0, matchIndex - 20), matchIndex)
        const afterText = normalizedText.substring(matchIndex + match.length, matchIndex + match.length + 20)

        // Exclude if surrounded by descriptive text
        const hasDescriptiveBefore = excludeWords.some((word) => beforeText.includes(word))
        const hasDescriptiveAfter = excludeWords.some((word) => afterText.includes(word))

        // Allow if it looks like a terminal (short, isolated, or with numbers/symbols)
        const looksLikeTerminal = match.length <= 4 || /\d/.test(match) || /[+\-/]/.test(match)

        return looksLikeTerminal && !hasDescriptiveBefore && !hasDescriptiveAfter
      })
    })

    if (isValidTerminal) {
      foundLabels.push(label)
    }
  })

  // Special handling for combined labels
  if (normalizedText.includes("O/B") && !foundLabels.includes("O/B")) {
    foundLabels.push("O/B")
  }

  // Remove duplicates and sort by common terminal priority
  const uniqueLabels = [...new Set(foundLabels)]

  // Prioritize common terminals
  const commonTerminals = ["R", "RH", "RC", "C", "Y", "Y1", "Y2", "G", "W", "W1", "W2", "O", "B", "O/B"]
  const sortedLabels = uniqueLabels.sort((a, b) => {
    const aIndex = commonTerminals.indexOf(a)
    const bIndex = commonTerminals.indexOf(b)
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
    if (aIndex !== -1) return -1
    if (bIndex !== -1) return 1
    return a.localeCompare(b)
  })

  return sortedLabels
}

function analyzeWireConnectionsPrecise(terminals: string[], text: string, hocr?: string): WireConnection[] {
  const wireConnections: WireConnection[] = []

  // Common wire-to-terminal associations with higher precision
  const wireAssociations = [
    { terminals: ["R", "RH", "RC"], colors: ["red"], confidence: 0.9, essential: true },
    { terminals: ["C", "COM"], colors: ["blue", "black"], confidence: 0.8, essential: true },
    { terminals: ["Y", "Y1"], colors: ["yellow"], confidence: 0.9, essential: true },
    { terminals: ["G", "G1"], colors: ["green"], confidence: 0.9, essential: true },
    { terminals: ["W", "W1"], colors: ["white"], confidence: 0.8, essential: true },
    { terminals: ["O", "O/B"], colors: ["orange"], confidence: 0.8, essential: false },
    { terminals: ["Y2"], colors: ["yellow"], confidence: 0.7, essential: false },
    { terminals: ["W2"], colors: ["white"], confidence: 0.7, essential: false },
    { terminals: ["B"], colors: ["blue"], confidence: 0.6, essential: false },
    { terminals: ["ACC+", "ACC-", "AUX1", "AUX2"], colors: [], confidence: 0.4, essential: false },
  ]

  terminals.forEach((terminal) => {
    let hasWire = false
    let wireColor: string | undefined
    let confidence = 0.3 // Lower default confidence

    // Find association for this terminal
    const association = wireAssociations.find((assoc) =>
      assoc.terminals.some((t) => terminal === t || terminal.includes(t)),
    )

    if (association) {
      // Essential terminals are more likely to have wires
      if (association.essential) {
        hasWire = true
        confidence = association.confidence
      } else {
        // Optional terminals need more evidence
        hasWire = false
        confidence = association.confidence * 0.7
      }

      // Check for wire color mentions
      if (association.colors.length > 0) {
        const colorMentioned = association.colors.some((color) => {
          const colorPatterns = [
            new RegExp(`${color}\\s+wire`, "i"),
            new RegExp(`wire.*${color}`, "i"),
            new RegExp(`\\b${color}\\b`, "i"),
          ]
          return colorPatterns.some((pattern) => pattern.test(text))
        })

        if (colorMentioned) {
          hasWire = true
          wireColor = association.colors[0]
          confidence = Math.min(0.95, confidence + 0.2)
        }
      }
    }

    wireConnections.push({
      terminal,
      hasWire,
      wireColor,
      confidence,
    })
  })

  return wireConnections
}

function analyzeSystemTypeAdvanced(connectedWires: string[], text: string): "heat-pump" | "conventional" | "unknown" {
  const normalizedText = text.toUpperCase()

  // Heat pump indicators
  const heatPumpIndicators = [
    connectedWires.includes("O") || connectedWires.includes("B") || connectedWires.includes("O/B"),
    normalizedText.includes("REVERSING"),
    normalizedText.includes("HEAT PUMP"),
    normalizedText.includes("COOL MODE"),
    normalizedText.includes("O/B"),
  ]

  if (heatPumpIndicators.some((indicator) => indicator)) {
    return "heat-pump"
  }

  // Conventional system indicators
  const conventionalIndicators = [
    (connectedWires.includes("W") || connectedWires.includes("W1")) &&
      !connectedWires.includes("O") &&
      !connectedWires.includes("B") &&
      !normalizedText.includes("HEAT PUMP"),
  ]

  if (conventionalIndicators.some((indicator) => indicator)) {
    return "conventional"
  }

  return "unknown"
}

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

  // Extract only terminals with moderate confidence wire connections
  const connectedWires = wireConnections
    .filter((connection) => connection.hasWire && connection.confidence > 0.4) // Lowered from 0.5 to 0.4
    .map((connection) => connection.terminal)

  // Thermostat validation
  const thermostatKeywords = ["THERMOSTAT", "HVAC", "REVERSING", "VALVE", "24V", "HEAT", "COOL"]

  const hasThermostatKeywords = thermostatKeywords.some((keyword) => normalizedText.includes(keyword))

  // Calculate confidence with better balance
  let confidence = 0

  if (detectedTerminals.length >= 10) {
    confidence += 50
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  } else if (detectedTerminals.length >= 7) {
    confidence += 40
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  } else if (detectedTerminals.length >= 5) {
    confidence += 30
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  } else if (detectedTerminals.length >= 3) {
    confidence += 20
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  }

  if (connectedWires.length >= 6) {
    confidence += 40
    reasons.push(`Detected ${connectedWires.length} wire connections`)
  } else if (connectedWires.length >= 4) {
    confidence += 30
    reasons.push(`Detected ${connectedWires.length} wire connections`)
  } else if (connectedWires.length >= 2) {
    confidence += 20
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

    // More balanced pattern matching - not too strict, not too loose
    const balancedPatterns = [
      // Exact word boundaries with some flexibility
      new RegExp(`\\b${label}\\b(?!\\s+(STRIPS|MODE|VALVE|CONTACTOR|BLOWER))`, "g"),
      // Terminal with number (like Y1, W2, AUX1)
      new RegExp(`\\b${label}\\d+\\b`, "g"),
      // Terminal with +/- (like ACC+, ACC-)
      new RegExp(`\\b${label}[\\+\\-]\\b`, "g"),
      // Combined terminals (like O/B)
      ...(label.includes("/") ? [new RegExp(`\\b${label.replace("/", "\\/")}\\b`, "g")] : []),
      // Allow some common variations
      ...(label === "C" ? [/\bCOM\b/g, /\bCOMMON\b(?!\s+(WIRE|TERMINAL))/g] : []),
      ...(label === "AUX1" ? [/\bW1\s*\$$\s*AUX1?\s*\$$/g] : []),
      ...(label === "AUX2" ? [/\bW2\s*\$$\s*AUX2?\s*\$$/g] : []),
    ]

    // Check if any pattern matches
    const hasMatch = balancedPatterns.some((pattern) => {
      const matches = normalizedText.match(pattern)
      if (!matches) return false

      // For each match, do lighter context checking
      return matches.some((match) => {
        const matchIndex = normalizedText.indexOf(match)
        const beforeText = normalizedText.substring(Math.max(0, matchIndex - 15), matchIndex)
        const afterText = normalizedText.substring(matchIndex + match.length, matchIndex + match.length + 15)

        // Only exclude if it's clearly part of a descriptive phrase
        const isDescriptivePhrase =
          (beforeText.includes("ELECTRIC") && afterText.includes("STRIPS")) ||
          (beforeText.includes("REVERSING") && afterText.includes("VALVE")) ||
          (beforeText.includes("24V") && afterText.includes("HEAT")) ||
          (match === "COMMON" && (beforeText.includes("24V") || afterText.includes("WIRE")))

        return !isDescriptivePhrase
      })
    })

    if (hasMatch) {
      foundLabels.push(label)
    }
  })

  // Special handling for combined and variant labels
  if ((normalizedText.includes("O/B") || normalizedText.includes("OB")) && !foundLabels.includes("O/B")) {
    foundLabels.push("O/B")
  }

  // Handle AUX variations
  if (normalizedText.includes("AUX1") && !foundLabels.includes("AUX1")) {
    foundLabels.push("AUX1")
  }
  if (normalizedText.includes("AUX2") && !foundLabels.includes("AUX2")) {
    foundLabels.push("AUX2")
  }

  // Remove duplicates and sort by common terminal priority
  const uniqueLabels = [...new Set(foundLabels)]

  // Prioritize common terminals
  const commonTerminals = [
    "R",
    "RH",
    "RC",
    "C",
    "Y",
    "Y1",
    "Y2",
    "G",
    "W",
    "W1",
    "W2",
    "O",
    "B",
    "O/B",
    "ACC+",
    "ACC-",
    "AUX1",
    "AUX2",
  ]
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
  const normalizedText = text.toUpperCase()

  // Enhanced wire-to-terminal associations with more confident detection
  const wireAssociations = [
    { terminals: ["R", "RH", "RC"], colors: ["red"], confidence: 0.9, essential: true },
    { terminals: ["C", "COM"], colors: ["blue", "black"], confidence: 0.85, essential: true },
    { terminals: ["Y", "Y1"], colors: ["yellow"], confidence: 0.9, essential: true },
    { terminals: ["G", "G1"], colors: ["green"], confidence: 0.9, essential: true },
    { terminals: ["W", "W1", "AUX1"], colors: ["white"], confidence: 0.85, essential: true },
    { terminals: ["O", "O/B"], colors: ["orange"], confidence: 0.8, essential: true }, // Changed to essential for heat pumps
    { terminals: ["Y2"], colors: ["yellow"], confidence: 0.75, essential: false },
    { terminals: ["W2", "AUX2"], colors: ["white", "gray"], confidence: 0.75, essential: false },
    { terminals: ["B"], colors: ["blue"], confidence: 0.7, essential: false },
    { terminals: ["ACC+", "ACC-"], colors: ["gray", "brown", "black"], confidence: 0.65, essential: false }, // Increased confidence
  ]

  // Check for wire color mentions in text
  const wireColorMentions = {
    red: /red/i.test(text),
    blue: /blue/i.test(text),
    yellow: /yellow/i.test(text),
    green: /green/i.test(text),
    white: /white/i.test(text),
    orange: /orange/i.test(text),
    gray: /(gray|grey)/i.test(text),
    brown: /brown/i.test(text),
    black: /black/i.test(text),
  }

  // Count total color mentions to estimate wire count
  const colorMentionCount = Object.values(wireColorMentions).filter(Boolean).length

  // If we detect many terminals, assume most common ones have wires
  const assumeWiresForCommonTerminals = terminals.length >= 8

  terminals.forEach((terminal) => {
    let hasWire = false
    let wireColor: string | undefined
    let confidence = 0.4 // Moderate default confidence

    // Find association for this terminal
    const association = wireAssociations.find((assoc) =>
      assoc.terminals.some((t) => terminal === t || terminal.includes(t) || t.includes(terminal)),
    )

    if (association) {
      // Essential terminals are very likely to have wires
      if (association.essential) {
        hasWire = true
        confidence = association.confidence

        // If we have many terminals detected, be even more confident about essential ones
        if (assumeWiresForCommonTerminals) {
          confidence = Math.min(0.95, confidence + 0.1)
        }
      } else {
        // Optional terminals - moderate likelihood, but still assume they have wires if detected
        hasWire = true
        confidence = association.confidence
      }

      // Check for wire color mentions
      if (association.colors.length > 0) {
        const mentionedColor = association.colors.find(
          (color) => wireColorMentions[color as keyof typeof wireColorMentions],
        )

        if (mentionedColor) {
          hasWire = true
          wireColor = mentionedColor
          confidence = Math.min(0.95, confidence + 0.15)
        }
      }
    } else {
      // Even if no association found, if it's a valid terminal, assume it might have a wire
      hasWire = true
      confidence = 0.6
    }

    // Special logic for specific terminals
    if (terminal === "O/B" && (normalizedText.includes("REVERSING") || normalizedText.includes("HEAT PUMP"))) {
      hasWire = true
      confidence = Math.max(confidence, 0.85)
    }

    // If we have many color mentions, be more generous with wire detection
    if (colorMentionCount >= 5 && confidence > 0.4) {
      hasWire = true
      confidence = Math.max(confidence, 0.7)
    }

    // Boost confidence for common terminal patterns
    const commonTerminalPatterns = ["R", "C", "Y", "G", "W", "O", "ACC"]
    if (commonTerminalPatterns.some((pattern) => terminal.includes(pattern))) {
      confidence = Math.max(confidence, 0.65)
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

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
      tesseract_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_+",
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

    // Analyze the image for terminals and wire connections
    const analysis = performWireConnectionAnalysis(combinedText, avgConfidence, data.hocr, data.tsv)

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

function performWireConnectionAnalysis(
  text: string,
  ocrConfidence: number,
  hocr?: string,
  tsv?: string,
): ImageAnalysis {
  const normalizedText = text.toUpperCase()
  const reasons: string[] = []
  const suggestions: string[] = []

  // Comprehensive thermostat terminal labels
  const thermostatTerminals = [
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
    "24V",
    "24VAC",
    "PWR",
    "POWER",
    "HEAT",
    "COOL",
    "FAN",
    "HP",
    "REV",
    "EM",
    "EMHEAT",
    "BLOWER",
    "CONTACTOR",
    "SENSOR",
    "TEMP",
  ]

  // Detect all available terminals
  const detectedTerminals = findTerminalLabels(text, thermostatTerminals)

  // Analyze wire connections using heuristics
  const wireConnections = analyzeWireConnections(detectedTerminals, text, hocr)

  // Extract only terminals with wires
  const connectedWires = wireConnections
    .filter((connection) => connection.hasWire)
    .map((connection) => connection.terminal)

  // Thermostat validation
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

  const hasThermostatKeywords = thermostatKeywords.some(
    (keyword) => normalizedText.includes(keyword) || (hocr && hocr.toUpperCase().includes(keyword)),
  )

  // Calculate confidence
  let confidence = 0

  if (detectedTerminals.length >= 5) {
    confidence += 50
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  } else if (detectedTerminals.length >= 3) {
    confidence += 35
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  } else if (detectedTerminals.length >= 2) {
    confidence += 20
    reasons.push(`Found ${detectedTerminals.length} terminal labels`)
  }

  if (connectedWires.length >= 3) {
    confidence += 40
    reasons.push(`Detected ${connectedWires.length} wire connections`)
  } else if (connectedWires.length >= 2) {
    confidence += 25
    reasons.push(`Detected ${connectedWires.length} wire connections`)
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
    confidence += 25
    reasons.push("Found modern thermostat patterns")
  }

  confidence = Math.max(0, Math.min(100, confidence))

  const isThermostatImage = confidence >= 30 || detectedTerminals.length >= 3

  // System type analysis
  const systemType = analyzeSystemTypeAdvanced(connectedWires, text)

  // Add suggestions
  if (!isThermostatImage) {
    suggestions.push("Make sure wire terminal labels are clearly visible")
    suggestions.push("Remove any thermostat cover to expose the wiring terminals")
  }

  if (connectedWires.length < detectedTerminals.length) {
    suggestions.push(
      "We detected more terminals than connected wires - you can manually verify which terminals have wires",
    )
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

function findTerminalLabels(text: string, labelList: string[]): string[] {
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

function analyzeWireConnections(terminals: string[], text: string, hocr?: string): WireConnection[] {
  const wireConnections: WireConnection[] = []

  // Wire color indicators that suggest actual wire presence
  const wireColorPatterns = [
    { color: "red", patterns: [/red/i, /r\s+wire/i] },
    { color: "blue", patterns: [/blue/i, /b\s+wire/i] },
    { color: "yellow", patterns: [/yellow/i, /y\s+wire/i] },
    { color: "green", patterns: [/green/i, /g\s+wire/i] },
    { color: "white", patterns: [/white/i, /w\s+wire/i] },
    { color: "orange", patterns: [/orange/i, /o\s+wire/i] },
    { color: "black", patterns: [/black/i, /blk/i] },
    { color: "brown", patterns: [/brown/i, /brn/i] },
    { color: "gray", patterns: [/gray/i, /grey/i] },
  ]

  // Common wire-to-terminal associations
  const commonWireAssociations = [
    { terminals: ["R", "Rh", "Rc", "RH", "RC"], colors: ["red"], confidence: 0.9 },
    { terminals: ["C", "COM", "COMMON"], colors: ["blue", "black"], confidence: 0.8 },
    { terminals: ["Y", "Y1", "Y2"], colors: ["yellow"], confidence: 0.9 },
    { terminals: ["G", "G1"], colors: ["green"], confidence: 0.9 },
    { terminals: ["W", "W1", "W2"], colors: ["white"], confidence: 0.8 },
    { terminals: ["O", "O/B"], colors: ["orange"], confidence: 0.8 },
    { terminals: ["B"], colors: ["blue"], confidence: 0.7 },
  ]

  terminals.forEach((terminal) => {
    let hasWire = false
    let wireColor: string | undefined
    let confidence = 0.5 // Default confidence for detected terminals

    // Check if this terminal commonly has wires (heuristic)
    const essentialTerminals = ["R", "Rh", "Rc", "RH", "RC", "C", "COM", "COMMON", "Y", "Y1", "G", "W", "W1"]
    if (essentialTerminals.some((essential) => terminal.includes(essential))) {
      hasWire = true
      confidence = 0.7
    }

    // Check for wire color associations
    const association = commonWireAssociations.find((assoc) => assoc.terminals.some((t) => terminal.includes(t)))

    if (association) {
      // Check if the associated wire color is mentioned in the text
      const colorMentioned = association.colors.some((color) => {
        const colorPattern = wireColorPatterns.find((p) => p.color === color)
        return colorPattern?.patterns.some((pattern) => pattern.test(text))
      })

      if (colorMentioned) {
        hasWire = true
        wireColor = association.colors[0]
        confidence = association.confidence
      }
    }

    // Additional heuristics based on terminal importance
    if (terminal.includes("ACC") || terminal.includes("AUX") || terminal.includes("DEHUM")) {
      // These are often optional terminals
      confidence = 0.4
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
  ]

  if (heatPumpIndicators.some((indicator) => indicator)) {
    return "heat-pump"
  }

  // Conventional system indicators
  const conventionalIndicators = [
    (connectedWires.includes("W") || connectedWires.includes("W1")) &&
      !connectedWires.includes("O") &&
      !connectedWires.includes("B"),
    normalizedText.includes("FURNACE") && !normalizedText.includes("HEAT PUMP"),
  ]

  if (conventionalIndicators.some((indicator) => indicator)) {
    return "conventional"
  }

  return "unknown"
}

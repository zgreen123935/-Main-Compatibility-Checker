import { type NextRequest, NextResponse } from "next/server"
import { createWorker } from "tesseract.js"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Initialize Tesseract.js worker
    const worker = await createWorker()

    // Set parameters for better recognition of thermostat labels
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/",
    })

    // Recognize text in the image
    const { data } = await worker.recognize(buffer)

    // Process the OCR results to find wire labels
    const commonWireLabels = ["R", "Rh", "Rc", "W", "W1", "W2", "Y", "Y1", "Y2", "G", "C", "O", "B", "E", "AUX"]
    const detectedLabels = findWireLabels(data.text, commonWireLabels)

    // Analyze system type based on detected labels
    const systemType = analyzeSystemType(detectedLabels)

    // Terminate worker to free memory
    await worker.terminate()

    return NextResponse.json({
      success: true,
      detectedWires: detectedLabels,
      systemType,
      confidence: data.confidence,
      rawText: data.text,
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}

function findWireLabels(text: string, labelList: string[]): string[] {
  // Convert text to uppercase and remove spaces
  const normalizedText = text.toUpperCase().replace(/\s/g, "")

  // Find all occurrences of wire labels in the text
  const foundLabels: string[] = []

  labelList.forEach((label) => {
    // Look for the label surrounded by non-alphanumeric characters or at string boundaries
    const regex = new RegExp(`(^|[^A-Z0-9])${label}([^A-Z0-9]|$)`, "g")
    if (regex.test(normalizedText)) {
      foundLabels.push(label)
    }
  })

  return foundLabels
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

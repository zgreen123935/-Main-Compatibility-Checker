import { type NextRequest, NextResponse } from "next/server"
import type { File } from "formdata-node"

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

    // Convert image to base64
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64Image = buffer.toString("base64")
    const mimeType = file.type

    // Use OpenAI Vision API for much better analysis
    const analysis = await analyzeWithOpenAIVision(base64Image, mimeType)

    return NextResponse.json({
      success: true,
      ...analysis,
    })
  } catch (error) {
    console.error("Error processing image:", error)

    // Fallback to Tesseract if OpenAI fails
    const file = req.formData().get("image") as File // Declare file variable here
    try {
      const fallbackAnalysis = await fallbackToTesseract(await file.arrayBuffer())
      return NextResponse.json({
        success: true,
        ...fallbackAnalysis,
        fallbackUsed: true,
      })
    } catch (fallbackError) {
      console.error("Fallback analysis also failed:", fallbackError)
      return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
    }
  }
}

async function analyzeWithOpenAIVision(base64Image: string, mimeType: string): Promise<ImageAnalysis> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const prompt = `You are analyzing a thermostat wiring image. I need you to be EXTREMELY PRECISE about which terminals actually have physical wires connected to them.

CRITICAL INSTRUCTIONS:
1. Look carefully at each terminal and ONLY mark "hasWire: true" if you can see an actual physical wire (colored cable) going INTO that specific terminal
2. Do NOT assume a terminal has a wire just because you see the terminal label
3. Empty terminals with no wires should have "hasWire: false"
4. Be very careful to distinguish between similar terminal labels (like Rc vs RH, or ACC+ vs ACC-)
5. Follow the wire from its color to the exact terminal it connects to

WHAT TO LOOK FOR:
- Physical colored wires (red, blue, yellow, green, white, orange, black, etc.)
- The exact terminal each wire connects to
- Empty terminals that have labels but no wires

COMMON TERMINALS TO CHECK:
R, RH, RC, C, Y, Y1, Y2, G, W, W1, W2, O, B, O/B, ACC+, ACC-, AUX1, AUX2

Please respond in this exact JSON format:
{
  "detectedTerminals": ["list of ALL terminal labels you can see"],
  "wireConnections": [
    {"terminal": "RH", "hasWire": true, "wireColor": "red", "confidence": 0.95},
    {"terminal": "RC", "hasWire": false, "confidence": 0.9},
    {"terminal": "C", "hasWire": true, "wireColor": "blue", "confidence": 0.9},
    {"terminal": "Y1", "hasWire": true, "wireColor": "yellow", "confidence": 0.9},
    {"terminal": "G", "hasWire": true, "wireColor": "green", "confidence": 0.9},
    {"terminal": "W2", "hasWire": true, "wireColor": "white", "confidence": 0.85},
    {"terminal": "O/B", "hasWire": true, "wireColor": "orange", "confidence": 0.8},
    {"terminal": "ACC+", "hasWire": true, "wireColor": "black", "confidence": 0.8},
    {"terminal": "ACC-", "hasWire": false, "confidence": 0.9}
  ],
  "systemType": "heat-pump",
  "confidence": 95,
  "isThermostatImage": true,
  "reasons": ["Clear terminal labels visible", "Multiple wire connections detected", "Heat pump indicators present"],
  "suggestions": ["Wire connections are clearly visible"]
}

REMEMBER: Only mark hasWire=true if you can actually see a physical wire connected to that terminal. Be conservative - if you're not sure, mark it as false.`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.05, // Very low temperature for maximum consistency
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error("No response from OpenAI")
  }

  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in OpenAI response")
    }

    const analysisData = JSON.parse(jsonMatch[0])

    // Extract connected wires from wire connections with higher confidence threshold
    const connectedWires =
      analysisData.wireConnections
        ?.filter((conn: WireConnection) => conn.hasWire && conn.confidence > 0.6) // Increased threshold
        ?.map((conn: WireConnection) => conn.terminal) || []

    return {
      detectedTerminals: analysisData.detectedTerminals || [],
      wireConnections: analysisData.wireConnections || [],
      connectedWires,
      systemType: analysisData.systemType || "unknown",
      confidence: analysisData.confidence || 0,
      isThermostatImage: analysisData.isThermostatImage || false,
      reasons: analysisData.reasons || [],
      suggestions: analysisData.suggestions || [],
    }
  } catch (parseError) {
    console.error("Failed to parse OpenAI response:", parseError)
    console.error("Raw response:", content)
    throw new Error("Failed to parse analysis results")
  }
}

async function fallbackToTesseract(buffer: ArrayBuffer): Promise<ImageAnalysis> {
  // Import Tesseract dynamically
  const { createWorker } = await import("tesseract.js")
  const worker = await createWorker()

  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*/()[]{}.,:-_+",
    tessedit_pageseg_mode: "6",
  })

  const { data } = await worker.recognize(Buffer.from(buffer))
  await worker.terminate()

  // Simple fallback analysis
  const text = data.text.toUpperCase()
  const terminals = ["R", "RH", "RC", "C", "Y", "Y1", "Y2", "G", "W", "W1", "W2", "O", "B", "O/B", "ACC+", "ACC-"]

  const detectedTerminals = terminals.filter((terminal) => {
    const regex = new RegExp(`\\b${terminal.replace("/", "\\/")}\\b`)
    return regex.test(text)
  })

  const wireConnections = detectedTerminals.map((terminal) => ({
    terminal,
    hasWire: true, // Assume detected terminals have wires in fallback
    confidence: 0.6,
  }))

  const connectedWires = detectedTerminals

  const isHeatPump = text.includes("O/B") || text.includes("REVERSING") || text.includes("HEAT PUMP")

  return {
    detectedTerminals,
    wireConnections,
    connectedWires,
    systemType: isHeatPump ? "heat-pump" : "conventional",
    confidence: detectedTerminals.length > 0 ? 70 : 30,
    isThermostatImage: detectedTerminals.length > 0,
    reasons: [`Fallback analysis - found ${detectedTerminals.length} terminals`],
    suggestions: ["Consider retaking photo for better analysis"],
  }
}

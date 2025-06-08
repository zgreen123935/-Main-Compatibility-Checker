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

  const prompt = `You are analyzing a thermostat wiring image. I need you to be EXTREMELY THOROUGH and check EVERY SINGLE terminal for wire connections.

CRITICAL INSTRUCTIONS:
1. Examine EVERY terminal label you can see in the image
2. For EACH terminal, look carefully to see if there is a physical colored wire connected to it
3. Pay special attention to ALL terminals including: R, RH, RC, C, Y, Y1, Y2, G, W, W1, W2, O, B, O/B, ACC+, ACC-, AUX1, AUX2, E, EM
4. Do NOT miss any terminals - check the entire wiring area systematically
5. Look for wires of ALL colors: red, blue, yellow, green, white, orange, black, brown, gray, purple, pink
6. Be especially careful with black wires as they can be harder to see
7. Check both the left and right terminal blocks thoroughly

SYSTEMATIC APPROACH:
- Start from the left terminal block and check each terminal
- Move to the right terminal block and check each terminal  
- Look for any additional terminals or connections
- Double-check that you haven't missed any wires, especially darker colored ones

WHAT CONSTITUTES A WIRE CONNECTION:
- A colored wire (cable) physically inserted into or connected to a terminal
- The wire should be clearly going INTO the terminal connection point
- Empty terminals with just labels but no wires should be marked hasWire: false

Please respond in this exact JSON format and check EVERY terminal systematically:
{
  "detectedTerminals": ["R", "RH", "RC", "C", "Y1", "Y2", "G", "W1", "W2", "O/B", "ACC+", "ACC-"],
  "wireConnections": [
    {"terminal": "RH", "hasWire": true, "wireColor": "red", "confidence": 0.95},
    {"terminal": "RC", "hasWire": false, "confidence": 0.9},
    {"terminal": "C", "hasWire": true, "wireColor": "blue", "confidence": 0.95},
    {"terminal": "Y1", "hasWire": true, "wireColor": "yellow", "confidence": 0.95},
    {"terminal": "Y2", "hasWire": false, "confidence": 0.9},
    {"terminal": "G", "hasWire": true, "wireColor": "green", "confidence": 0.95},
    {"terminal": "W1", "hasWire": false, "confidence": 0.9},
    {"terminal": "W2", "hasWire": true, "wireColor": "white", "confidence": 0.95},
    {"terminal": "O/B", "hasWire": true, "wireColor": "orange", "confidence": 0.95},
    {"terminal": "ACC+", "hasWire": true, "wireColor": "black", "confidence": 0.9},
    {"terminal": "ACC-", "hasWire": false, "confidence": 0.9}
  ],
  "systemType": "heat-pump",
  "confidence": 95,
  "isThermostatImage": true,
  "reasons": ["Clear terminal labels visible", "Multiple wire connections detected", "Heat pump indicators present"],
  "suggestions": ["All wire connections clearly visible"]
}

IMPORTANT: Do not miss ANY wire connections. Check every single terminal methodically. Pay extra attention to:
- Black wires (they can be harder to spot)
- ACC+ and ACC- terminals (accessory terminals)
- Any terminals on the edges or corners
- Both left and right terminal blocks

Be thorough and systematic in your analysis!`

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
      max_tokens: 1200, // Increased for more detailed analysis
      temperature: 0.02, // Even lower temperature for maximum consistency
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

    // Extract connected wires from wire connections - keep threshold at 0.6 but be more inclusive
    const connectedWires =
      analysisData.wireConnections
        ?.filter((conn: WireConnection) => conn.hasWire && conn.confidence > 0.5) // Lowered back to 0.5 to catch more connections
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

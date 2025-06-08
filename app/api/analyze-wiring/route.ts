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
  rawAnalysis?: string
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("image") as File
    const mode = (formData.get("mode") as string) || "standard"

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

    // Use direct GPT-4 Vision analysis with raw output option
    const analysis = await analyzeWithGPT4Vision(base64Image, mimeType, mode === "raw")

    return NextResponse.json({
      success: true,
      ...analysis,
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}

async function analyzeWithGPT4Vision(
  base64Image: string,
  mimeType: string,
  includeRaw = false,
): Promise<ImageAnalysis> {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    throw new Error("OpenAI API key not configured")
  }

  // Use a direct, detailed prompt focused on maximum accuracy
  const prompt = `You are analyzing a thermostat wiring image. I need you to identify EVERY wire connection with maximum accuracy.

CRITICAL INSTRUCTIONS:
1. Examine the image EXTREMELY carefully
2. Count ALL visible wires entering the thermostat
3. Identify EVERY terminal label visible (R, Rc, Rh, C, Y1, Y2, G, W1, W2, O, B, etc.)
4. For EACH terminal, determine if it has a wire connected
5. Note the color of each connected wire
6. Be EXTREMELY thorough - don't miss any connections

DETAILED ANALYSIS STEPS:
1. First, count the total number of colored wires visible in the image
2. Identify all terminal blocks and their positions
3. Read each terminal label carefully
4. For each terminal, check if a wire is connected to it
5. Note the color of each connected wire
6. Double-check your work by counting connections vs. visible wires
7. Look for any terminals or wires that might be partially hidden

COMMON WIRE COLORS AND THEIR TYPICAL TERMINALS:
- Red: R, Rc, or Rh (power)
- Green: G (fan)
- Yellow: Y, Y1 (cooling)
- White: W, W1 (heating)
- Blue or Black: C (common)
- Orange: O (reversing valve - heat pumps)
- Brown, Purple, Pink, Gray: Various auxiliary functions

RESPONSE FORMAT:
Provide a detailed analysis in this JSON format:

{
  "totalWiresVisible": 6,
  "detectedTerminals": ["RC", "RH", "C", "Y1", "G", "W1", "W2", "O/B"],
  "wireConnections": [
    {"terminal": "RC", "hasWire": true, "wireColor": "red", "confidence": 0.95},
    {"terminal": "RH", "hasWire": false, "confidence": 0.9},
    {"terminal": "C", "hasWire": true, "wireColor": "blue", "confidence": 0.95},
    {"terminal": "Y1", "hasWire": true, "wireColor": "yellow", "confidence": 0.95},
    {"terminal": "G", "hasWire": true, "wireColor": "green", "confidence": 0.95},
    {"terminal": "W1", "hasWire": true, "wireColor": "white", "confidence": 0.9},
    {"terminal": "W2", "hasWire": false, "confidence": 0.9},
    {"terminal": "O/B", "hasWire": false, "confidence": 0.9}
  ],
  "systemType": "conventional",
  "confidence": 95,
  "isThermostatImage": true,
  "analysisNotes": [
    "Found 5 wire connections",
    "Upper terminal block has 3 connections: RC (red), G (green), Y1 (yellow)",
    "Lower terminal block has 2 connections: C (blue), W1 (white)",
    "All visible wires are accounted for"
  ]
}

IMPORTANT: Be extremely thorough and accurate. Don't miss any wire connections.`

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
      max_tokens: 2000,
      temperature: 0.0, // Zero temperature for maximum consistency
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

    // Extract connected wires from wire connections
    const connectedWires =
      analysisData.wireConnections
        ?.filter((conn: WireConnection) => conn.hasWire && conn.confidence > 0.4)
        ?.map((conn: WireConnection) => conn.terminal) || []

    // Determine system type
    const systemType = determineSystemType(analysisData.wireConnections || [])

    return {
      detectedTerminals: analysisData.detectedTerminals || [],
      wireConnections: analysisData.wireConnections || [],
      connectedWires,
      systemType: analysisData.systemType || systemType,
      confidence: analysisData.confidence || 0,
      isThermostatImage: analysisData.isThermostatImage !== false,
      reasons: analysisData.analysisNotes || [],
      suggestions: [
        "If connections are missing, try taking another photo with better lighting",
        "Make sure all terminal labels are clearly visible",
        "Ensure all wires are clearly visible and not hidden",
      ],
      rawAnalysis: includeRaw ? content : undefined,
    }
  } catch (parseError) {
    console.error("Failed to parse OpenAI response:", parseError)
    console.error("Raw response:", content)

    // Return a simplified analysis with the raw content for debugging
    return {
      detectedTerminals: [],
      wireConnections: [],
      connectedWires: [],
      systemType: "unknown",
      confidence: 0,
      isThermostatImage: true,
      reasons: ["Failed to parse analysis results"],
      suggestions: ["Please try another photo with clearer terminal labels"],
      rawAnalysis: includeRaw ? content : undefined,
    }
  }
}

function determineSystemType(connections: WireConnection[]): "heat-pump" | "conventional" | "unknown" {
  const terminals = connections.filter((c) => c.hasWire).map((c) => c.terminal)

  if (terminals.some((t) => t.includes("O") || t.includes("B") || t === "O/B")) {
    return "heat-pump"
  }

  if (terminals.some((t) => t.includes("W"))) {
    return "conventional"
  }

  return "unknown"
}

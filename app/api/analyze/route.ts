import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to analyze thermostat front panel image
async function analyzeThermostatFront(imageUrl: string) {
  try {
    const frontPrompt = `Please analyze this thermostat front panel image and provide:

1. Make and Model Identification
   - Brand names or model numbers visible
   - Logos or labels
   - Distinguishing design features

2. Display Description
   - Type (digital, touchscreen, analog)
   - Current display content (temperature, mode icons)
   - Backlight status
   - Screen type (LCD, LED, etc.)

3. Buttons and Controls
   - All visible buttons, switches, knobs
   - Labels and icons
   - Touch interface elements
   - Mechanical controls

4. Visible Text/Labels
   - Brand names
   - Mode labels
   - Instructions
   - Warning text
   - Any voltage or system type labels

5. Mode Indicators
   - Active status lights
   - Mode indicators
   - System status displays

6. Display Type Details
   - Interface type confirmation
   - Screen technology
   - Mechanical elements

7. Surrounding Installation
   - Wall material and condition
   - Mounting method
   - Visible hardware
   - Wall plate details

Format your response as a JSON object containing only your observations. Do not include any compatibility analysis or recommendations.`;

    console.log('Starting front panel analysis with URL:', imageUrl);
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing thermostat front panels. Focus ONLY on describing what you see in the image. Do not make any assumptions or conclusions about compatibility."
        },
        {
          role: "user",
          content: [
            { type: "text", text: frontPrompt },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            },
          ],
        },
      ],
      max_tokens: 1000
    });
    console.log('Front panel analysis completed successfully');
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in analyzeThermostatFront:', error);
    throw error;
  }
}

// Function to analyze thermostat wiring image
async function analyzeWiring(imageUrl: string) {
  const wiringPrompt = `Please analyze this thermostat wiring image and describe ONLY the terminals listed below. Do not combine terminals or make up new ones. Each terminal must be listed exactly as shown:

1. Power Terminals - Check ONLY for these exact names:
   - R
   - Rc
   - Rh
   - C
   IMPORTANT: Check if there is a jumper wire between Rh and Rc terminals. This might look like a small metal bridge or wire connecting these terminals.

2. Heat Terminals - Check ONLY for these exact names:
   - W or W1 (these mean the same thing)
   - W2
   - W3
   - W2/AUX
   - AUX or E

3. Cool/Fan Terminals - Check ONLY for these exact names:
   - Y or Y1 (these mean the same thing)
   - Y2
   - Y3
   - G or G1 (these mean the same thing)
   - G2 and G3

4. Heat Pump Terminals - Check ONLY for these exact names:
   - O
   - O/B or OB (these mean the same thing)
   - B

5. Additional Terminals - Check ONLY for these exact names:
   - K
   - U1
   - X
   - DHUM
   - HUM
   - PEK
   - V+Vg
   - D+ D-
   - 1234
   - ABCD

Also note these physical characteristics:
- Wire thickness (thin multi-colored vs thick black/white/red)
- Connection type (terminal blocks vs wire nuts)
- Any visible voltage markings
- Wire colors and conditions

Format your response as a JSON object with:
1. Terminal Analysis:
{
  "terminals": {
    "[terminal_name]": {
      "present": boolean,
      "wire_connected": boolean,
      "wire_color": string or null
    }
  },
  "jumpers": {
    "rh_rc_jumper": boolean,
    "jumper_type": "metal bridge" | "wire" | null
  }
}

2. Physical Characteristics:
{
  "wire_thickness": "thin" | "thick",
  "connection_type": "terminal block" | "wire nuts" | "other",
  "voltage_markings": string or null,
  "wire_colors_present": string[]
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert at analyzing thermostat wiring. Focus ONLY on describing what you see in the image. Do not make any assumptions about system type or compatibility."
      },
      {
        role: "user",
        content: [
          { type: "text", text: wiringPrompt },
          {
            type: "image_url",
            image_url: { url: imageUrl }
          },
        ],
      },
    ],
    max_tokens: 1000,
    reasoning_effort: "high"
  });

  return response.choices[0].message.content;
}

// Function to analyze compatibility based on image analysis results
async function analyzeCompatibility(frontAnalysis: string | null, wiringAnalysis: string | null) {
  const compatibilitySystemPrompt = `You are a Mysa thermostat compatibility expert. Analyze the provided thermostat analysis results and determine compatibility with Mysa products.

Key Compatibility Rules:
1. Mysa for Central HVAC (Low-Voltage):
   - Requires 24V power
   - Needs C-wire or adapter
   - Compatible with standard HVAC controls
   - NOT for line voltage/baseboard heating

2. Mysa for Baseboard Heating:
   - For 120-240V systems only
   - Requires 4 wires (line/load/neutral or two hots)
   - NOT for low-voltage HVAC
   - NOT for 2-wire setups

Provide your analysis in JSON format with:
{
  "recommended_product": "Mysa for Central HVAC" | "Mysa for Baseboard Heating" | "None",
  "confidence_score": number,
  "common_power_adapter_required": boolean,
  "compatibility_notes": string,
  "escalate_to_human": boolean
}`;

  const response = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      {
        role: "system",
        content: compatibilitySystemPrompt
      },
      {
        role: "user",
        content: `Analyze these thermostat analysis results for Mysa compatibility:

Front Panel Analysis:
${frontAnalysis}

Wiring Analysis:
${wiringAnalysis}

Provide a compatibility assessment following the specified format.`
      },
    ],
    reasoning_effort: "high"
  });

  return response.choices[0].message.content;
}

export async function POST(req: Request) {
  try {
    const { imageUrl, controlMethod } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Get the appropriate analysis based on control method
    let imageAnalysis;
    try {
      if (controlMethod === 'wiring') {
        imageAnalysis = await analyzeWiring(imageUrl);
      } else if (controlMethod === 'front') {
        imageAnalysis = await analyzeThermostatFront(imageUrl);
      } else {
        return NextResponse.json(
          { error: `Invalid control method: ${controlMethod}` },
          { status: 400 }
        );
      }
    } catch (analysisError) {
      console.error('Error during image analysis:', analysisError);
      return NextResponse.json(
        { error: 'Error analyzing image', details: analysisError.message },
        { status: 500 }
      );
    }

    // Get or create session ID from cookies
    const cookieStore = cookies();
    let sessionId = cookieStore.get('sessionId')?.value;
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(7);
    }

    // Store analysis in database
    try {
      const dbAnalysis = await prisma.analysis.create({
        data: {
          imageUrl,
          controlMethod,
          analysisResult: imageAnalysis,
          sessionId,
        }
      });

      return NextResponse.json({ 
        analysis: imageAnalysis,
        analysisId: dbAnalysis.id
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Still return the analysis even if DB storage fails
      return NextResponse.json({ 
        analysis: imageAnalysis,
        error: 'Failed to store in database',
        details: dbError.message
      });
    }
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return NextResponse.json(
      { error: 'Error analyzing image', details: error.message },
      { status: 500 }
    );
  }
}

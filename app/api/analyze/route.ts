import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { imageUrl, controlMethod } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are a thermostat compatibility expert. Analyze the image of a ${controlMethod} and determine its compatibility with Mysa smart thermostats. Focus on identifying the model, wiring configuration, and any compatibility factors.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this thermostat image and provide compatibility information." },
            {
              type: "image_url",
              image_url: imageUrl,
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: 'Error analyzing image' },
      { status: 500 }
    );
  }
}

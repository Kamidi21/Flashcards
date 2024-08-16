import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const systemPrompt = `Create 10 flashcards based on the given text. Each flashcard should have a 'front' (question or prompt) and a 'back' (answer or explanation). Return the flashcards as a JSON array in the following format, without any markdown formatting or code blocks:
{
  "flashcards": [
    {
      "front": "Question or prompt",
      "back": "Answer or explanation"
    }
  ]
}`;

export async function POST(req) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { text } = await req.json();
    console.log("Received text:", text);

    const result = await model.generateContent(`${systemPrompt}\n\nText: ${text}`);
    const response = await result.response;
    
    console.log("AI response:", response.text());
    
    // Remove any potential markdown code block
    const cleanedResponse = response.text().replace(/```json\n?|\n?```/g, '').trim();
    
    const flashcards = JSON.parse(cleanedResponse);
    return NextResponse.json(flashcards);
  } catch (error) {
    console.error("Error in flashcard generation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
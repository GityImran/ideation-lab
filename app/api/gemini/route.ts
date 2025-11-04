import { NextRequest, NextResponse } from "next/server"

// Using the official Google Generative AI SDK
// npm i @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai"

const MODEL_NAME = process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash"

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set on the server. Please add it to your environment." },
        { status: 500 }
      )
    }

    const { textCombined, fileName, prompt, mode, topics } = (await req.json()) as {
      textCombined?: string
      fileName?: string
      prompt?: string
      mode?: "summary" | "study" | "placement"
      topics?: string[]
    }

    if (!textCombined || !textCombined.trim()) {
      return NextResponse.json({ error: "Missing textCombined" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const task: "summary" | "study" | "placement" = mode === "study" ? "study" : mode === "placement" ? "placement" : "summary"

    // Build task-specific prompt and schema
    const promptSummary =
      prompt?.trim() ||
      "You are an assistant that receives all text extracted from a PowerPoint deck. Provide a concise overall summary, a list of core topics, and slide-by-slide gist points."
    const schemaSummary = `\nReturn ONLY valid JSON (no backticks, no markdown) with this exact shape:\n{
  "summary": string, // overall concise summary (<= 120 words)
  "topics": string[], // 5-12 key topics
  "bySlide": Array<{ "slide": number, "points": string[] }>
}`

    const promptStudy =
      "From the provided presentation text (and optionally topics), produce study materials: flashcards and quizzes that test understanding. Keep wording clear and unambiguous."
    const schemaStudy = `\nReturn ONLY valid JSON (no backticks, no markdown) with this exact shape:\n{
  "flashcards": Array<{ "question": string, "answer": string }>, // 8-16 items
  "quizzes": Array<{ "question": string, "options": string[], "correctIndex": number }>
}`

    const promptPlacement =
      "Analyze attention span and cognitive load across the presentation. Suggest where to insert quizzes and flashcards to maintain engagement. Consider slide density, transitions, topic shifts, and natural pause points."
    const schemaPlacement = `\nReturn ONLY valid JSON (no backticks, no markdown) with this exact shape:\n{
  "suggestions": Array<{
    "slide": number,              // slide number (1-indexed)
    "type": "quiz" | "flashcard", // which asset to insert
    "position": "before" | "after" | "during", // relative to the slide
    "reason": string,             // concise rationale focused on attention span or content density
    "notes"?: string              // optional extra notes
  }>
}`

    const systemPreamble = fileName ? `File: ${fileName}` : undefined

    const input = [
      systemPreamble ? `${systemPreamble}\n` : "",
      task === "summary" ? promptSummary : promptStudy,
      "\n---\n",
      "Presentation Text:\n",
      textCombined,
      task === "placement" && topics?.length ? `\n\nKnown Topics:\n- ${topics.join("\n- ")}` : "",
      "\n---\n",
      task === "summary" ? schemaSummary : task === "study" ? schemaStudy : schemaPlacement,
    ].join("")

    // Retry logic for rate limiting
    const maxRetries = 3
    let attempt = 0
    let result
    while (attempt < maxRetries) {
      try {
        result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: input }] }] })
        break // Success, exit loop
      } catch (err: any) {
        const isRateLimit = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("Too Many Requests")
        if (isRateLimit && attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000 // Exponential backoff with jitter
          console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
          attempt++
        } else {
          throw err // Re-throw if not rate limit or max retries reached
        }
      }
    }
    if (!result) throw new Error("Failed to generate content after retries")
    const responseText = result.response?.text?.() || ""

    function tryExtractJSON(text: string): any | null {
      // Attempt direct parse first
      try {
        return JSON.parse(text)
      } catch (_) {}
      // Attempt to extract the first JSON object in the text
      const start = text.indexOf("{")
      const end = text.lastIndexOf("}")
      if (start !== -1 && end !== -1 && end > start) {
        const maybe = text.slice(start, end + 1)
        try {
          return JSON.parse(maybe)
        } catch (_) {}
      }
      return null
    }

    const structured = tryExtractJSON(responseText)

    // Only return relevant structured keys depending on the task to keep payload clean
    let pruned: any = null
    if (structured && typeof structured === "object") {
      if (task === "summary") {
        pruned = {
          summary: structured.summary ?? "",
          topics: Array.isArray(structured.topics) ? structured.topics : [],
          bySlide: Array.isArray(structured.bySlide) ? structured.bySlide : [],
        }
      } else if (task === "study") {
        pruned = {
          flashcards: Array.isArray(structured.flashcards) ? structured.flashcards : [],
          quizzes: Array.isArray(structured.quizzes) ? structured.quizzes : [],
        }
      } else if (task === "placement") {
        pruned = {
          suggestions: Array.isArray(structured.suggestions) ? structured.suggestions : [],
        }
      }
    }

    return NextResponse.json({ output: responseText, model: MODEL_NAME, structured: pruned, mode: task })
  } catch (err: any) {
    console.error("/api/gemini error", err)
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 })
  }
}

"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

export default function UploadPage() {
  const [data, setData] = useState<any | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [geminiOutput, setGeminiOutput] = useState<string>("") // raw text (optional)
  const [geminiError, setGeminiError] = useState<string>("")
  const [geminiModel, setGeminiModel] = useState<string>("")
  const [combinedText, setCombinedText] = useState<string>("")
  const [geminiPending, setGeminiPending] = useState<boolean>(false)
  const [structured, setStructured] = useState<any | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    
    try {
      const raw = sessionStorage.getItem("pptParsedData")
      const name = sessionStorage.getItem("pptParsedFileName")
      const currentPptSessionId = sessionStorage.getItem("currentPptSessionId")
      
      // Reset state for new PPT
      setFileName(name)
      setData(raw ? JSON.parse(raw) : null)
      setGeminiOutput("")
      setGeminiError("")
      setGeminiModel("")
      setCombinedText("")
      setGeminiPending(false)
      setStructured(null)
      
      // Load existing data if available
      if (raw) {
        setData(JSON.parse(raw))
      }
      
      const out = sessionStorage.getItem("geminiSummaryOutput") || ""
      const err = sessionStorage.getItem("geminiSummaryError") || ""
      const model = sessionStorage.getItem("geminiSummaryModel") || ""
      const pending = !!sessionStorage.getItem("geminiSummaryPending")
      setGeminiOutput(out)
      setGeminiError(err)
      setGeminiModel(model)
      setGeminiPending(pending)
      
      const comb = sessionStorage.getItem("pptTextCombined") || ""
      setCombinedText(comb)
      
      const structuredRaw = sessionStorage.getItem("geminiSummaryStructured")
      setStructured(structuredRaw ? JSON.parse(structuredRaw) : null)
    } catch (e) {
      console.error("Failed to load parsed PPT data", e)
    }
  }, []) // Only run once on mount

  // Poll sessionStorage while the background request is pending to update UI in-place
  useEffect(() => {
    if (typeof window === "undefined") return
    let timer: number | undefined
    const tick = () => {
      try {
        const pending = !!sessionStorage.getItem("geminiSummaryPending")
        const out = sessionStorage.getItem("geminiSummaryOutput") || ""
        const err = sessionStorage.getItem("geminiSummaryError") || ""
        const model = sessionStorage.getItem("geminiSummaryModel") || ""
        const structuredRaw = sessionStorage.getItem("geminiSummaryStructured")
        setGeminiPending(pending)
        setGeminiOutput(out)
        setGeminiError(err)
        setGeminiModel(model)
        setStructured(structuredRaw ? JSON.parse(structuredRaw) : null)
        // stop polling once finished and we have final state
        if (!pending && (out || err)) {
          if (timer) window.clearInterval(timer)
        }
      } catch (_) {
        // ignore
      }
    }
    // Start polling if pending or until output/error appears
    tick()
    timer = window.setInterval(tick, 800)
    return () => {
      if (timer) window.clearInterval(timer)
    }
  }, [])

  const slides = useMemo(() => {
    // pptx-parser returns an object with slides array; fall back to []
    if (data && Array.isArray(data.slides)) return data.slides
    if (Array.isArray(data)) return data
    return []
  }, [data])

  function extractTextFromSlide(slide: any) {
    const result: { title?: string; subtitle?: string; body: string[] } = { body: [] }

    const elements = Array.isArray(slide?.pageElements) ? slide.pageElements : []
    for (const el of elements) {
      const name: string = el?.shape?.name || el?.name || ""
      const paras: any[] = el?.shape?.text?.paragraphs || []
      if (!paras.length) continue
      for (const p of paras) {
        const spans: any[] = p?.textSpans || []
        const text = spans
          .map((s) => (s?.textRun?.content ?? ""))
          .join("")
          .trim()
        if (!text) continue

        const lowerName = name.toLowerCase()
        if (lowerName.includes("title") && !result.title) {
          result.title = text
        } else if (lowerName.includes("subtitle") && !result.subtitle) {
          result.subtitle = text
        } else {
          result.body.push(text)
        }
      }
    }

    // Fallback: some parsers may expose slide.texts directly
    if (!elements.length && Array.isArray(slide?.texts)) {
      for (const t of slide.texts) {
        const text = typeof t === "string" ? t : t?.text ?? ""
        if (text) result.body.push(text)
      }
    }

    return result
  }

  return (
  <main className="min-h-screen w-full py-12 px-6 bg-yellow-100 text-gray-900">
  <div className="max-w-2xl mx-auto space-y-10">
  <div className="text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-3">Parsed Presentation</h1>
  {fileName && <p className="text-lg font-medium">{fileName}</p>}
  </div>

  <div className="space-y-8">
  <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <Link
      href="/ppt"
    className="inline-flex items-center justify-center border-4 border-black bg-white px-3 py-2 text-sm font-extrabold uppercase tracking-tight text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none hover:bg-gray-100"
    >
        Back
            </Link>
          </div>
        </div>

        {/* Next: go to Study */}
        {structured && !geminiPending && !geminiError && (
        <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
        <Link
        href="/ppt/study"
        className="inline-flex items-center justify-center border-4 border-black bg-black px-4 py-2 text-sm font-extrabold uppercase tracking-tight text-white shadow-[6px_6px_0_0_#000] rounded-none hover:bg-gray-800 focus:outline-none"
        >
        Next
        </Link>
        </div>
        )}

        {/* Gemini Summary Section */}
        {(geminiPending || structured || geminiError) && (
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0_0_#000] rounded-none">
        <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-extrabold uppercase tracking-tight text-gray-900">Slide Gist & Core Topics</h2>
        {geminiModel && !geminiPending && (
        <span className="text-xs text-gray-500">Model: {geminiModel}</span>
        )}
        </div>
        {geminiPending ? (
        <div className="animate-pulse space-y-2" role="status" aria-live="polite">
        <div className="h-3 bg-gray-200 rounded-none" />
        <div className="h-3 bg-gray-200 rounded-none w-11/12" />
        <div className="h-3 bg-gray-200 rounded-none w-10/12" />
        <div className="h-3 bg-gray-200 rounded-none w-9/12" />
        <p className="text-xs text-gray-500 mt-2">Analyzing your slides…</p>
        </div>
        ) : geminiError ? (
        <p className="text-sm text-red-600">{geminiError}</p>
        ) : (
        <div className="space-y-4">
        {structured?.summary && (
        <section>
        <h3 className="text-sm font-extrabold uppercase tracking-tight text-gray-900 mb-1">Gist</h3>
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{structured.summary}</p>
        </section>
        )}
        {structured?.topics?.length ? (
        <section>
        <h3 className="text-sm font-extrabold uppercase tracking-tight text-gray-900 mb-2">Core Topics</h3>
        <div className="flex flex-wrap gap-2">
        {structured.topics.map((t: string, i: number) => (
        <span key={i} className="text-xs px-2 py-1 border-4 border-black bg-white text-gray-900 rounded-none font-extrabold uppercase tracking-tight">
        {t}
        </span>
        ))}
        </div>
        </section>
        ) : null}

        </div>
        )}

        </div>
        )}

        {!data && (
        <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none text-gray-900 font-extrabold uppercase tracking-tight">No parsed data found. Please upload a .pptx first.</div>
        )}

        {data && (
        <div className="space-y-6">
        <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none text-sm text-gray-700 font-extrabold uppercase tracking-tight">
        Slides detected: <span className="font-medium">{slides.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.map((slide: any, idx: number) => {
        const t = extractTextFromSlide(slide)
        return (
        <div key={idx} className="border-4 border-black p-4 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
        <h2 className="text-sm font-extrabold uppercase tracking-tight text-gray-900 mb-2">Slide {idx + 1}</h2>
        {t.title && <div className="text-lg font-extrabold uppercase tracking-tight text-gray-900">{t.title}</div>}
        {t.subtitle && <div className="text-sm text-gray-700 mt-1 font-extrabold uppercase tracking-tight">{t.subtitle}</div>}
        {t.body.length > 0 && (
        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1 mt-3 font-extrabold uppercase tracking-tight">
        {t.body.map((line, i) => (
        <li key={i}>{line}</li>
        ))}
        </ul>
        )}
        {(!t.title && !t.subtitle && t.body.length === 0) && (
        <pre className="text-xs text-gray-700 bg-gray-50 border-4 border-black rounded-none p-3 overflow-auto max-h-64 mt-3">
        {JSON.stringify(slide, null, 2)}
        </pre>
        )}
        </div>
        )
        })}
        </div>

        {/* Raw JSON fallback */}
        <details className="mt-6 border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
        <summary className="cursor-pointer text-sm text-gray-800 font-extrabold uppercase tracking-tight">Show raw JSON</summary>
        <pre className="mt-2 text-xs text-gray-700 bg-gray-50 border-4 border-black rounded-none p-3 overflow-auto">
        {JSON.stringify(data, null, 2)}
        </pre>
        </details>
        </div>
        )}
      </div>
    </main>
  )
}

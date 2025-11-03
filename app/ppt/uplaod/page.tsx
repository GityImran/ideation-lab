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
    <main className="min-h-screen w-full py-10 px-6 bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Parsed Presentation</h1>
            {fileName && <p className="text-sm text-gray-600 mt-1">{fileName}</p>}
          </div>
          <Link
            href="/ppt"
            className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200"
          >
            Back
          </Link>
        </div>

        {/* Next: go to Study */}
        {structured && !geminiPending && !geminiError && (
          <div className="mb-8">
            <Link
              href="/ppt/study"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
            </Link>
          </div>
        )}

        {/* Gemini Summary Section */}
        {(geminiPending || structured || geminiError) && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-gray-900">Slide Gist & Core Topics</h2>
              {geminiModel && !geminiPending && (
                <span className="text-xs text-gray-500">Model: {geminiModel}</span>
              )}
            </div>
            {geminiPending ? (
              <div className="animate-pulse space-y-2" role="status" aria-live="polite">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-11/12" />
                <div className="h-3 bg-gray-200 rounded w-10/12" />
                <div className="h-3 bg-gray-200 rounded w-9/12" />
                <p className="text-xs text-gray-500 mt-2">Analyzing your slides…</p>
              </div>
            ) : geminiError ? (
              <p className="text-sm text-red-600">{geminiError}</p>
            ) : (
              <div className="space-y-4">
                {structured?.summary && (
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Gist</h3>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{structured.summary}</p>
                  </section>
                )}
                {structured?.topics?.length ? (
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Core Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {structured.topics.map((t: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
          <div className="text-gray-700">No parsed data found. Please upload a .pptx first.</div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="text-sm text-gray-700">
              Slides detected: <span className="font-medium">{slides.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {slides.map((slide: any, idx: number) => {
                const t = extractTextFromSlide(slide)
                return (
                  <div key={idx} className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">Slide {idx + 1}</h2>
                    {t.title && <div className="text-lg font-semibold text-gray-900">{t.title}</div>}
                    {t.subtitle && <div className="text-sm text-gray-700 mt-1">{t.subtitle}</div>}
                    {t.body.length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1 mt-3">
                        {t.body.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    )}
                    {(!t.title && !t.subtitle && t.body.length === 0) && (
                      <pre className="text-xs text-gray-700 bg-gray-50 rounded p-3 overflow-auto max-h-64 mt-3">
                        {JSON.stringify(slide, null, 2)}
                      </pre>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Raw JSON fallback */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-800">Show raw JSON</summary>
              <pre className="mt-2 text-xs text-gray-700 bg-gray-50 rounded p-3 overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  )
}

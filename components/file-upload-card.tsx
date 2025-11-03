"use client"

import type React from "react"
import { useRef, useState } from "react"
import Link from "next/link"
import { GraduationCap, FileUp, File } from "lucide-react"
import { clearAllSessionData, getCurrentPptSessionId } from "@/lib/session-storage-utils"

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

export function FileUploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  function openPicker() {
    inputRef.current?.click()
  }

  // Extract all visible text from the parsed ppt json
  function extractAllTextFromPpt(parsed: any): { bySlide: string[][]; flat: string[] } {
    const slides: any[] = Array.isArray(parsed?.slides) ? parsed.slides : Array.isArray(parsed) ? parsed : []
    const bySlide: string[][] = []
    const flat: string[] = []

    for (const slide of slides) {
      const lines: string[] = []
      const elements = Array.isArray(slide?.pageElements) ? slide.pageElements : []
      if (elements.length) {
        for (const el of elements) {
          const paras: any[] = el?.shape?.text?.paragraphs || []
          if (!paras.length) continue
          for (const p of paras) {
            const spans: any[] = p?.textSpans || []
            const text = spans
              .map((s) => (s?.textRun?.content ?? ""))
              .join("")
              .trim()
            if (text) {
              lines.push(text)
              flat.push(text)
            }
          }
        }
      }
      // Fallback
      if (!elements.length && Array.isArray(slide?.texts)) {
        for (const t of slide.texts) {
          const text = typeof t === "string" ? t : t?.text ?? ""
          if (text) {
            lines.push(text)
            flat.push(text)
          }
        }
      }
      bySlide.push(lines)
    }

    return { bySlide, flat }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    setIsReady(false)
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      setFileName(null)
      setError("File exceeds 20 MB limit.")
      setIsReady(false)
      return
    }
    const name = file.name
    setFileName(name)
    const lower = name.toLowerCase()
    const isPpt = lower.endsWith(".ppt")
    const isPptx = lower.endsWith(".pptx")
    if (!isPpt && !isPptx) {
      setError("Please enter valid file")
      setIsReady(false)
      return
    }
    // Parse only PPTX in-browser using pptx-parser
    if (isPpt) {
      setError("Parsing .ppt (legacy) is not supported in the browser. Please upload a .pptx file.")
      setIsReady(false)
      return
    }

    try {
      setLoading(true)
      // Dynamic import to keep SSR safe and reduce bundle until needed
      const { default: parse } = await import("pptx-parser")
      const pptJson = await parse(file as File)
      // Persist for next page
      if (typeof window !== "undefined") {
        // Clear all previous data to ensure clean state
        clearAllSessionData()
        
        // Generate a unique PPT session ID for this upload
        const pptSessionId = getCurrentPptSessionId()
        
        // Store new PPT data
        sessionStorage.setItem("pptParsedData", JSON.stringify(pptJson))
        sessionStorage.setItem("pptParsedFileName", name)
        sessionStorage.setItem("currentPptSessionId", pptSessionId)

        // Extract and persist all text content for LLM usage later
        const { bySlide, flat } = extractAllTextFromPpt(pptJson)
        sessionStorage.setItem("pptTextBySlide", JSON.stringify(bySlide))
        sessionStorage.setItem("pptTextArray", JSON.stringify(flat))
        const combined = flat.join("\n")
        sessionStorage.setItem("pptTextCombined", combined)

        // Fire-and-forget: call backend Gemini API (summary mode)
        ;(async () => {
          try {
            // mark pending (previous values already cleared above)
            sessionStorage.setItem("geminiSummaryPending", "1")
            const mockPrompt =
              "You are given the full text extracted from a PowerPoint deck. Provide an overall gist, key topics, and slide-by-slide gist points. Keep it concise."
            const res = await fetch("/api/gemini", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ textCombined: combined, fileName: name, prompt: mockPrompt, mode: "summary" }),
            })
            const json = await res.json()
            if (res.ok) {
              sessionStorage.setItem("geminiSummaryOutput", json.output || "")
              sessionStorage.setItem("geminiSummaryModel", json.model || "")
              sessionStorage.removeItem("geminiSummaryError")
              if (json.structured) {
                sessionStorage.setItem("geminiSummaryStructured", JSON.stringify(json.structured))
              } else {
                sessionStorage.removeItem("geminiSummaryStructured")
              }
            } else {
              sessionStorage.setItem("geminiSummaryError", json?.error || "Gemini call failed")
              sessionStorage.removeItem("geminiSummaryStructured")
            }
          } catch (e: any) {
            sessionStorage.setItem("geminiSummaryError", e?.message || "Gemini call failed")
            sessionStorage.removeItem("geminiSummaryStructured")
          } finally {
            // always clear pending at the end
            sessionStorage.removeItem("geminiSummaryPending")
          }
        })()
      }
      setIsReady(true)
    } catch (err) {
      console.error(err)
      setError("Failed to parse presentation. Please ensure it's a valid .pptx file.")
      setIsReady(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Upload your presentation" className="w-full max-w-lg px-6">
      {/* Glassmorphic card */}
      <div className="relative w-full rounded-2xl bg-white/60 backdrop-blur-lg border border-white/60 shadow-lg ring-1 ring-black/5">
        <div className="p-8 flex flex-col items-center text-center gap-6">
          {/* Educational header */}
          <div className="flex items-center gap-2">
            <GraduationCap className="size-6 text-blue-600" aria-hidden="true" />
            <h1 className="text-xl font-semibold text-gray-800 text-balance">Upload Your Lecture Slides</h1>
          </div>

          {/* Clickable upload area */}
          <button
            type="button"
            onClick={openPicker}
            className="group w-full rounded-xl border border-white/70 bg-white/70 hover:bg-white/80 transition-colors cursor-pointer"
            aria-label="Choose a .pptx file to upload"
          >
            <div className="px-6 py-10 flex flex-col items-center justify-center gap-3">
              <FileUp className="size-8 text-blue-600" aria-hidden="true" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-gray-800">Click to upload a PowerPoint file</span>
                <span className="text-xs text-gray-600">.ppt or .pptx</span>
              </div>
            </div>
          </button>

          {/* Hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleChange}
            className="sr-only"
            aria-hidden="true"
          />

          {/* Selected file feedback */}
          {fileName && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-white/70 border border-white/60"
              role="status"
              aria-live="polite"
            >
              <File className="size-4 text-blue-600" aria-hidden="true" />
              <span className="text-sm text-gray-800">{fileName}</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {/* Loading */}
          {loading && <p className="text-sm text-gray-700">Parsing your presentation…</p>}

          {/* Next button when valid */}
          {isReady && !loading && (
            <Link
              href="/ppt/uplaod"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Next
            </Link>
          )}

          {/* Size limit note */}
          <p className="text-xs text-gray-600">Max file size: 20 MB</p>
        </div>
      </div>
    </section>
  )
}

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
            const text = spans.map((s) => (s?.textRun?.content ?? "")).join("").trim()
            if (text) {
              lines.push(text)
              flat.push(text)
            }
          }
        }
      }
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
    if (isPpt) {
      setError("Parsing .ppt (legacy) is not supported in the browser. Please upload a .pptx file.")
      setIsReady(false)
      return
    }

    try {
      setLoading(true)
      const { default: parse } = await import("pptx-parser")
      const pptJson = await parse(file as File)
      if (typeof window !== "undefined") {
        clearAllSessionData()
        const pptSessionId = getCurrentPptSessionId()
        sessionStorage.setItem("pptParsedData", JSON.stringify(pptJson))
        sessionStorage.setItem("pptParsedFileName", name)
        sessionStorage.setItem("currentPptSessionId", pptSessionId)

        const { bySlide, flat } = extractAllTextFromPpt(pptJson)
        sessionStorage.setItem("pptTextBySlide", JSON.stringify(bySlide))
        sessionStorage.setItem("pptTextArray", JSON.stringify(flat))
        const combined = flat.join("\n")
        if (!combined.trim()) {
          setError("No text found in the presentation. Please ensure it contains readable text content.")
          setIsReady(false)
          return
        }
        sessionStorage.setItem("pptTextCombined", combined)

        ;(async () => {
          try {
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
    <section aria-label="Upload your presentation" className="w-full max-w-lg mx-auto">
      <div className="relative w-full border-4 border-black bg-white p-8 shadow-[6px_6px_0_0_#000] transition-all hover:shadow-[8px_8px_0_0_#000]">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-3 border-b-4 border-black pb-3 w-full justify-center">
            <GraduationCap className="size-6 text-black" aria-hidden="true" />
            <h1 className="text-2xl font-extrabold uppercase tracking-tight">Upload Your Lecture Slides</h1>
          </div>

          <button
            type="button"
            onClick={openPicker}
            className="group w-full border-4 border-black bg-yellow-200 hover:bg-yellow-300 transition-all duration-150 shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px]"
            aria-label="Choose a .pptx file to upload"
          >
            <div className="px-6 py-10 flex flex-col items-center justify-center gap-3">
              <FileUp className="size-8 text-black" aria-hidden="true" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-base font-bold text-black">Click to upload PowerPoint</span>
                <span className="text-xs text-gray-700">.ppt or .pptx</span>
              </div>
            </div>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleChange}
            className="sr-only"
            aria-hidden="true"
          />

          {fileName && (
            <div className="flex items-center gap-2 border-2 border-black px-3 py-2 bg-white shadow-[3px_3px_0_0_#000]">
              <File className="size-4 text-black" aria-hidden="true" />
              <span className="text-sm font-medium text-black">{fileName}</span>
            </div>
          )}

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          {loading && <p className="text-sm font-semibold text-gray-800">Parsing your presentation…</p>}

          {isReady && !loading && (
            <Link
              href="/ppt/study"
              className="inline-flex items-center justify-center border-4 border-black bg-green-300 px-5 py-2 text-sm font-bold shadow-[4px_4px_0_0_#000] hover:bg-green-400 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            >
              Next →
            </Link>
          )}

          <p className="text-xs text-gray-800 font-medium">Max file size: 20 MB</p>
        </div>
      </div>
    </section>
  )
}

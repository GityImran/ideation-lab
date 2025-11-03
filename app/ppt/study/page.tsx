"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { SessionManager } from "@/components/session-manager"
import { PPTXGenerator } from "@/components/pptx-generator"

// Types for the structured study payload returned by Gemini
type Flashcard = { question: string; answer: string }
type Quiz = { question: string; options: string[]; correctIndex: number }

type StructuredStudy = {
  summary?: string
  topics?: string[]
  flashcards?: Flashcard[]
  quizzes?: Quiz[]
  bySlide?: { slide: number; points: string[] }[]
}

export default function StudyPage() {
  const [structured, setStructured] = useState<StructuredStudy | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [ready, setReady] = useState<boolean>(false)
  const [pending, setPending] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [model, setModel] = useState<string>("")

  // Flashcards UI state
  const [cardIndex, setCardIndex] = useState<number>(0)
  const [showAnswer, setShowAnswer] = useState<boolean>(false)

  // Quizzes UI state
  const [quizIndex, setQuizIndex] = useState<number>(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState<boolean>(false)
  
  // PPT Session ID - generated when PPT is uploaded
  const [pptSessionId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("currentPptSessionId") || `ppt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    return ""
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    
    const name = sessionStorage.getItem("pptParsedFileName")
    const currentPptSessionId = sessionStorage.getItem("currentPptSessionId")
    
    // Reset all state when PPT session changes
    setFileName(name)
    setStructured(null)
    setError("")
    setModel("")
    setPending(false)
    setCardIndex(0)
    setShowAnswer(false)
    setQuizIndex(0)
    setSelected(null)
    setShowResult(false)
    setReady(true)

    // Check if we have study data for this PPT session
    const existing = sessionStorage.getItem("geminiStudyStructured")
    const existingErr = sessionStorage.getItem("geminiStudyError") || ""
    const existingModel = sessionStorage.getItem("geminiStudyModel") || ""
    const isPending = !!sessionStorage.getItem("geminiStudyPending")
    
    if (existing) {
      setStructured(JSON.parse(existing))
      setError(existingErr)
      setModel(existingModel)
      setPending(isPending)
    } else if (!isPending) {
      // Trigger fetch for new PPT
      const combined = sessionStorage.getItem("pptTextCombined") || ""
      if (!combined.trim()) return
      
      ;(async () => {
        try {
          setPending(true)
          sessionStorage.setItem("geminiStudyPending", "1")
          sessionStorage.removeItem("geminiStudyStructured")
          sessionStorage.removeItem("geminiStudyError")
          sessionStorage.removeItem("geminiStudyModel")
          
          const res = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ textCombined: combined, fileName: name || undefined, mode: "study" }),
          })
          const json = await res.json()
          if (res.ok) {
            if (json.structured) {
              sessionStorage.setItem("geminiStudyStructured", JSON.stringify(json.structured))
              setStructured(json.structured)
            }
            sessionStorage.setItem("geminiStudyModel", json.model || "")
            setModel(json.model || "")
            sessionStorage.removeItem("geminiStudyError")
            setError("")
          } else {
            const msg = json?.error || "Gemini call failed"
            sessionStorage.setItem("geminiStudyError", msg)
            setError(msg)
          }
        } catch (e: any) {
          const msg = e?.message || "Gemini call failed"
          sessionStorage.setItem("geminiStudyError", msg)
          setError(msg)
        } finally {
          sessionStorage.removeItem("geminiStudyPending")
          setPending(false)
        }
      })()
    }
  }, [pptSessionId]) // Re-run when PPT session changes

  const flashcards: Flashcard[] = useMemo(() => structured?.flashcards ?? [], [structured])
  const quizzes: Quiz[] = useMemo(() => structured?.quizzes ?? [], [structured])

  function nextCard() {
    setShowAnswer(false)
    setCardIndex((i) => (flashcards.length ? (i + 1) % flashcards.length : 0))
  }
  function prevCard() {
    setShowAnswer(false)
    setCardIndex((i) => (flashcards.length ? (i - 1 + flashcards.length) % flashcards.length : 0))
  }

  function submitQuiz(choice: number) {
    setSelected(choice)
    setShowResult(true)
  }
  function nextQuiz() {
    setSelected(null)
    setShowResult(false)
    setQuizIndex((i) => (quizzes.length ? (i + 1) % quizzes.length : 0))
  }
  function prevQuiz() {
    setSelected(null)
    setShowResult(false)
    setQuizIndex((i) => (quizzes.length ? (i - 1 + quizzes.length) % quizzes.length : 0))
  }

  return (
    <main className="min-h-screen w-full py-8 px-6 bg-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Study Mode</h1>
            {fileName && <p className="text-sm text-gray-600 mt-1">{fileName}</p>}
          </div>
          <div className="flex gap-2">
            <Link href="/ppt/uplaod" className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200">
              Back to Upload
            </Link>
            <Link href="/dashboard" className="rounded-md bg-blue-100 px-3 py-2 text-sm text-blue-800 hover:bg-blue-200">
              Dashboard
            </Link>
            <Link href="/sessions" className="rounded-md bg-purple-100 px-3 py-2 text-sm text-purple-800 hover:bg-purple-200">
              All Sessions
            </Link>
            <Link href="/ppt" className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200">
              New File
            </Link>
          </div>
        </div>

        {!ready && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-11/12 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-10/12" />
          </div>
        )}

        {ready && pending && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-11/12 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-10/12" />
            <p className="text-xs text-gray-500 mt-2">Generating flashcards and quizzes…</p>
          </div>
        )}

        {ready && !pending && !structured && !error && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            Study data not found. Please upload slides and wait for analysis to complete.
          </div>
        )}

        {error && !pending && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {structured && (
          <div className="space-y-6">
            {/* Session Management */}
            <SessionManager
              pptFileName={fileName || undefined}
              pptSessionId={pptSessionId}
              flashcards={flashcards}
              quizzes={quizzes}
            />

            {/* PPTX Generator */}
            <div className="flex justify-center">
              <PPTXGenerator
                pptFileName={fileName || "Presentation"}
                pptSessionId={pptSessionId}
                flashcards={flashcards}
                quizzes={quizzes}
              />
            </div>

            {/* Next: go to Placement */}
            <div>
              <Link
                href="/ppt/placement"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next
              </Link>
            </div>
            {/* Summary Card */}
            {structured.summary && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{structured.summary}</p>
              </section>
            )}

            {/* Topics Chips */}
            {structured.topics && structured.topics.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Topics</h2>
                <div className="flex flex-wrap gap-2">
                  {structured.topics.map((t, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Flashcards */}
            {flashcards.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Flashcards</h2>
                  <span className="text-xs text-gray-500">
                    {cardIndex + 1} / {flashcards.length}
                  </span>
                </div>
                <div className="rounded-lg border bg-white px-4 py-6">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">Q:</span> {flashcards[cardIndex].question}
                  </p>
                  {showAnswer ? (
                    <p className="mt-3 text-sm text-green-700">
                      <span className="font-medium">A:</span> {flashcards[cardIndex].answer}
                    </p>
                  ) : (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="mt-3 inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Show Answer
                    </button>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={prevCard}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextCard}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-200"
                  >
                    Next
                  </button>
                </div>
              </section>
            )}

            {/* Quizzes */}
            {quizzes.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Quiz</h2>
                  <span className="text-xs text-gray-500">
                    {quizIndex + 1} / {quizzes.length}
                  </span>
                </div>
                <div className="rounded-lg border bg-white px-4 py-6">
                  <p className="text-sm text-gray-900 font-medium">{quizzes[quizIndex].question}</p>
                  <div className="mt-3 grid gap-2">
                    {quizzes[quizIndex].options.map((opt, i) => {
                      const isCorrect = i === quizzes[quizIndex].correctIndex
                      const chosen = selected === i
                      const show = showResult
                      const base = "w-full text-left rounded-md px-3 py-2 text-sm border"
                      const idle = "bg-gray-50 text-gray-800 hover:bg-gray-100"
                      const correct = "bg-green-50 border-green-300 text-green-800"
                      const wrong = "bg-red-50 border-red-300 text-red-800"
                      const classes = show ? (isCorrect ? correct : chosen ? wrong : idle) : idle
                      return (
                        <button
                          key={i}
                          onClick={() => !show && submitQuiz(i)}
                          className={`${base} ${classes}`}
                          disabled={show}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {showResult && (
                    <div className="mt-3 text-xs text-gray-700">
                      {selected === quizzes[quizIndex].correctIndex ? (
                        <span className="text-green-700">Correct!</span>
                      ) : (
                        <span className="text-red-700">Not quite. Correct answer is option {quizzes[quizIndex].correctIndex + 1}.</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={prevQuiz}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextQuiz}
                    className="rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-200"
                  >
                    Next
                  </button>
                </div>
              </section>
            )}

            {/* By-Slide Points */}
            {structured.bySlide && structured.bySlide.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Slide Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {structured.bySlide.map((s, i) => (
                    <div key={i} className="rounded-lg border bg-white p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Slide {s.slide}</h3>
                      <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                        {(s.points || []).map((pt, j) => (
                          <li key={j}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

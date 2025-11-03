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
  <main className="min-h-screen w-full py-12 px-6 bg-yellow-100 text-gray-900">
  <div className="max-w-2xl mx-auto space-y-10">
  <div className="text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-3">Study Mode</h1>
  {fileName && <p className="text-lg font-medium">{fileName}</p>}
  </div>

  <div className="space-y-8">
  <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <div className="flex gap-2 justify-center flex-wrap">
    <Link href="/ppt/uplaod" className="border-4 border-black bg-white px-3 py-2 text-sm font-extrabold uppercase tracking-tight text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none hover:bg-gray-100">
      Back to Upload
  </Link>
    <Link href="/dashboard" className="border-4 border-black bg-white px-3 py-2 text-sm font-extrabold uppercase tracking-tight text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none hover:bg-gray-100">
      Dashboard
  </Link>
    <Link href="/sessions" className="border-4 border-black bg-white px-3 py-2 text-sm font-extrabold uppercase tracking-tight text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none hover:bg-gray-100">
      All Sessions
  </Link>
    <Link href="/ppt" className="border-4 border-black bg-black px-3 py-2 text-sm font-extrabold uppercase tracking-tight text-white shadow-[6px_6px_0_0_#000] rounded-none hover:bg-gray-800">
        New File
        </Link>
            </div>
          </div>
        </div>

        {!ready && (
        <div className="border-4 border-black bg-white p-4 animate-pulse shadow-[6px_6px_0_0_#000] rounded-none">
        <div className="h-4 bg-gray-200 rounded-none w-1/3 mb-3" />
        <div className="h-3 bg-gray-200 rounded-none w-11/12 mb-2" />
        <div className="h-3 bg-gray-200 rounded-none w-10/12" />
        </div>
        )}

        {ready && pending && (
        <div className="border-4 border-black bg-white p-4 animate-pulse shadow-[6px_6px_0_0_#000] rounded-none">
        <div className="h-4 bg-gray-200 rounded-none w-1/3 mb-3" />
        <div className="h-3 bg-gray-200 rounded-none w-11/12 mb-2" />
        <div className="h-3 bg-gray-200 rounded-none w-10/12" />
        <p className="text-xs text-gray-500 mt-2">Generating flashcards and quizzes…</p>
        </div>
        )}

        {ready && !pending && !structured && !error && (
        <div className="border-4 border-black bg-yellow-50 p-4 text-sm text-yellow-900 rounded-none">
        Study data not found. Please upload slides and wait for analysis to complete.
        </div>
        )}

        {error && !pending && (
        <div className="border-4 border-black bg-red-50 p-4 text-sm text-red-700 rounded-none">
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
            className="inline-flex items-center justify-center border-4 border-black bg-black px-4 py-2 text-sm font-extrabold uppercase tracking-tight text-white shadow-[6px_6px_0_0_#000] rounded-none hover:bg-gray-800 focus:outline-none"
            >
            Next
            </Link>
            </div>
            {/* Summary Card */}
            {structured.summary && (
            <section className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] rounded-none">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-gray-900 mb-2">Summary</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{structured.summary}</p>
            </section>
            )}

            {/* Topics Chips */}
            {structured.topics && structured.topics.length > 0 && (
            <section className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] rounded-none">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-gray-900 mb-3">Key Topics</h2>
            <div className="flex flex-wrap gap-2">
            {structured.topics.map((t, i) => (
            <span key={i} className="text-xs px-2 py-1 border-4 border-black bg-white text-gray-900 rounded-none font-extrabold uppercase tracking-tight">
            {t}
            </span>
            ))}
            </div>
            </section>
            )}

            {/* Flashcards */}
            {flashcards.length > 0 && (
            <section className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] rounded-none">
            <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-gray-900">Flashcards</h2>
            <span className="text-xs text-gray-500">
            {cardIndex + 1} / {flashcards.length}
            </span>
            </div>
            <div className="border-4 border-black bg-white px-4 py-6 rounded-none">
            <p className="text-sm text-gray-800">
            <span className="font-extrabold uppercase tracking-tight">Q:</span> {flashcards[cardIndex].question}
            </p>
            {showAnswer ? (
            <p className="mt-3 text-sm text-green-700">
            <span className="font-extrabold uppercase tracking-tight">A:</span> {flashcards[cardIndex].answer}
            </p>
            ) : (
            <button
            onClick={() => setShowAnswer(true)}
            className="mt-3 inline-flex items-center justify-center border-4 border-black bg-black px-3 py-1.5 text-xs font-extrabold uppercase tracking-tight text-white rounded-none hover:bg-gray-800"
            >
            Show Answer
            </button>
            )}
            </div>
            <div className="mt-3 flex items-center justify-between">
            <button
            onClick={prevCard}
            className="border-4 border-black bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-tight text-gray-900 rounded-none hover:bg-gray-100"
            >
            Previous
            </button>
            <button
            onClick={nextCard}
            className="border-4 border-black bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-tight text-gray-900 rounded-none hover:bg-gray-100"
            >
            Next
            </button>
            </div>
            </section>
            )}

            {/* Quizzes */}
            {quizzes.length > 0 && (
            <section className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] rounded-none">
            <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-gray-900">Quiz</h2>
            <span className="text-xs text-gray-500">
            {quizIndex + 1} / {quizzes.length}
            </span>
            </div>
            <div className="border-4 border-black bg-white px-4 py-6 rounded-none">
            <p className="text-sm text-gray-900 font-extrabold uppercase tracking-tight">{quizzes[quizIndex].question}</p>
            <div className="mt-3 grid gap-2">
            {quizzes[quizIndex].options.map((opt, i) => {
            const isCorrect = i === quizzes[quizIndex].correctIndex
            const chosen = selected === i
            const show = showResult
            const base = "w-full text-left border-4 border-black px-3 py-2 text-sm font-extrabold uppercase tracking-tight rounded-none"
            const idle = "bg-white text-gray-900 hover:bg-gray-100"
            const correct = "bg-green-100 border-green-300 text-green-800"
            const wrong = "bg-red-100 border-red-300 text-red-800"
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
            className="border-4 border-black bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-tight text-gray-900 rounded-none hover:bg-gray-100"
            >
            Previous
            </button>
            <button
            onClick={nextQuiz}
            className="border-4 border-black bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-tight text-gray-900 rounded-none hover:bg-gray-100"
            >
            Next
            </button>
            </div>
            </section>
            )}

            {/* By-Slide Points */}
            {structured.bySlide && structured.bySlide.length > 0 && (
            <section className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_0_#000] rounded-none">
            <h2 className="text-lg font-extrabold uppercase tracking-tight text-gray-900 mb-3">Slide Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structured.bySlide.map((s, i) => (
            <div key={i} className="border-4 border-black bg-white p-4 rounded-none">
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-gray-900 mb-2">Slide {s.slide}</h3>
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

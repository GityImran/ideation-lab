"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"

type Flashcard = { question: string; answer: string }

export default function StudentFlashcardsPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true)
        setError("")
        
        // Fetch from API - this gets the actual flashcards from the session
        const response = await fetch(`/api/session?sessionId=${sessionId}&type=flashcards`)
        
        if (response.ok) {
          const sessionData = await response.json()
          const flashcards = sessionData.data || []
          
          if (Array.isArray(flashcards) && flashcards.length > 0) {
            setFlashcards(flashcards)
          } else {
            setError("No flashcards available in this session")
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          if (response.status === 404) {
            setError("Session not found. The session may have expired or been deleted.")
          } else if (response.status === 410) {
            setError("This session is no longer active.")
          } else {
            setError(errorData.error || "Failed to load flashcards from session")
          }
        }
      } catch (err: any) {
        console.error("Error loading flashcards:", err)
        setError(err?.message || "Failed to load flashcards. Please check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      loadSessionData()
    } else {
      setError("Invalid session ID")
      setLoading(false)
    }
  }, [sessionId])

  const nextCard = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setShowAnswer(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const resetCards = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  if (loading) {
  return (
  <div className="min-h-screen bg-yellow-100 flex items-center justify-center text-gray-900">
  <div className="text-center border-4 border-black p-8 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <div className="animate-spin rounded-none h-12 w-12 border-4 border-black mx-auto mb-4 border-t-gray-900"></div>
  <p className="text-gray-900 font-extrabold text-lg uppercase">Loading flashcards...</p>
  </div>
  </div>
  )
  }

  if (error || flashcards.length === 0) {
  return (
  <div className="min-h-screen bg-yellow-100 flex items-center justify-center text-gray-900">
  <Card className="w-full max-w-md mx-4 border-4 border-black bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <CardContent className="p-6 text-center">
  <h1 className="text-2xl font-extrabold text-gray-900 mb-2 uppercase">Session Not Found</h1>
  <p className="text-gray-900 mb-4 font-bold">
  {error || "No flashcards available for this session."}
  </p>
  <p className="text-sm text-gray-900 font-bold uppercase">
  Session ID: {sessionId}
  </p>
  </CardContent>
  </Card>
  </div>
  )
  }

  return (
  <div className="min-h-screen bg-yellow-100 py-12 px-6 text-gray-900">
  <div className="max-w-2xl mx-auto space-y-10">
  {/* Header */}
  <div className="text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <h1 className="text-4xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Flashcards</h1>
  <p className="text-lg font-medium">Session: {sessionId}</p>
  <div className="flex items-center justify-center gap-2 mt-2">
  <div className="w-3 h-3 bg-black rounded-none border-2 border-black"></div>
  <span className="text-sm text-gray-900 font-extrabold uppercase">Live Session</span>
  </div>
  </div>

  {/* Progress */}
  <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none text-center">
  <span className="text-sm text-gray-900 font-extrabold uppercase">
  Card {currentIndex + 1} of {flashcards.length}
  </span>
  <div className="w-full bg-black rounded-none h-4 mt-2 border-2 border-black">
  <div
  className="bg-yellow-400 h-4 rounded-none transition-all duration-300"
  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
  ></div>
  </div>
  </div>

  {/* Flashcard */}
  <Card className="mb-8 border-4 border-black bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <CardContent className="p-8 min-h-[300px] flex flex-col justify-center">
  <div className="text-center">
  <div className="mb-6">
  <h2 className="text-2xl font-extrabold text-gray-900 mb-4 uppercase">
  {flashcards[currentIndex]?.question}
  </h2>

  {showAnswer ? (
  <div className="bg-black border-4 border-black rounded-none p-4">
  <p className="text-lg text-white font-extrabold uppercase">
  {flashcards[currentIndex]?.answer}
  </p>
  </div>
  ) : (
  <Button
  onClick={() => setShowAnswer(true)}
  className="border-4 border-black bg-black text-white shadow-[6px_6px_0_0_#000] rounded-none font-extrabold uppercase hover:bg-gray-800 px-6 py-3"
  >
  Show Answer
  </Button>
  )}
  </div>
  </div>
  </CardContent>
  </Card>

        {/* Controls */}
        <div className="flex items-center justify-between">
        <Button
        onClick={prevCard}
        variant="outline"
        className="flex items-center gap-2 border-4 border-black bg-white text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none font-extrabold uppercase hover:bg-gray-100"
        >
        <ArrowLeft className="w-4 h-4" />
        Previous
        </Button>

        <Button
        onClick={resetCards}
        variant="outline"
        className="flex items-center gap-2 border-4 border-black bg-white text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none font-extrabold uppercase hover:bg-gray-100"
        >
        <RotateCcw className="w-4 h-4" />
        Reset
        </Button>

        <Button
        onClick={nextCard}
        className="flex items-center gap-2 border-4 border-black bg-black text-white shadow-[6px_6px_0_0_#000] rounded-none font-extrabold uppercase hover:bg-gray-800"
        >
        Next
        <ArrowRight className="w-4 h-4" />
        </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
        <p className="text-sm text-gray-900 font-extrabold uppercase">
        Tap "Show Answer" to reveal the answer, then use Previous/Next to navigate
        </p>
        </div>
      </div>
    </div>
  )
}

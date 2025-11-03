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
    // In a real app, you'd fetch session data from your database
    // For demo purposes, we'll try to get it from sessionStorage
    // or generate sample data
    const loadSessionData = async () => {
      try {
        setLoading(true)
        
        // Try to fetch from API first
        const response = await fetch(`/api/session?sessionId=${sessionId}&type=flashcards`)
        if (response.ok) {
          const sessionData = await response.json()
          setFlashcards(sessionData.data || [])
          return
        }
        
        // Fallback: Try to get flashcards from sessionStorage (if teacher is on same device)
        const storedFlashcards = sessionStorage.getItem(`flashcards_${sessionId}`)
        if (storedFlashcards) {
          const parsed = JSON.parse(storedFlashcards)
          setFlashcards(parsed)
        } else {
          // Generate sample flashcards for demo
          const sampleFlashcards: Flashcard[] = [
            {
              question: "What is the powerhouse of the cell?",
              answer: "Mitochondria"
            },
            {
              question: "What process converts light energy to chemical energy?",
              answer: "Photosynthesis"
            },
            {
              question: "What is the basic unit of life?",
              answer: "Cell"
            }
          ]
          setFlashcards(sampleFlashcards)
        }
      } catch (err) {
        setError("Failed to load flashcards")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      loadSessionData()
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (error || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || "No flashcards available for this session."}
            </p>
            <p className="text-sm text-gray-500">
              Session ID: {sessionId}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Flashcards</h1>
          <p className="text-gray-600">Session: {sessionId}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Live Session</span>
          </div>
        </div>

        {/* Progress */}
        <div className="text-center mb-6">
          <span className="text-sm text-gray-600">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-8 min-h-[300px] flex flex-col justify-center">
            <div className="text-center">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {flashcards[currentIndex]?.question}
                </h2>
                
                {showAnswer ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-lg text-green-800 font-medium">
                      {flashcards[currentIndex]?.answer}
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowAnswer(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
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
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button 
            onClick={resetCards}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          <Button 
            onClick={nextCard}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Tap "Show Answer" to reveal the answer, then use Previous/Next to navigate
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle, XCircle } from "lucide-react"

type Quiz = { 
  question: string
  options: string[]
  correctIndex: number
}

export default function StudentQuizPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true)
        
        // Try to fetch from API first
        const response = await fetch(`/api/session?sessionId=${sessionId}&type=quiz`)
        if (response.ok) {
          const sessionData = await response.json()
          setQuizzes(sessionData.data || [])
          return
        }
        
        // Fallback: Try to get quizzes from sessionStorage (if teacher is on same device)
        const storedQuizzes = sessionStorage.getItem(`quizzes_${sessionId}`)
        if (storedQuizzes) {
          const parsed = JSON.parse(storedQuizzes)
          setQuizzes(parsed)
        } else {
          // Generate sample quizzes for demo
          const sampleQuizzes: Quiz[] = [
            {
              question: "What is the powerhouse of the cell?",
              options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
              correctIndex: 1
            },
            {
              question: "What process converts light energy to chemical energy?",
              options: ["Respiration", "Photosynthesis", "Digestion", "Circulation"],
              correctIndex: 1
            },
            {
              question: "What is the basic unit of life?",
              options: ["Tissue", "Organ", "Cell", "Organism"],
              correctIndex: 2
            }
          ]
          setQuizzes(sampleQuizzes)
        }
      } catch (err) {
        setError("Failed to load quiz")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      loadSessionData()
    }
  }, [sessionId])

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    if (answerIndex === quizzes[currentIndex].correctIndex) {
      setScore(prev => prev + 1)
    }
    
    setAnsweredQuestions(prev => new Set([...prev, currentIndex]))
  }

  const nextQuestion = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    setCurrentIndex((prev) => (prev + 1) % quizzes.length)
  }

  const prevQuestion = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    setCurrentIndex((prev) => (prev - 1 + quizzes.length) % quizzes.length)
  }

  const resetQuiz = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions(new Set())
  }

  const getScorePercentage = () => {
    return answeredQuestions.size > 0 ? Math.round((score / answeredQuestions.size) * 100) : 0
  }

  if (loading) {
  return (
  <div className="min-h-screen bg-yellow-100 flex items-center justify-center text-gray-900">
  <div className="text-center border-4 border-black p-8 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <div className="animate-spin rounded-none h-12 w-12 border-4 border-black mx-auto mb-4 border-t-gray-900"></div>
  <p className="text-gray-900 font-extrabold text-lg uppercase">Loading quiz...</p>
  </div>
  </div>
  )
  }

  if (error || quizzes.length === 0) {
  return (
  <div className="min-h-screen bg-yellow-100 flex items-center justify-center text-gray-900">
  <Card className="w-full max-w-md mx-4 border-4 border-black bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <CardContent className="p-6 text-center">
  <h1 className="text-2xl font-extrabold text-gray-900 mb-2 uppercase">Session Not Found</h1>
  <p className="text-gray-900 mb-4 font-bold">
  {error || "No quiz available for this session."}
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
  <h1 className="text-4xl font-extrabold text-gray-900 mb-3 uppercase tracking-tight">Live Quiz</h1>
  <p className="text-lg font-medium">Session: {sessionId}</p>
  <div className="flex items-center justify-center gap-2 mt-2">
  <div className="w-3 h-3 bg-black rounded-none border-2 border-black"></div>
  <span className="text-sm text-gray-900 font-extrabold uppercase">Live Session</span>
  </div>
  </div>

  {/* Score Display */}
  {answeredQuestions.size > 0 && (
  <div className="text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
  <p className="text-sm text-gray-600 font-extrabold uppercase">Your Score</p>
  <p className="text-2xl font-extrabold text-gray-900 uppercase">
  {score}/{answeredQuestions.size} ({getScorePercentage()}%)
  </p>
  </div>
  )}

  {/* Progress */}
        <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none text-center">
    <span className="text-sm text-gray-900 font-extrabold uppercase">
      Question {currentIndex + 1} of {quizzes.length}
  </span>
  <div className="w-full bg-black rounded-none h-4 mt-2 border-2 border-black">
    <div
      className="bg-yellow-400 h-4 rounded-none transition-all duration-300"
    style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
  ></div>
  </div>
  </div>

        {/* Quiz Question */}
        <Card className="mb-8 border-4 border-black bg-white shadow-[6px_6px_0_0_#000] rounded-none">
        <CardContent className="p-8">
        <div className="text-center mb-6">
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-gray-900 mb-6">
        {quizzes[currentIndex]?.question}
        </h2>

        <div className="space-y-3">
        {quizzes[currentIndex]?.options.map((option, index) => {
        const isCorrect = index === quizzes[currentIndex].correctIndex
        const isSelected = selectedAnswer === index

        let buttonClass = "w-full text-left border-4 border-black px-4 py-3 text-sm font-extrabold uppercase rounded-none transition-all"

        if (showResult) {
        if (isCorrect) {
        buttonClass += " bg-green-100 border-green-300 text-green-800"
        } else if (isSelected) {
        buttonClass += " bg-red-100 border-red-300 text-red-800"
        } else {
        buttonClass += " bg-gray-100 border-gray-200 text-gray-600"
        }
        } else {
        buttonClass += " bg-white text-gray-900 hover:bg-gray-100"
        }

        return (
        <button
        key={index}
        onClick={() => handleAnswerSelect(index)}
        disabled={showResult}
        className={buttonClass}
        >
        <div className="flex items-center justify-between">
        <span>{option}</span>
        {showResult && isCorrect && (
        <CheckCircle className="w-5 h-5 text-green-600" />
        )}
        {showResult && isSelected && !isCorrect && (
        <XCircle className="w-5 h-5 text-red-600" />
        )}
        </div>
        </button>
        )
        })}
        </div>

        {showResult && (
        <div className="mt-4 p-3 border-4 border-black bg-white rounded-none">
        <p className="text-sm text-gray-900 font-extrabold uppercase">
        {selectedAnswer === quizzes[currentIndex].correctIndex ? (
        <span>✓ Correct! Well done!</span>
        ) : (
        <span>
        ✗ Not quite. The correct answer is: <strong>{quizzes[currentIndex].options[quizzes[currentIndex].correctIndex]}</strong>
        </span>
        )}
        </p>
        </div>
        )}
        </div>
        </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex items-center justify-between">
        <Button
        onClick={prevQuestion}
        variant="outline"
        className="flex items-center gap-2 border-4 border-black bg-white text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none font-extrabold uppercase hover:bg-gray-100"
        >
        <ArrowLeft className="w-4 h-4" />
        Previous
        </Button>

        <Button
        onClick={resetQuiz}
        variant="outline"
        className="flex items-center gap-2 border-4 border-black bg-white text-gray-900 shadow-[6px_6px_0_0_#000] rounded-none font-extrabold uppercase hover:bg-gray-100"
        >
        <RotateCcw className="w-4 h-4" />
        Reset
        </Button>

        <Button
        onClick={nextQuestion}
        className="flex items-center gap-2 border-4 border-black bg-black text-white shadow-[6px_6px_0_0_#000] rounded-none font-extrabold uppercase hover:bg-gray-800"
        >
        Next
        <ArrowRight className="w-4 h-4" />
        </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
        <p className="text-sm text-gray-900 font-extrabold uppercase">
        Select your answer and see immediate feedback
        </p>
        </div>
      </div>
    </div>
  )
}

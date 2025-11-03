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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error || "No quiz available for this session."}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Quiz</h1>
          <p className="text-gray-600">Session: {sessionId}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Live Session</span>
          </div>
        </div>

        {/* Score Display */}
        {answeredQuestions.size > 0 && (
          <div className="text-center mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="text-2xl font-bold text-purple-600">
                {score}/{answeredQuestions.size} ({getScorePercentage()}%)
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="text-center mb-6">
          <span className="text-sm text-gray-600">
            Question {currentIndex + 1} of {quizzes.length}
          </span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / quizzes.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz Question */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {quizzes[currentIndex]?.question}
              </h2>
              
              <div className="space-y-3">
                {quizzes[currentIndex]?.options.map((option, index) => {
                  const isCorrect = index === quizzes[currentIndex].correctIndex
                  const isSelected = selectedAnswer === index
                  
                  let buttonClass = "w-full text-left rounded-lg px-4 py-3 text-sm border transition-all"
                  
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass += " bg-green-50 border-green-300 text-green-800"
                    } else if (isSelected) {
                      buttonClass += " bg-red-50 border-red-300 text-red-800"
                    } else {
                      buttonClass += " bg-gray-50 border-gray-200 text-gray-600"
                    }
                  } else {
                    buttonClass += " bg-white border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300"
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
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    {selectedAnswer === quizzes[currentIndex].correctIndex ? (
                      <span className="font-medium">✓ Correct! Well done!</span>
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
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button 
            onClick={resetQuiz}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          <Button 
            onClick={nextQuestion}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Select your answer and see immediate feedback
          </p>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, QrCode, Eye, EyeOff } from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"

interface SessionData {
  sessionId: string
  type: "flashcards" | "quiz"
  data: any
  createdAt: string
  studentUrl: string
  isActive: boolean
  participants: string[]
  pptFileName?: string
  pptSessionId?: string
}

// Generate mock session data for demonstration
const generateMockSessions = (): SessionData[] => {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  const now = new Date()
  
  return [
    {
      sessionId: "mock_flashcards_1",
      type: "flashcards",
      data: [
        { question: "What is the main purpose of photosynthesis?", answer: "To convert light energy into chemical energy stored in glucose" },
        { question: "Which organelle is responsible for protein synthesis?", answer: "Ribosomes" },
        { question: "What is the function of mitochondria?", answer: "To produce ATP through cellular respiration" },
        { question: "What is the difference between DNA and RNA?", answer: "DNA is double-stranded and contains thymine, while RNA is single-stranded and contains uracil" },
        { question: "What is the process of cell division called?", answer: "Mitosis" }
      ],
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      studentUrl: `${baseUrl}/student/mock_flashcards_1/flashcards`,
      isActive: true,
      participants: ["student_1", "student_2", "student_3", "student_4"],
      pptFileName: "Biology_101_Chapter_5.pptx",
      pptSessionId: "mock_ppt_1"
    },
    {
      sessionId: "mock_quiz_1",
      type: "quiz",
      data: [
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
        },
        {
          question: "Which of the following is a component of DNA?",
          options: ["Uracil", "Thymine", "Ribose", "Phosphate only"],
          correctIndex: 1
        },
        {
          question: "What is the function of the cell membrane?",
          options: ["To store DNA", "To control what enters and exits the cell", "To produce proteins", "To generate energy"],
          correctIndex: 1
        }
      ],
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      studentUrl: `${baseUrl}/student/mock_quiz_1/quiz`,
      isActive: true,
      participants: ["student_5", "student_6", "student_7"],
      pptFileName: "Biology_101_Chapter_5.pptx",
      pptSessionId: "mock_ppt_1"
    },
    {
      sessionId: "mock_flashcards_2",
      type: "flashcards",
      data: [
        { question: "What is JavaScript?", answer: "A programming language used for web development" },
        { question: "What is React?", answer: "A JavaScript library for building user interfaces" },
        { question: "What is the DOM?", answer: "Document Object Model - a representation of HTML elements" },
        { question: "What is a closure in JavaScript?", answer: "A function that has access to variables in its outer scope" },
        { question: "What is the difference between let and var?", answer: "let has block scope while var has function scope" }
      ],
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      studentUrl: `${baseUrl}/student/mock_flashcards_2/flashcards`,
      isActive: true,
      participants: ["student_8", "student_9", "student_10", "student_11", "student_12"],
      pptFileName: "Web_Development_Basics.pptx",
      pptSessionId: "mock_ppt_2"
    },
    {
      sessionId: "mock_quiz_2",
      type: "quiz",
      data: [
        {
          question: "What does HTML stand for?",
          options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
          correctIndex: 0
        },
        {
          question: "Which CSS property is used to change the text color?",
          options: ["font-color", "text-color", "color", "text-style"],
          correctIndex: 2
        },
        {
          question: "What is the correct way to declare a variable in JavaScript?",
          options: ["variable x = 5", "var x = 5", "x := 5", "x = 5 var"],
          correctIndex: 1
        }
      ],
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      studentUrl: `${baseUrl}/student/mock_quiz_2/quiz`,
      isActive: false,
      participants: ["student_13", "student_14"],
      pptFileName: "Web_Development_Basics.pptx",
      pptSessionId: "mock_ppt_2"
    },
    {
      sessionId: "mock_flashcards_3",
      type: "flashcards",
      data: [
        { question: "What is the capital of France?", answer: "Paris" },
        { question: "What is the largest planet in our solar system?", answer: "Jupiter" },
        { question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare" },
        { question: "What is the chemical symbol for water?", answer: "H2O" },
        { question: "What year did World War II end?", answer: "1945" }
      ],
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      studentUrl: `${baseUrl}/student/mock_flashcards_3/flashcards`,
      isActive: false,
      participants: ["student_15"],
      pptFileName: "General_Knowledge_Quiz.pptx",
      pptSessionId: "mock_ppt_3"
    }
  ]
}

export default function TeacherDashboard() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/sessions")
        if (response.ok) {
          const data = await response.json()
          const realSessions = data.sessions || []
          
          // If no real sessions exist, use mock data
          if (realSessions.length === 0) {
            setSessions(generateMockSessions())
            setUseMockData(true)
          } else {
            setSessions(realSessions)
            setUseMockData(false)
          }
        } else {
          setError(`Failed to load sessions: ${response.status}`)
          // On error, show mock data for demo purposes
          setSessions(generateMockSessions())
          setUseMockData(true)
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
        setError("Failed to connect to server")
        // On error, show mock data for demo purposes
        setSessions(generateMockSessions())
        setUseMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()

    // Poll for updates every 5 seconds (only if not using mock data)
    if (!useMockData) {
      const interval = setInterval(fetchSessions, 5000)
      return () => clearInterval(interval)
    }
  }, [useMockData])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const deactivateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE"
      })
      if (response.ok) {
        setSessions(prev => prev.map(session => 
          session.sessionId === sessionId 
            ? { ...session, isActive: false }
            : session
        ))
      }
    } catch (error) {
      console.error("Failed to deactivate session:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center border-4 border-black p-8 bg-purple-400 shadow-[6px_6px_0_0_#000] rounded-none">
          <div className="animate-spin rounded-none h-12 w-12 border-4 border-black mx-auto mb-4 border-t-white"></div>
          <p className="text-black font-extrabold text-lg uppercase">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center border-4 border-black p-8 bg-red-400 shadow-[6px_6px_0_0_#000] rounded-none">
          <p className="text-black font-extrabold text-lg uppercase mb-4">Error Loading Dashboard</p>
          <p className="text-black font-bold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-black text-white px-4 py-2 font-extrabold uppercase border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none hover:shadow-[6px_6px_0_0_#000]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-4 border-black p-6 bg-blue-400 shadow-[6px_6px_0_0_#000] rounded-none">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-black mb-2 uppercase tracking-tight">Teacher Dashboard</h1>
              <p className="text-black font-bold text-lg">Monitor your active learning sessions</p>
            </div>
            {useMockData && (
              <Badge className="bg-yellow-400 text-black border-2 border-black font-extrabold rounded-none">
                DEMO MODE
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-4 border-black bg-green-400 shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-black rounded-none border-2 border-black">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-extrabold text-black uppercase">Active Sessions</p>
                  <p className="text-3xl font-black text-black">
                    {sessions.filter(s => s.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black bg-pink-400 shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-black rounded-none border-2 border-black">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-extrabold text-black uppercase">Total Participants</p>
                  <p className="text-3xl font-black text-black">
                    {sessions.reduce((sum, s) => sum + s.participants.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black bg-orange-400 shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-black rounded-none border-2 border-black">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-extrabold text-black uppercase">Sessions Today</p>
                  <p className="text-3xl font-black text-black">
                    {sessions.filter(s =>
                      new Date(s.createdAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-black uppercase tracking-tight border-4 border-black bg-yellow-400 p-4 shadow-[6px_6px_0_0_#000] rounded-none">Active Sessions</h2>
          
          {sessions.length === 0 ? (
            <Card className="border-4 border-black bg-gray-200 shadow-[6px_6px_0_0_#000] rounded-none">
              <CardContent className="p-8 text-center">
                <QrCode className="w-12 h-12 text-black mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-black mb-2 uppercase">No Active Sessions</h3>
                <p className="text-black mb-4 font-bold">
                  Generate QR codes from your study materials to start live sessions
                </p>
                <Button asChild className="bg-black text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000]">
                  <a href="/ppt">Go to Study Materials</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {useMockData && (
                <Card className="mb-6 border-4 border-black bg-yellow-100 shadow-[6px_6px_0_0_#000] rounded-none">
                  <CardContent className="p-4">
                    <p className="text-sm text-black font-bold">
                      📢 <strong>Demo Mode:</strong> This dashboard is showing mock data for demonstration purposes. 
                      Upload a PowerPoint presentation and create sessions to see real data.
                    </p>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sessions.map((session) => (
                  <Card key={session.sessionId} className="border-4 border-black bg-white shadow-[6px_6px_0_0_#000] rounded-none">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-extrabold text-black uppercase">
                          {session.type === "flashcards" ? "📚 Flashcards" : "❓ Quiz"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={session.isActive ? "default" : "secondary"} className="bg-black text-white border-2 border-black font-extrabold rounded-none">
                            {session.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {session.isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deactivateSession(session.sessionId)}
                              className="bg-red-500 text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000]"
                            >
                              <EyeOff className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-black font-bold">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(session.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{session.participants.length} participants</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-black font-bold uppercase">Items:</span>
                        <Badge variant="outline" className="bg-yellow-400 text-black border-2 border-black font-extrabold rounded-none">
                          {Array.isArray(session.data) ? session.data.length : 0}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <QRCodeGenerator
                          sessionId={session.sessionId}
                          type={session.type}
                          data={session.data}
                          title={`${session.type === "flashcards" ? "Flashcards" : "Quiz"} Session`}
                          description={`Students can scan this QR code to access the ${session.type}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(session.studentUrl, "_blank")}
                          className="bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000]"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </div>

                      <div className="text-xs text-black font-bold uppercase">
                        Session ID: {session.sessionId}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}



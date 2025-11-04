"use client"

import { useEffect, useState } from "react"
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

export default function TeacherDashboard() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  // Generate mock sessions data
  const generateMockSessions = (): SessionData[] => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const now = new Date()
    
    const mockFlashcards = [
      { question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
      { question: "What process converts light energy to chemical energy?", answer: "Photosynthesis" },
      { question: "What is the basic unit of life?", answer: "Cell" },
      { question: "What is DNA?", answer: "Deoxyribonucleic acid - the genetic material" },
      { question: "What is the process of cell division called?", answer: "Mitosis" },
      { question: "What organelle contains DNA?", answer: "Nucleus" },
      { question: "What is the function of ribosomes?", answer: "Protein synthesis" },
      { question: "What is ATP?", answer: "Adenosine triphosphate - energy currency of cells" }
    ]

    const mockQuizzes = [
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
        question: "Which organelle contains DNA?",
        options: ["Mitochondria", "Ribosome", "Nucleus", "Endoplasmic reticulum"],
        correctIndex: 2
      },
      {
        question: "What is the function of ribosomes?",
        options: ["Energy production", "Protein synthesis", "DNA replication", "Waste removal"],
        correctIndex: 1
      }
    ]

    return [
      {
        sessionId: `mock_flashcards_${Date.now()}_1`,
        type: "flashcards" as const,
        data: mockFlashcards,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        studentUrl: `${baseUrl}/student/mock_flashcards_${Date.now()}_1/flashcards`,
        isActive: true,
        participants: ["participant_1", "participant_2", "participant_3"],
        pptFileName: "Introduction to Cell Biology.pptx",
        pptSessionId: "ppt_mock_1"
      },
      {
        sessionId: `mock_quiz_${Date.now()}_1`,
        type: "quiz" as const,
        data: mockQuizzes,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        studentUrl: `${baseUrl}/student/mock_quiz_${Date.now()}_1/quiz`,
        isActive: true,
        participants: ["participant_4", "participant_5", "participant_6", "participant_7"],
        pptFileName: "Introduction to Cell Biology.pptx",
        pptSessionId: "ppt_mock_1"
      },
      {
        sessionId: `mock_flashcards_${Date.now()}_2`,
        type: "flashcards" as const,
        data: [
          { question: "What is JavaScript?", answer: "A programming language for web development" },
          { question: "What is React?", answer: "A JavaScript library for building user interfaces" },
          { question: "What is a component?", answer: "A reusable piece of UI code" },
          { question: "What is state?", answer: "Data that changes over time in a component" },
          { question: "What is props?", answer: "Properties passed to a component" }
        ],
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        studentUrl: `${baseUrl}/student/mock_flashcards_${Date.now()}_2/flashcards`,
        isActive: true,
        participants: ["participant_8", "participant_9"],
        pptFileName: "Web Development Basics.pptx",
        pptSessionId: "ppt_mock_2"
      },
      {
        sessionId: `mock_quiz_${Date.now()}_2`,
        type: "quiz" as const,
        data: [
          {
            question: "What is JavaScript?",
            options: ["A markup language", "A programming language", "A database", "A framework"],
            correctIndex: 1
          },
          {
            question: "What is React?",
            options: ["A database", "A JavaScript library", "A programming language", "An operating system"],
            correctIndex: 1
          }
        ],
        createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        studentUrl: `${baseUrl}/student/mock_quiz_${Date.now()}_2/quiz`,
        isActive: false,
        participants: ["participant_10"],
        pptFileName: "Web Development Basics.pptx",
        pptSessionId: "ppt_mock_2"
      }
    ]
  }

  const loadMockData = () => {
    setUseMockData(true)
    setSessions(generateMockSessions())
    setLoading(false)
    setError(null)
  }

  const fetchSessions = async () => {
    if (useMockData) {
      setSessions(generateMockSessions())
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      } else {
        setError(`Failed to load sessions: ${response.status}`)
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()

    // Poll for updates every 5 seconds (only if not using mock data)
    if (!useMockData) {
      const interval = setInterval(fetchSessions, 5000)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMockData])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const deactivateSession = async (sessionId: string) => {
    if (useMockData) {
      // Update mock data locally
      setSessions(prev => prev.map(session => 
        session.sessionId === sessionId 
          ? { ...session, isActive: false }
          : session
      ))
      return
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE"
      })
      if (response.ok) {
        // Refresh sessions from server
        await fetchSessions()
      }
    } catch (error) {
      console.error("Failed to deactivate session:", error)
    }
  }
  
  const reactivateSession = async (sessionId: string) => {
    if (useMockData) {
      // Update mock data locally
      setSessions(prev => prev.map(session => 
        session.sessionId === sessionId 
          ? { ...session, isActive: true }
          : session
      ))
      return
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "POST"
      })
      if (response.ok) {
        // Refresh sessions from server
        await fetchSessions()
      }
    } catch (error) {
      console.error("Failed to reactivate session:", error)
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
            {!useMockData && (
              <Button
                onClick={loadMockData}
                className="bg-yellow-500 text-black border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000] hover:bg-yellow-600"
              >
                Load Mock Data
              </Button>
            )}
            {useMockData && (
              <Button
                onClick={() => {
                  setUseMockData(false)
                  fetchSessions()
                }}
                className="bg-green-500 text-black border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000] hover:bg-green-600"
              >
                Use Real Data
              </Button>
            )}
          </div>
          {useMockData && (
            <div className="mt-4 p-3 bg-yellow-200 border-2 border-black rounded-none">
              <p className="text-sm text-black font-bold uppercase">
                🎭 Mock Data Mode - Showing sample sessions for demonstration
              </p>
            </div>
          )}
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
          <h2 className="text-2xl font-extrabold text-black uppercase tracking-tight border-4 border-black bg-yellow-400 p-4 shadow-[6px_6px_0_0_#000] rounded-none">
            All Sessions ({sessions.filter(s => s.isActive).length} Active, {sessions.length} Total)
          </h2>
          
          {sessions.length === 0 ? (
            <Card className="border-4 border-black bg-gray-200 shadow-[6px_6px_0_0_#000] rounded-none">
              <CardContent className="p-8 text-center">
                <QrCode className="w-12 h-12 text-black mx-auto mb-4" />
                <h3 className="text-xl font-extrabold text-black mb-2 uppercase">No Sessions Found</h3>
                <p className="text-black mb-4 font-bold">
                  Generate QR codes from your study materials to start live sessions
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild className="bg-black text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000]">
                    <a href="/ppt">Go to Study Materials</a>
                  </Button>
                  <Button
                    onClick={loadMockData}
                    className="bg-yellow-500 text-black border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000] hover:bg-yellow-600"
                  >
                    Load Mock Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <Card key={session.sessionId} className={`border-4 border-black shadow-[6px_6px_0_0_#000] rounded-none ${session.isActive ? "bg-white" : "bg-gray-100"}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-extrabold text-black uppercase">
                          {session.type === "flashcards" ? "📚 Flashcards" : "❓ Quiz"}
                        </CardTitle>
                        {session.pptFileName && (
                          <p className="text-xs text-gray-600 mt-1">{session.pptFileName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.isActive ? "default" : "secondary"} className={`${session.isActive ? "bg-green-500" : "bg-gray-500"} text-white border-2 border-black font-extrabold rounded-none`}>
                          {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {session.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deactivateSession(session.sessionId)}
                            className="bg-red-500 text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000]"
                            title="Deactivate Session"
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reactivateSession(session.sessionId)}
                            className="bg-green-500 text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000]"
                            title="Reactivate Session"
                          >
                            <Eye className="w-4 h-4" />
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

                    <div className="flex gap-2 flex-wrap">
                      <QRCodeGenerator
                        sessionId={session.sessionId}
                        type={session.type}
                        data={session.data}
                        title={`${session.type === "flashcards" ? "Flashcards" : "Quiz"}`}
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
          )}
        </div>
      </div>
    </div>
  )
}



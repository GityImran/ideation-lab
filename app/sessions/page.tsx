"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Clock, 
  QrCode, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Square
} from "lucide-react"
import { toast } from "sonner"

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

export default function AdvancedSessionManager() {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "flashcards" | "quiz">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    fetchSessions()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchSessions, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data.sessions || [])
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.sessionId === sessionId)
      if (!session) return

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: session.isActive ? "DELETE" : "POST"
      })

      if (response.ok) {
        setSessions(prev => prev.map(s => 
          s.sessionId === sessionId 
            ? { ...s, isActive: !s.isActive }
            : s
        ))
        
        toast.success(`Session ${session.isActive ? "paused" : "resumed"}`)
      }
    } catch (error) {
      console.error("Error toggling session:", error)
      toast.error("Failed to update session")
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId))
        toast.success("Session deleted")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      toast.error("Failed to delete session")
    }
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("URL copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = !searchTerm || 
      session.pptFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || session.type === filterType
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && session.isActive) ||
      (filterStatus === "inactive" && !session.isActive)
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Group sessions by PPT
  const groupedSessions = filteredSessions.reduce((acc, session) => {
    const key = session.pptSessionId || "unknown"
    if (!acc[key]) {
      acc[key] = {
        pptSessionId: key,
        pptFileName: session.pptFileName || "Unknown Presentation",
        sessions: []
      }
    }
    acc[key].sessions.push(session)
    return acc
  }, {} as Record<string, { pptSessionId: string; pptFileName: string; sessions: SessionData[] }>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-4 border-black p-6 bg-cyan-400 shadow-[6px_6px_0_0_#000] rounded-none">
          <h1 className="text-4xl font-extrabold text-black mb-2 uppercase tracking-tight">Advanced Session Manager</h1>
          <p className="text-black font-bold text-lg">Manage all your learning sessions across presentations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-4 border-black bg-red-400 shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-black rounded-none border-2 border-black">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-extrabold text-black uppercase">Total Sessions</p>
                  <p className="text-3xl font-black text-black">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-black bg-green-400 shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-black rounded-none border-2 border-black">
                  <Play className="w-6 h-6 text-white" />
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

          <Card className="border-4 border-black bg-purple-400 shadow-[6px_6px_0_0_#000] rounded-none">
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

          <Card className="border-4 border-black bg-yellow-400 shadow-[6px_6px_0_0_#000] rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-black rounded-none border-2 border-black">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-extrabold text-black uppercase">Presentations</p>
                  <p className="text-3xl font-black text-black">
                    {Object.keys(groupedSessions).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-4 border-black bg-pink-400 shadow-[6px_6px_0_0_#000] rounded-none">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 border-2 border-black bg-white font-bold rounded-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 border-2 border-black bg-white font-bold rounded-none"
                >
                  <option value="all">All Types</option>
                  <option value="flashcards">Flashcards</option>
                  <option value="quiz">Quizzes</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border-2 border-black bg-white font-bold rounded-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <Button
                onClick={fetchSessions}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2 bg-black text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000]"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions by Presentation */}
        <div className="space-y-6">
          {Object.keys(groupedSessions).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "No sessions match your current filters."
                    : "Create sessions from your study materials to get started."
                  }
                </p>
                <Button asChild>
                  <a href="/ppt">Go to Study Materials</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.values(groupedSessions).map((group) => (
              <Card key={group.pptSessionId} className="border-4 border-black bg-white shadow-[6px_6px_0_0_#000] rounded-none">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between font-extrabold text-black text-xl uppercase">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-black rounded-none border-2 border-black"></div>
                      <span>{group.pptFileName}</span>
                      <Badge variant="outline" className="bg-yellow-400 text-black border-2 border-black font-extrabold rounded-none">
                        {group.sessions.length} sessions
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={group.sessions.some(s => s.isActive) ? "default" : "secondary"} className="bg-green-400 text-black border-2 border-black font-extrabold rounded-none">
                        {group.sessions.filter(s => s.isActive).length} Active
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {group.sessions.map((session) => (
                      <div key={session.sessionId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${session.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
                            <span className="font-medium">
                              {session.type === "flashcards" ? "📚 Flashcards" : "❓ Quiz"}
                            </span>
                            <Badge variant={session.isActive ? "default" : "secondary"}>
                              {session.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleSession(session.sessionId)}
                            >
                              {session.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyUrl(session.studentUrl)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(session.studentUrl, "_blank")}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteSession(session.sessionId)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(session.createdAt)} • {formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            <span>{session.participants.length} participants</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <QrCode className="w-3 h-3" />
                            <span>{session.data.length} items</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Session ID: {session.sessionId}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


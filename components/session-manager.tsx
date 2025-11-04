"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  QrCode, 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock, 
  RefreshCw, 
  Settings,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

// QR Code Display Component
function QRCodeDisplay({ sessionId, type }: { sessionId: string; type: string }) {
  const [qrCode, setQrCode] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/api/qr?sessionId=${sessionId}&type=${type}`)
        if (response.ok) {
          const data = await response.json()
          setQrCode(data.qrCode)
        }
      } catch (error) {
        console.error("Error fetching QR code:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchQRCode()
  }, [sessionId, type])

  if (loading) {
    return <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg animate-pulse mx-auto"></div>
  }

  if (!qrCode) {
    return <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 mx-auto">No QR Code</div>
  }

  return (
    <img 
      src={qrCode} 
      alt="QR Code" 
      className="mx-auto border rounded-lg"
      style={{ width: "200px", height: "200px" }}
    />
  )
}

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

interface SessionManagerProps {
  pptFileName?: string
  pptSessionId?: string
  flashcards?: any[]
  quizzes?: any[]
  onSessionUpdate?: (sessions: SessionData[]) => void
}

export function SessionManager({ 
  pptFileName, 
  pptSessionId, 
  flashcards = [], 
  quizzes = [], 
  onSessionUpdate 
}: SessionManagerProps) {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null)

  // Get PPT session ID and filename - prioritize props, then sessionStorage
  const currentPptSessionId = pptSessionId || (typeof window !== "undefined" ? sessionStorage.getItem("currentPptSessionId") || `ppt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : `ppt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const currentPptFileName = pptFileName || (typeof window !== "undefined" ? sessionStorage.getItem("pptParsedFileName") || sessionStorage.getItem("currentPptFileName") : undefined)

  const refreshSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        const allSessions = data.sessions || []
        // Filter to current PPT session if available
        if (currentPptSessionId) {
          const filtered = allSessions.filter((s: SessionData) => s.pptSessionId === currentPptSessionId)
          setSessions(filtered)
        } else {
          setSessions(allSessions)
        }
        onSessionUpdate?.(allSessions)
      }
    } catch (error) {
      console.error("Error refreshing sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch existing sessions on mount and when PPT session changes
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Store PPT session info
    if (currentPptFileName && currentPptSessionId) {
      sessionStorage.setItem("currentPptSessionId", currentPptSessionId)
      sessionStorage.setItem("currentPptFileName", currentPptFileName)
    }
    
    // Fetch existing sessions from server
    refreshSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pptFileName, pptSessionId])

  const createSession = async (type: "flashcards" | "quiz", data: any[]) => {
    if (data.length === 0) {
      toast.error(`No ${type} available to create session`)
      return
    }

    try {
      setLoading(true)
      const sessionId = `${currentPptSessionId}_${type}_${Date.now()}`
      
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type,
          data,
          pptFileName: currentPptFileName,
          pptSessionId: currentPptSessionId
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const result = await response.json()
      
      // Refresh sessions from server to get the actual session data
      await refreshSessions()
      
      toast.success(`${type === "flashcards" ? "Flashcards" : "Quiz"} session created!`)
      
    } catch (error) {
      console.error("Error creating session:", error)
      toast.error("Failed to create session")
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
        // Refresh sessions from server
        await refreshSessions()
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
        // Refresh sessions from server
        await refreshSessions()
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

  const currentSessions = sessions.filter(s => s.pptSessionId === currentPptSessionId)
  const activeSessions = currentSessions.filter(s => s.isActive)

  return (
    <div className="space-y-4">
      {/* Session Creation Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => createSession("flashcards", flashcards)}
          disabled={loading || flashcards.length === 0}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <QrCode className="w-4 h-4" />
          {loading ? "Creating..." : `Create Flashcards Session (${flashcards.length})`}
        </Button>

        <Button
          onClick={() => createSession("quiz", quizzes)}
          disabled={loading || quizzes.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <QrCode className="w-4 h-4" />
          {loading ? "Creating..." : `Create Quiz Session (${quizzes.length})`}
        </Button>

        <Button
          onClick={refreshSessions}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Current PPT Info */}
      {currentPptFileName && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Current Presentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentPptFileName}</p>
                <p className="text-sm text-gray-600">Session ID: {currentPptSessionId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {activeSessions.length} Active Sessions
                </Badge>
                <Badge variant="outline">
                  {currentSessions.length} Total Sessions
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">
                        {session.type === "flashcards" ? "📚 Flashcards" : "❓ Quiz"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.data.length} items • {session.participants.length} participants
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSession(session.sessionId)}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Session Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-center">
                            <QRCodeDisplay sessionId={session.sessionId} type={session.type} />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={session.studentUrl}
                              readOnly
                              className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
                            />
                            <Button
                              onClick={() => copyUrl(session.studentUrl)}
                              size="sm"
                              variant="outline"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => window.open(session.studentUrl, "_blank")}
                              size="sm"
                              variant="outline"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSession(session.sessionId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inactive Sessions */}
      {currentSessions.filter(s => !s.isActive).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pause className="w-5 h-5 text-gray-600" />
              Inactive Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentSessions.filter(s => !s.isActive).map((session) => (
                <div key={session.sessionId} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-700">
                        {session.type === "flashcards" ? "📚 Flashcards" : "❓ Quiz"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {session.data.length} items • {session.participants.length} participants
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSession(session.sessionId)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteSession(session.sessionId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => window.open("/dashboard", "_blank")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Open Dashboard
            </Button>
            
            <Button
              onClick={() => {
                const allUrls = activeSessions.map(s => s.studentUrl).join('\n')
                copyUrl(allUrls)
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy All URLs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



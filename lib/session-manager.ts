// Simple in-memory session store for demo purposes
// In production, you'd use Redis, MongoDB, or another database

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

class SessionManager {
  private sessions: Map<string, SessionData> = new Map()

  createSession(sessionId: string, type: "flashcards" | "quiz", data: any): SessionData {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const studentUrl = `${baseUrl}/student/${sessionId}/${type}`
    
    const session: SessionData = {
      sessionId,
      type,
      data,
      createdAt: new Date().toISOString(),
      studentUrl,
      isActive: true,
      participants: []
    }

    this.sessions.set(sessionId, session)
    return session
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId)
  }

  addParticipant(sessionId: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    if (!session.participants.includes(participantId)) {
      session.participants.push(participantId)
    }
    return true
  }

  getParticipants(sessionId: string): string[] {
    const session = this.sessions.get(sessionId)
    return session?.participants || []
  }

  deactivateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false

    session.isActive = false
    return true
  }

  getAllActiveSessions(): SessionData[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive)
  }

  cleanup(): void {
    // Remove sessions older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (new Date(session.createdAt) < oneDayAgo) {
        this.sessions.delete(sessionId)
      }
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()

// Cleanup old sessions every hour
if (typeof window === "undefined") {
  setInterval(() => {
    sessionManager.cleanup()
  }, 60 * 60 * 1000) // 1 hour
}

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

  createSession(sessionId: string, type: "flashcards" | "quiz", data: any, pptFileName?: string, pptSessionId?: string): SessionData {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    // Ensure studentUrl always includes the type at the end
    const studentUrl = `${baseUrl}/student/${sessionId}/${type}`
    
    const session: SessionData = {
      sessionId,
      type,
      data,
      createdAt: new Date().toISOString(),
      studentUrl,
      isActive: true,
      participants: [],
      pptFileName,
      pptSessionId
    }

    this.sessions.set(sessionId, session)
    return session
  }

  // Ensure studentUrl is correct when retrieving sessions
  getSession(sessionId: string): SessionData | undefined {
    const session = this.sessions.get(sessionId)
    if (session && session.studentUrl && !session.studentUrl.endsWith(`/${session.type}`)) {
      // Fix studentUrl if it's missing the type
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      session.studentUrl = `${baseUrl}/student/${session.sessionId}/${session.type}`
      this.sessions.set(sessionId, session)
    }
    return session
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

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId)
  }

  getAllActiveSessions(): SessionData[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive)
  }

  getAllSessions(): SessionData[] {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    // Fix studentUrl for all sessions if needed
    return Array.from(this.sessions.values()).map(session => {
      if (session.studentUrl && !session.studentUrl.endsWith(`/${session.type}`)) {
        session.studentUrl = `${baseUrl}/student/${session.sessionId}/${session.type}`
        this.sessions.set(session.sessionId, session)
      }
      return session
    })
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

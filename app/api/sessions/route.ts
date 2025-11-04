import { NextRequest, NextResponse } from "next/server"
import { sessionManager } from "@/lib/session-manager"

export async function GET(req: NextRequest) {
  try {
    // Get all sessions (both active and inactive)
    const allSessions = sessionManager.getAllSessions()
    
    return NextResponse.json({
      sessions: allSessions.map(session => ({
        sessionId: session.sessionId,
        type: session.type,
        data: session.data,
        createdAt: session.createdAt,
        studentUrl: session.studentUrl,
        isActive: session.isActive,
        participants: session.participants,
        participantCount: session.participants.length,
        pptFileName: session.pptFileName,
        pptSessionId: session.pptSessionId
      }))
    })

  } catch (error: any) {
    console.error("Sessions fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch sessions" },
      { status: 500 }
    )
  }
}

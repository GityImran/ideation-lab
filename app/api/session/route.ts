import { NextRequest, NextResponse } from "next/server"
import { sessionManager } from "@/lib/session-manager"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")
    const type = searchParams.get("type") as "flashcards" | "quiz"

    if (!sessionId || !type) {
      return NextResponse.json(
        { error: "Missing sessionId or type" },
        { status: 400 }
      )
    }

    const session = sessionManager.getSession(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    if (!session.isActive) {
      return NextResponse.json(
        { error: "Session is no longer active" },
        { status: 410 }
      )
    }

    if (session.type !== type) {
      return NextResponse.json(
        { error: "Session type mismatch" },
        { status: 400 }
      )
    }

    // Generate a unique participant ID
    const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Add participant to session
    sessionManager.addParticipant(sessionId, participantId)

    return NextResponse.json({
      sessionId: session.sessionId,
      type: session.type,
      data: session.data,
      participantId,
      participantCount: session.participants.length
    })

  } catch (error: any) {
    console.error("Session data fetch error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch session data" },
      { status: 500 }
    )
  }
}



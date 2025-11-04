import { NextRequest, NextResponse } from "next/server"
import { sessionManager } from "@/lib/session-manager"

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
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

    // Reactivate session
    session.isActive = true

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Session reactivation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to reactivate session" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    const success = sessionManager.deactivateSession(sessionId)
    
    if (!success) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Session deactivation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to deactivate session" },
      { status: 500 }
    )
  }
}

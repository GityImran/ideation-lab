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
    const { searchParams } = new URL(req.url)
    const permanent = searchParams.get("permanent") === "true"

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    if (permanent) {
      // Permanently delete the session
      const success = sessionManager.deleteSession(sessionId)
      
      if (!success) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, message: "Session permanently deleted" })
    } else {
      // Just deactivate the session
      const success = sessionManager.deactivateSession(sessionId)
      
      if (!success) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, message: "Session deactivated" })
    }

  } catch (error: any) {
    console.error("Session deletion/deactivation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete/deactivate session" },
      { status: 500 }
    )
  }
}

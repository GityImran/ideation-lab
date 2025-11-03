import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { sessionManager } from "@/lib/session-manager"

export async function POST(req: NextRequest) {
  try {
    const { sessionId, type, data, pptFileName, pptSessionId } = await req.json() as {
      sessionId: string
      type: "flashcards" | "quiz"
      data: any
      pptFileName?: string
      pptSessionId?: string
    }

    if (!sessionId || !type) {
      return NextResponse.json(
        { error: "Missing sessionId or type" },
        { status: 400 }
      )
    }

    // Create session using session manager with PPT context
    const sessionData = sessionManager.createSession(sessionId, type, data)
    
    // Add PPT context to session
    if (pptFileName || pptSessionId) {
      sessionData.pptFileName = pptFileName
      sessionData.pptSessionId = pptSessionId
    }
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(sessionData.studentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      studentUrl: sessionData.studentUrl,
      sessionData: {
        sessionId: sessionData.sessionId,
        type: sessionData.type,
        createdAt: sessionData.createdAt,
        isActive: sessionData.isActive,
        participantCount: sessionData.participants.length,
        pptFileName: sessionData.pptFileName,
        pptSessionId: sessionData.pptSessionId
      }
    })

  } catch (error: any) {
    console.error("QR code generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate QR code" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")
    const type = searchParams.get("type")

    if (!sessionId || !type) {
      return NextResponse.json(
        { error: "Missing sessionId or type" },
        { status: 400 }
      )
    }

    // Generate URL for student access
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const studentUrl = `${baseUrl}/student/${sessionId}/${type}`
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(studentUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      studentUrl
    })

  } catch (error: any) {
    console.error("QR code generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate QR code" },
      { status: 500 }
    )
  }
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QrCode, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface QRCodeGeneratorProps {
  sessionId: string
  type: "flashcards" | "quiz"
  data: any
  title: string
  description: string
}

export function QRCodeGenerator({ sessionId, type, data, title, description }: QRCodeGeneratorProps) {
  const [qrCode, setQrCode] = useState<string>("")
  const [studentUrl, setStudentUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const generateQRCode = async () => {
    try {
      setLoading(true)
      
      // Store session data in sessionStorage for student access
      sessionStorage.setItem(`${type}_${sessionId}`, JSON.stringify(data))
      
      const response = await fetch("/api/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          type,
          data,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate QR code")
      }

      const result = await response.json()
      setQrCode(result.qrCode)
      setStudentUrl(result.studentUrl)
      setIsOpen(true)
      
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    } finally {
      setLoading(false)
    }
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(studentUrl)
      toast.success("URL copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  const openStudentPage = () => {
    window.open(studentUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={generateQRCode}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <QrCode className="w-4 h-4" />
          {loading ? "Generating..." : `Generate QR Code for ${title}`}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">QR Code for {title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">{description}</p>
          
          {qrCode && (
            <div className="text-center">
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="mx-auto border rounded-lg"
                style={{ width: "200px", height: "200px" }}
              />
            </div>
          )}
          
          {studentUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
                />
                <Button
                  onClick={copyUrl}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
                <Button
                  onClick={openStudentPage}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                Students can scan this QR code or visit the URL above to access the {type}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



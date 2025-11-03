"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PPTXGeneratorProps {
  pptFileName: string
  pptSessionId: string
  flashcards?: any[]
  quizzes?: any[]
  baseUrl?: string
}

export function PPTXGenerator({ 
  pptFileName, 
  pptSessionId, 
  flashcards = [], 
  quizzes = [], 
  baseUrl = "http://localhost:3000" 
}: PPTXGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePPTX = async () => {
    try {
      setIsGenerating(true)
      
      const response = await fetch("/api/pptx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pptFileName,
          pptSessionId,
          flashcards,
          quizzes,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || baseUrl
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PPTX")
      }

      // Get the file blob
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${pptFileName}_interactive.pptx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success("PPTX file downloaded successfully!")
      setIsOpen(false)
      
    } catch (error) {
      console.error("Error generating PPTX:", error)
      toast.error("Failed to generate PPTX file")
    } finally {
      setIsGenerating(false)
    }
  }

  const hasContent = flashcards.length > 0 || quizzes.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          disabled={!hasContent}
        >
          <FileText className="w-4 h-4" />
          Generate PPTX
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Interactive PPTX</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will create a downloadable PowerPoint presentation containing:
          </p>
          
          <div className="space-y-2">
            {flashcards.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>📚 Flashcards ({flashcards.length} cards)</span>
              </div>
            )}
            
            {quizzes.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>🧠 Quiz ({quizzes.length} questions)</span>
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Features included:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• QR codes for easy student access</li>
              <li>• Backup links for each activity</li>
              <li>• Sample content preview</li>
              <li>• Usage instructions</li>
            </ul>
          </div>
          
          <Button 
            onClick={generatePPTX}
            disabled={isGenerating || !hasContent}
            className="w-full flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PPTX
              </>
            )}
          </Button>
          
          {!hasContent && (
            <p className="text-sm text-gray-500 text-center">
              Generate flashcards or quizzes first to create a PPTX
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



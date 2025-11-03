"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2, RefreshCw, AlertTriangle } from "lucide-react"
import { clearAllSessionData } from "@/lib/session-storage-utils"
import { toast } from "sonner"

export function SessionResetCard() {
  const [isOpen, setIsOpen] = useState(false)

  const handleClearAllData = () => {
    try {
      clearAllSessionData()
      toast.success("All session data cleared successfully!")
      setIsOpen(false)
      
      // Reload the page to reset all state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error clearing session data:", error)
      toast.error("Failed to clear session data")
    }
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Session Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-700 mb-4">
          If you're experiencing issues with old PPT data persisting, you can clear all session data and start fresh.
        </p>
        
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All Session Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Session Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all stored PPT data, flashcards, quizzes, and session information. 
                You'll need to upload your PowerPoint file again. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllData} className="bg-red-600 hover:bg-red-700">
                Clear All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}


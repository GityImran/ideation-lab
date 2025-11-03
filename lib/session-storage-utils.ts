// Utility functions for session storage management

export const clearAllSessionData = () => {
  if (typeof window === "undefined") return
  
  // Clear all PPT-related data
  sessionStorage.removeItem("pptParsedData")
  sessionStorage.removeItem("pptParsedFileName")
  sessionStorage.removeItem("currentPptSessionId")
  sessionStorage.removeItem("pptTextBySlide")
  sessionStorage.removeItem("pptTextArray")
  sessionStorage.removeItem("pptTextCombined")
  
  // Clear all Gemini API responses
  sessionStorage.removeItem("geminiSummaryOutput")
  sessionStorage.removeItem("geminiSummaryError")
  sessionStorage.removeItem("geminiSummaryModel")
  sessionStorage.removeItem("geminiSummaryStructured")
  sessionStorage.removeItem("geminiSummaryPending")
  
  sessionStorage.removeItem("geminiStudyStructured")
  sessionStorage.removeItem("geminiStudyError")
  sessionStorage.removeItem("geminiStudyModel")
  sessionStorage.removeItem("geminiStudyPending")
  
  sessionStorage.removeItem("geminiPlacementStructured")
  sessionStorage.removeItem("geminiPlacementError")
  sessionStorage.removeItem("geminiPlacementModel")
  sessionStorage.removeItem("geminiPlacementPending")
}

export const clearPreviousStudyMaterials = () => {
  if (typeof window === "undefined") return
  
  // Clear study materials but keep PPT data
  sessionStorage.removeItem("geminiStudyStructured")
  sessionStorage.removeItem("geminiStudyError")
  sessionStorage.removeItem("geminiStudyModel")
  sessionStorage.removeItem("geminiStudyPending")
  
  sessionStorage.removeItem("geminiPlacementStructured")
  sessionStorage.removeItem("geminiPlacementError")
  sessionStorage.removeItem("geminiPlacementModel")
  sessionStorage.removeItem("geminiPlacementPending")
}

export const getCurrentPptSessionId = (): string => {
  if (typeof window === "undefined") return ""
  
  let sessionId = sessionStorage.getItem("currentPptSessionId")
  if (!sessionId) {
    sessionId = `ppt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("currentPptSessionId", sessionId)
  }
  return sessionId
}

export const isNewPptSession = (): boolean => {
  if (typeof window === "undefined") return false
  
  const lastSessionId = sessionStorage.getItem("lastPptSessionId")
  const currentSessionId = sessionStorage.getItem("currentPptSessionId")
  
  if (lastSessionId !== currentSessionId) {
    sessionStorage.setItem("lastPptSessionId", currentSessionId || "")
    return true
  }
  return false
}


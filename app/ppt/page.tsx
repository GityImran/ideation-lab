import { FileUploadCard } from "@/components/file-upload-card"
import { SessionResetCard } from "@/components/session-reset-card"

export default function HomePage() {
  return (
    <main className="min-h-screen w-full py-8 px-4 bg-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <FileUploadCard />
        <SessionResetCard />
      </div>
    </main>
  )
}

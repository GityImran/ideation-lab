import { FileUploadCard } from "@/components/file-upload-card"
import { SessionResetCard } from "@/components/session-reset-card"

export default function HomePage() {
  return (
    <main className="min-h-screen w-full py-12 px-6 bg-yellow-100 text-gray-900">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
          <h1 className="text-4xl font-extrabold mb-3 uppercase tracking-tight">
            Upload Your Presentation
          </h1>
          <p className="text-lg font-medium">
            Get started by uploading your slides to create flashcards and quizzes
          </p>
        </div>

        <div className="space-y-8">
          <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
            <FileUploadCard />
          </div>
          <div className="border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000] rounded-none">
            <SessionResetCard />
          </div>
        </div>
      </div>
    </main>
  )
}

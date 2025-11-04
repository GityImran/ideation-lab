import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileUploadCard } from "@/components/file-upload-card"
import { SessionResetCard } from "@/components/session-reset-card"

export default function HomePage() {
  return (
    <main className="min-h-screen w-full py-12 px-6 bg-yellow-100 text-gray-900">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center border-4 border-black p-6 bg-white shadow-[6px_6px_0_0_#000]">
          <div className="flex gap-2 justify-center flex-wrap mb-4">
            <Link href="/dashboard">
              <Button className="bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000] text-sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/sessions">
              <Button className="bg-purple-500 text-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000] text-sm">
                All Sessions
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="bg-white text-black border-2 border-black shadow-[4px_4px_0_0_#000] rounded-none font-extrabold hover:shadow-[6px_6px_0_0_#000] text-sm">
                Home
              </Button>
            </Link>
          </div>
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

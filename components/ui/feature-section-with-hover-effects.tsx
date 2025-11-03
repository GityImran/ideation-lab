import type React from "react"
import { cn } from "@/lib/utils"
import {
  Brain,
  QrCode,
  TrendingUp,
  Presentation,
  Target,
  Users,
  Shield,
  Zap,
} from "lucide-react"

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "AI-Powered Quiz Generation",
      description: "Our AI analyzes your PowerPoint presentations to detect engagement drop-off points and automatically generates contextual quizzes.",
      icon: <Brain />,
    },
    {
      title: "Zero-Friction Student Access",
      description: "Students simply scan a QR code to join sessions — no app downloads, no accounts, no setup required.",
      icon: <QrCode />,
    },
    {
      title: "Real-Time Performance Analytics",
      description: "Monitor student understanding live with instant feedback on comprehension levels and engagement scores.",
      icon: <TrendingUp />,
    },
    {
      title: "Seamless PowerPoint Integration",
      description: "Upload your existing presentations and let our AI enhance them with interactive elements automatically.",
      icon: <Presentation />,
    },
    {
      title: "Adaptive Learning Engine",
      description: "AI dynamically adjusts quiz difficulty and timing based on real-time class performance and engagement levels.",
      icon: <Target />,
    },
    {
      title: "Multi-Device Compatibility",
      description: "Works on any device — smartphones, tablets, laptops — ensuring every student can participate.",
      icon: <Users />,
    },
    {
      title: "Enterprise-Grade Security",
      description: "FERPA-compliant with end-to-end encryption and anonymous student participation options.",
      icon: <Shield />,
    },
    {
      title: "Plug-and-Play Setup",
      description: "Get started in minutes with pre-built templates and one-click classroom creation.",
      icon: <Zap />,
    },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10 py-6 sm:py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} featureLength={features.length} />
      ))}
    </div>
  )
}

const Feature = ({
  title,
  description,
  icon,
  index,
  featureLength,
}: {
  title: string
  description: string
  icon: React.ReactNode
  index: number
  featureLength: number
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:border-r py-6 sm:py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "sm:border-l dark:border-neutral-800",
        index < 4 && "sm:border-b dark:border-neutral-800",
        index < featureLength - 1 && "border-b sm:border-b-0 dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-3 sm:mb-4 relative z-10 px-6 sm:px-10 text-neutral-600 dark:text-neutral-400">{icon}</div>
      <div className="text-base sm:text-lg font-bold mb-1 sm:mb-2 relative z-10 px-6 sm:px-10">
        <div className="absolute left-0 inset-y-0 h-5 sm:h-6 group-hover/feature:h-7 sm:group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-6 sm:px-10">{description}</p>
    </div>
  )
}

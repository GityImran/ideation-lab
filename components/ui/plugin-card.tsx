import React from "react"
import { Book, MoreVertical, AlertTriangle } from "lucide-react"
import { Button } from "./button"

interface PluginCardProps {
  title: string
  subtitle?: string
  description: string
  iconBg?: string
  iconContent?: React.ReactNode
  buttonText?: string
  statsText?: string
  highlightWord?: string
  onInstall?: () => void
}

export function PluginCard({
  title,
  subtitle = "Third-party payment",
  description,
  iconBg = "#84CC16",
  iconContent,
  buttonText = "Install now",
  statsText = "300,000 active installations",
  highlightWord,
  onInstall
}: PluginCardProps) {
  // Create isometric cube component
  const IsometricCube = ({ size = 20, color = "#F9FAFB", className = "" }: { size?: number, color?: string, className?: string }) => (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Front face */}
      <div 
        className="absolute inset-0 bg-opacity-80"
        style={{ 
          backgroundColor: color,
          transform: 'rotateX(60deg) rotateY(45deg)',
          transformStyle: 'preserve-3d'
        }}
      />
      {/* Top face */}
      <div 
        className="absolute inset-0 bg-opacity-60"
        style={{ 
          backgroundColor: color,
          transform: 'rotateX(60deg) rotateY(45deg) translateZ(-1px)',
          transformStyle: 'preserve-3d'
        }}
      />
      {/* Right face */}
      <div 
        className="absolute inset-0 bg-opacity-40"
        style={{ 
          backgroundColor: color,
          transform: 'rotateX(60deg) rotateY(45deg) translateX(-1px)',
          transformStyle: 'preserve-3d'
        }}
      />
    </div>
  )

  return (
    <div className="w-full max-w-[400px] h-[500px] bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col">
      {/* Header Section */}
      <div className="relative mb-6">
        {/* Isometric illustrations */}
        <div className="absolute top-0 right-0 flex gap-2 opacity-60">
          <IsometricCube size={16} color="#F3F4F6" />
          <IsometricCube size={12} color="#F9FAFB" />
          <IsometricCube size={20} color="#F3F4F6" />
        </div>
        <div className="absolute top-8 left-4 opacity-40">
          <IsometricCube size={14} color="#F9FAFB" />
        </div>
        
        {/* Header icons */}
        <div className="flex justify-between items-start">
          <Book className="w-5 h-5 text-gray-400" />
          <MoreVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1">
        {/* Primary Heading */}
        <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-6">
          Fast{" "}
          {highlightWord ? (
            <span className="text-green-500">{highlightWord}</span>
          ) : (
            <span className="text-green-500">isometric</span>
          )}{" "}
          shapes creator.
        </h3>

        {/* App/Plugin Details */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: iconBg }}
          >
            {iconContent || "X"}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
            <span className="text-sm text-gray-500">{subtitle}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-base text-gray-600 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      {/* Action Section */}
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3">
          <Button
            onClick={onInstall}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105"
          >
            {buttonText}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4" />
            <span>{statsText}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 
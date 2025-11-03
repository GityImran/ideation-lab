import React from 'react';

interface GlassmorphismCardProps {
  avatarText?: string;
  children: React.ReactNode;
  className?: string;
}

export function GlassmorphismCard({ 
  avatarText = "buddy", 
  children, 
  className = "" 
}: GlassmorphismCardProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
      {/* Background with radial gradient */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-[#2D1B69] via-[#2D1B69] to-[#E879F9]"
        style={{
          background: 'radial-gradient(circle at 30% 50%, #2D1B69 0%, #2D1B69 40%, #E879F9 100%)'
        }}
      />
      
      {/* Main glassmorphism card */}
      <div className="relative w-[400px] h-[300px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/25 hover:scale-[1.02] hover:shadow-purple-500/40 transition-all duration-300 p-8 flex items-center justify-center">
        {/* Avatar element */}
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-[#2D1B69] to-black rounded-full flex items-center justify-center shadow-lg border border-white/20 hover:scale-110 transition-transform duration-200">
          <span className="text-white text-sm font-medium lowercase">{avatarText}</span>
        </div>
        
        {/* Card content */}
        <div className="text-center">
          <div className="text-2xl text-white font-semibold leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 
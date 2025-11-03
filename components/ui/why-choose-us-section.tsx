import React from 'react';
import { Zap, Users, Shield } from 'lucide-react';

export function WhyChooseUsSection() {
  const reasons = [
    {
      icon: Zap,
      title: "Zero Setup Time",
      description: "Upload your PPT and start teaching. No complex configurations needed."
    },
    {
      icon: Users,
      title: "Instant Student Access",
      description: "Students scan QR code and join immediately. No app downloads required."
    },
    {
      icon: Shield,
      title: "AI-Powered Insights",
      description: "Get real-time analytics on student engagement and understanding."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose us
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="relative">
              {/* Background with radial gradient for each card */}
              <div 
                className="relative w-full h-[300px] rounded-3xl overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at 30% 50%, #2D1B69 0%, #2D1B69 40%, #E879F9 100%)'
                }}
              >
                {/* Glassmorphism card */}
                <div className="relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-purple-500/25 hover:scale-[1.02] hover:shadow-purple-500/40 transition-all duration-300 p-8 flex flex-col items-center justify-center">
                  
                  {/* Icon */}
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <reason.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-3">{reason.title}</h3>
                    <p className="text-white/80 leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
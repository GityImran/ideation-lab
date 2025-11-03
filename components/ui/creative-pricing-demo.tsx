import { CreativePricing } from "@/components/ui/creative-pricing"
import type { PricingTier } from "@/components/ui/creative-pricing"
import { Check, Pencil, Star, Sparkles, Users, Shield, Zap, BookOpen, Building } from "lucide-react";

const sampleTiers: PricingTier[] = [
    {
        name: "Teacher Pro",
        icon: <Pencil className="w-6 h-6" />,
        price: 99,
        description: "Perfect for individual teachers",
        color: "amber",
        features: [
            "Unlimited AI-powered quizzes",
            "PPT integration & analysis",
            "Real-time student engagement",
            "QR code student access",
            "Basic analytics dashboard",
            "Email support",
            "Up to 200 students/month",
        ],
    },
    {
        name: "Institution",
        icon: <Building className="w-6 h-6" />,
        price: 499,
        description: "For schools and colleges",
        color: "blue",
        features: [
            "Everything in Teacher Pro",
            "Admin analytics dashboard",
            "Multi-teacher management",
            "Custom branding",
            "Advanced reporting",
            "Priority support",
            "Unlimited students",
            "API access",
        ],
        popular: true,
    },
    {
        name: "Enterprise",
        icon: <Shield className="w-6 h-6" />,
        price: 999,
        description: "For universities & large institutions",
        color: "purple",
        features: [
            "Everything in Institution",
            "Custom AI model training",
            "White-label solution",
            "Dedicated account manager",
            "Custom integrations",
            "Advanced security features",
            "24/7 phone support",
            "SLA guarantees",
        ],
    },
];

function CreativePricingDemo() {
    return (
        <CreativePricing 
            tag="Simple Pricing"
            title="Transform Your Classroom Today"
            description="Choose the perfect plan for your educational institution"
            tiers={sampleTiers} 
        />
    )
}

export { CreativePricingDemo } 
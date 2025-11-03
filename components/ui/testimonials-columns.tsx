import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "ClassroomAI transformed my lectures completely. Students are now actively engaged and I can see their understanding in real-time. The AI-powered timing is incredible!",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "Biology Department",
  },
  {
    text: "The seamless PowerPoint integration and zero setup for students made adoption effortless. My class participation increased by 300% in just one week.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "Computer Science",
  },
  {
    text: "As an administrator, the analytics dashboard gives me unprecedented insights into teaching effectiveness across our entire institution.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Administrator",
    role: "Dean of Education",
  },
  {
    text: "The QR code access is brilliant - no app downloads, no technical issues. Students just scan and participate immediately.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "Physics Department",
  },
  {
    text: "Real-time feedback has revolutionized how I teach. I can now adjust my pace and content based on actual student comprehension.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "Mathematics Department",
  },
  {
    text: "The AI-generated questions are perfectly timed and relevant. It's like having a teaching assistant who knows exactly when to engage students.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "Chemistry Department",
  },
  {
    text: "Our student engagement scores have never been higher. The interactive quizzes keep everyone focused and learning actively.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "History Department",
  },
  {
    text: "The anonymous participation feature encourages even shy students to contribute. It's created a more inclusive learning environment.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "Psychology Department",
  },
  {
    text: "Setup took less than 5 minutes. The pre-built templates saved me hours of preparation time while improving student outcomes.",
    image: "/placeholder-user.jpg",
    name: "Anonymous Professor",
    role: "English Department",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const Testimonials = () => {
  return (
    <section className="bg-background my-20 relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border py-1 px-4 rounded-lg">Success Stories</div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-5xl font-bold tracking-tighter mt-5">
            What educators say about us
          </h2>
          <p className="text-center mt-5 opacity-75">
            See how professors and administrators are transforming their classrooms.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 
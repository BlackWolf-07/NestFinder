import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Quote, Star } from 'lucide-react';
import { Badge } from '../UIElements';

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "Tech Lead @ Quantum",
    text: "The AI matching is actually scary good. I found my dream penthouse in under 10 minutes of browsing. The UI is just the cherry on top.",
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    name: "Sarah Chen",
    role: "Architectural Designer",
    text: "As a designer, I appreciate the attention to detail. NestFinder isn't just a platform; it's a piece of art that actually works.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Marcus Thorne",
    role: "Global Nomad",
    text: "The verification protocol gives me peace of mind. I've used it in 4 different cities now and it's always consistent.",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  }
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 relative bg-secondary/20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
             <Badge variant="glass" className="mb-6">Global Feedback</Badge>
             <h2 className="text-6xl font-black tracking-tighter text-white mb-8">Voices from the <br /><span className="text-gradient">Network</span></h2>
             <div className="flex gap-2 mb-12">
                {[...Array(5)].map((_, i) => <Star key={i} className="fill-primary text-primary" size={20} />)}
                <span className="ml-4 text-white font-black">4.9/5 Average Sync</span>
             </div>
             
             <div className="flex gap-4">
                {TESTIMONIALS.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${index === i ? 'w-12 bg-primary' : 'w-4 bg-white/10'}`} 
                  />
                ))}
             </div>
          </div>

          <div className="relative h-[400px] flex items-center">
             <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="glass p-12 rounded-[48px] border-white/5 bg-secondary/40 relative"
                >
                  <Quote className="absolute top-10 right-12 text-primary/10 w-24 h-24" />
                  <p className="text-2xl font-bold text-white mb-10 leading-relaxed italic relative z-10">
                     "{TESTIMONIALS[index].text}"
                  </p>
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/30">
                        <img src={TESTIMONIALS[index].avatar} alt={TESTIMONIALS[index].name} className="w-full h-full object-cover" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-white">{TESTIMONIALS[index].name}</h4>
                        <p className="text-primary-light font-bold text-sm">{TESTIMONIALS[index].role}</p>
                     </div>
                  </div>
                </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

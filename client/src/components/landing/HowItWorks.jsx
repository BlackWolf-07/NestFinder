import { motion } from 'framer-motion';
import { Search, BrainCircuit, MapPin, Key } from 'lucide-react';
import { Badge } from '../UIElements';

const Step = ({ number, title, text, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="relative flex flex-col items-center text-center group"
  >
    <div className="w-24 h-24 rounded-[32px] bg-secondary border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
       <div className="absolute inset-0 bg-primary/10 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
       <Icon size={40} className="text-primary relative z-10" />
       <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-lg border-4 border-background">
          {number}
       </div>
    </div>
    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
    <p className="text-text-muted font-medium text-sm leading-relaxed max-w-[200px]">{text}</p>
  </motion.div>
);

export default function HowItWorks() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-32">
           <Badge variant="glass" className="mb-6">Operational Protocol</Badge>
           <h2 className="text-6xl font-black tracking-tighter text-white">How it <span className="text-gradient">Functions</span></h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
          {/* Connecting Lines (Desktop) */}
          <div className="absolute top-12 left-0 w-full hidden md:block px-24">
             <svg className="w-full h-1">
                <motion.line
                  x1="0%" y1="50%" x2="100%" y2="50%"
                  stroke="rgba(99, 102, 241, 0.2)"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
             </svg>
          </div>

          <Step 
            number="1" 
            title="Initiate Search" 
            text="Input your architectural parameters and sector location."
            icon={Search}
            delay={0.1}
          />
          <Step 
            number="2" 
            title="Neural Match" 
            text="Our AI synthesizes millions of listings to find your match."
            icon={BrainCircuit}
            delay={0.3}
          />
          <Step 
            number="3" 
            title="Tactical Visit" 
            text="Schedule an immersive on-site synchronization."
            icon={MapPin}
            delay={0.5}
          />
          <Step 
            number="4" 
            title="Secure Link" 
            text="Finalize the lease or ownership through secure protocols."
            icon={Key}
            delay={0.7}
          />
        </div>
      </div>
    </section>
  );
}

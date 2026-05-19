import { motion } from 'framer-motion';
import { Zap, ShieldCheck, SlidersHorizontal, MousePointer2, Sparkles, BrainCircuit } from 'lucide-react';
import { Badge } from '../UIElements';

const FeatureCard = ({ icon: Icon, title, text, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="group relative"
  >
    <div className="absolute -inset-0.5 bg-gradient-to-br from-primary via-purple-500 to-rose-500 rounded-[40px] blur opacity-0 group-hover:opacity-20 transition duration-500" />
    <div className="relative glass p-10 rounded-[40px] border-white/5 bg-secondary/20 hover:bg-secondary/40 transition-all duration-500 h-full">
      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl ${color}`}>
        <Icon size={32} className="text-white" />
      </div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
      <p className="text-text-muted font-medium leading-relaxed">{text}</p>
      
      <div className="mt-10 flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Read Documentation <MousePointer2 size={14} />
      </div>
    </div>
  </motion.div>
);

export default function Features() {
  const features = [
    {
      icon: BrainCircuit,
      title: 'Neural Matching',
      text: 'Our AI analyzes over 200 behavioral data points to match you with properties that perfectly fit your lifestyle DNA.',
      color: 'bg-primary shadow-primary/30',
      delay: 0.1
    },
    {
      icon: SlidersHorizontal,
      title: 'Quantum Filters',
      text: 'Filter by more than just price. search by natural light levels, commute acoustics, and surrounding lifestyle vibes.',
      color: 'bg-purple-600 shadow-purple-500/30',
      delay: 0.2
    },
    {
      icon: ShieldCheck,
      title: 'Biometric Trust',
      text: '100% verified listings. Every host undergoes a rigorous multi-stage security protocol and architectural audit.',
      color: 'bg-blue-600 shadow-blue-500/30',
      delay: 0.3
    },
    {
      icon: Zap,
      title: 'Instant Booking',
      text: 'Zero friction. Secure your future home in seconds with our blockchain-secured transactional infrastructure.',
      color: 'bg-rose-600 shadow-rose-500/30',
      delay: 0.4
    }
  ];

  return (
    <section className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <Badge variant="glass" className="mb-6">System Capabilities</Badge>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            Architecture for the <br />
            <span className="text-gradient italic">Modern Age</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

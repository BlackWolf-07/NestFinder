import { motion } from 'framer-motion';
import { PremiumButton } from '../UIElements';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-40 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative glass p-20 rounded-[60px] border-white/10 bg-gradient-to-br from-primary/20 via-secondary/40 to-accent/10 overflow-hidden text-center shadow-[0_0_100px_rgba(99,102,241,0.2)]"
        >
          {/* Animated Glow in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
          
          <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-light border-white/20 mb-10 shadow-2xl">
                <Sparkles className="text-primary w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Next-Gen Deployment Ready</span>
             </div>
             
             <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-10 leading-tight">
                Architect Your <br /><span className="text-gradient italic font-normal">Future Today</span>
             </h2>
             
             <p className="text-2xl text-text-muted font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                Join the most advanced real estate ecosystem. Secure your architectural legacy with neural-precision matching.
             </p>
             
             <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <PremiumButton 
                  onClick={() => navigate('/onboarding')}
                  className="!px-16 !py-8 text-2xl !rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.5)] group"
                >
                   Find My Home <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </PremiumButton>
                <button 
                   onClick={() => navigate('/host/add-property')}
                   className="px-16 py-8 rounded-3xl border-2 border-white/20 glass-light text-white font-black text-2xl hover:bg-white/10 transition-all shadow-xl"
                >
                   Initialize Hosting
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

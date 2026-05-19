import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, Home, MapPin, Zap } from 'lucide-react';
import { PremiumButton, Badge } from '../UIElements';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const FloatingCard = ({ icon: Icon, title, text, delay, position }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [0, -20, 0],
      rotate: [0, 2, -2, 0]
    }}
    transition={{ 
      opacity: { duration: 0.5, delay },
      y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
      rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={`absolute ${position} z-20 hidden lg:block`}
  >
    <div className="glass p-5 rounded-3xl border-white/10 shadow-2xl backdrop-blur-xl w-64">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <p className="font-black text-xs uppercase tracking-widest text-primary-light">{title}</p>
      </div>
      <p className="text-sm font-bold text-white leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

const TypingText = ({ texts }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = texts[index];
      if (isDeleting) {
        setDisplayText(current.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setIndex((index + 1) % texts.length);
        }
      } else {
        setDisplayText(current.substring(0, displayText.length + 1));
        if (displayText === current) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, texts]);

  return <span className="text-primary-light inline-block min-w-[10px]">{displayText}<span className="animate-pulse text-white">|</span></span>;
};

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background VFX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Particle Overlay (CSS Based) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border-primary/20 mb-10 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
          >
            <Sparkles className="text-primary w-5 h-5 animate-spin-slow" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">AI-Powered Real Estate Evolution</span>
          </motion.div>

          <h1 className="text-7xl md:text-[100px] font-black leading-[0.85] tracking-tighter text-white mb-10">
            Find Your <br />
            <TypingText texts={["Perfect Home", "Elite Villa", "Smart Studio", "Luxury Nest"]} />
          </h1>

          <p className="text-xl text-text-muted font-medium max-w-xl mb-12 leading-relaxed">
            Experience the next generation of property discovery. Our neural engine matches your lifestyle with verified architectural masterpieces.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <PremiumButton 
              onClick={() => navigate('/onboarding')}
              className="!px-12 !py-6 text-xl shadow-[0_0_40px_rgba(99,102,241,0.4)] group"
            >
              Start AI Discovery <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </PremiumButton>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-12 py-6 rounded-[24px] border-2 border-white/10 glass-light text-white font-black text-xl hover:bg-white/5 transition-all flex items-center justify-center gap-3"
            >
              <Play className="fill-white w-4 h-4" /> Become a Host
            </button>
          </div>

          <div className="mt-16 flex items-center gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-secondary bg-gray-800 flex items-center justify-center overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-text-muted">
              Joined by <span className="text-white font-black">5,000+</span> luxury seekers this month.
            </p>
          </div>
        </motion.div>

        {/* Visual Side */}
        <div className="relative h-[600px] hidden lg:block">
          {/* Main Visual Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-primary via-purple-500 to-rose-500 rounded-[100px] rotate-12 blur-[100px] opacity-20"
          />
          
          {/* Central Animated Logo/Icon */}
          <motion.div
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full border-dashed"
          />

          {/* Floating Interaction Cards */}
          <FloatingCard 
            icon={Zap}
            title="AI MATCHING"
            text="Neural link established with 98% accuracy in Sector 4."
            delay={0.5}
            position="top-10 right-0"
          />
          <FloatingCard 
            icon={MapPin}
            title="SMART LOCATION"
            text="Premium connectivity hubs detected in Neo-Tokyo."
            delay={1}
            position="bottom-10 left-0"
          />
          <FloatingCard 
            icon={Home}
            title="ELITE LISTING"
            text="Glass Oasis Villa synchronized to your profile."
            delay={1.5}
            position="top-1/2 -translate-y-1/2 right-10"
          />

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-80 h-80 glass rounded-[60px] flex items-center justify-center border-white/10 shadow-2xl rotate-6 group hover:rotate-0 transition-transform duration-700 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800" 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
                  alt="Property" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

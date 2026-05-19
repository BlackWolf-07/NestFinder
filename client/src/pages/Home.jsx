import Navbar from '../components/Navbar';
import Hero from '../components/landing/Hero';
import Stats from '../components/landing/Stats';
import Features from '../components/landing/Features';
import FeaturedProperties from '../components/landing/FeaturedProperties';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import CTA from '../components/landing/CTA';
import LandingFooter from '../components/landing/LandingFooter';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-background min-h-screen text-white selection:bg-primary/30">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-accent z-[100] origin-left" 
        style={{ scaleX }}
      />
      
      <Navbar />
      
      <main>
        <Hero />
        <Stats />
        <Features />
        
        {/* Parallax/Reveal Container */}
        <div className="relative">
           <FeaturedProperties />
           <HowItWorks />
        </div>
        
        <Testimonials />
        <CTA />
      </main>

      <LandingFooter />
    </div>
  );
}

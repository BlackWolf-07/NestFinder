import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PremiumButton } from '../components/UIElements';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="relative z-10"
      >
        <h1 className="text-[180px] font-black leading-none text-secondary dark:text-white tracking-tighter opacity-10">404</h1>
        <div className="mt-[-80px]">
          <h2 className="text-4xl font-black text-secondary dark:text-white mb-4">Lost Your Way?</h2>
          <p className="text-text-muted font-medium mb-12 max-w-sm mx-auto">
            The nest you're looking for doesn't exist or has been moved to a new locality.
          </p>
          <Link to="/">
            <PremiumButton className="flex items-center gap-2 mx-auto !px-10">
              <Home className="w-5 h-5" /> Back to Home
            </PremiumButton>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';

export const Skeleton = ({ className }) => (
  <div className={`relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-2xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer -translate-x-full" />
  </div>
);

export const PremiumButton = ({ children, className, onClick, type = 'button', disabled, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]',
    secondary: 'bg-secondary-light text-white border border-white/10 hover:bg-secondary',
    outline: 'border-2 border-primary/50 text-primary hover:bg-primary/10',
    ghost: 'text-text-muted hover:bg-white/5 hover:text-white',
    glass: 'glass-light text-white hover:bg-white/10 border-white/20',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden px-8 py-4 rounded-2xl font-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group ${variants[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Ripple/Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </motion.button>
  );
};

export const Card = ({ children, className, noAnim = false }) => {
  const content = (
    <div className={`glass-card p-1 ${className}`}>
      <div className="bg-secondary/40 rounded-[30px] h-full overflow-hidden">
        {children}
      </div>
    </div>
  );

  if (noAnim) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {content}
    </motion.div>
  );
};

export const Badge = ({ children, variant = 'info' }) => {
  const colors = {
    info: 'bg-primary/20 text-primary border-primary/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-accent/20 text-accent border-accent/30',
    glass: 'bg-white/5 text-white border-white/10 backdrop-blur-sm',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border backdrop-blur-md ${colors[variant]}`}>
      {children}
    </span>
  );
};

export const FuturisticInput = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2 group">
    {label && <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 group-focus-within:text-primary transition-colors">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />}
      <input
        {...props}
        className={`w-full ${Icon ? 'pl-14' : 'px-6'} pr-6 py-5 bg-secondary/50 border border-white/5 rounded-2xl outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-white placeholder:text-gray-600`}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-focus-within:w-[80%] transition-all duration-500 rounded-full" />
    </div>
  </div>
);

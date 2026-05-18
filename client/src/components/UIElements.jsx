import { motion } from 'framer-motion';

export const Skeleton = ({ className }) => (
  <div className={`bg-gray-200 dark:bg-slate-700 animate-pulse rounded-lg ${className}`} />
);

export const PremiumButton = ({ children, className, onClick, type = 'button', disabled, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-primary text-white hover:shadow-lg hover:shadow-primary/30',
    secondary: 'bg-secondary text-white hover:shadow-lg hover:shadow-secondary/30',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5',
    ghost: 'text-text-muted hover:bg-gray-100 dark:hover:bg-slate-800',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export const Card = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-card rounded-2xl premium-shadow border border-border overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

export const Badge = ({ children, variant = 'info' }) => {
  const colors = {
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[variant]}`}>
      {children}
    </span>
  );
};

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Home, Search, Heart, User, LogOut, ShieldCheck, Menu, X, Sparkles } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useAuthStore from '../store/authStore';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Discover', path: '/', icon: <Search className="w-4 h-4" /> },
    { name: 'Favorites', path: '/dashboard', icon: <Heart className="w-4 h-4" /> },
    { name: 'Bookings', path: '/bookings', icon: <Home className="w-4 h-4" /> },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> });
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className={`max-w-7xl mx-auto px-6 transition-all duration-500 ${isScrolled ? 'glass rounded-full mx-4 lg:mx-auto shadow-[0_0_30px_rgba(0,0,0,0.3)]' : ''}`}>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group relative z-10">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"
            >
              <Home className="w-6 h-6" />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter text-white">
              Nest<span className="text-primary-light">Finder</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-md rounded-2xl p-1 border border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${location.pathname === link.path ? 'text-white' : 'text-text-muted hover:text-white'}`}
              >
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {link.icon}
                  {link.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </motion.button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 bg-white/5 border border-white/10 rounded-2xl p-1 pl-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-wider">Active Nest</p>
                  <p className="text-sm font-black text-white">{user.name}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('/dashboard')}
                  className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30"
                >
                  <User className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-6 py-3 text-sm font-black text-white hover:text-primary transition-all">Login</Link>
                <Link to="/register" className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                  <button className="relative px-8 py-3 bg-secondary rounded-2xl text-sm font-black text-white border border-white/10 group-hover:border-transparent transition-all">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-white/5 rounded-2xl border border-white/10">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-24 z-40 p-6 md:hidden"
          >
            <div className="glass-card h-full p-8 flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-4 p-5 rounded-3xl bg-white/5 border border-white/10 font-black text-lg"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              <div className="mt-auto grid grid-cols-2 gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-5 text-center rounded-3xl border border-white/10 font-black">Login</Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="p-5 text-center rounded-3xl bg-primary text-white font-black">Join</Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="col-span-2 p-5 text-center rounded-3xl bg-accent/20 text-accent border border-accent/30 font-black">Logout</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

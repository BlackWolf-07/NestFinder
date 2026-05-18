import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Home, Search, Heart, User, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

export default function Navbar() {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <nav className="sticky top-0 z-50 glass border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-secondary dark:text-white">
              Nest<span className="text-primary">Finder</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:text-primary hover:bg-primary/5 transition"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 border-l pl-4 border-border">
                <div className="text-right">
                  <p className="text-xs font-bold text-text-muted uppercase">Welcome</p>
                  <p className="text-sm font-black truncate max-w-[100px]">{user.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-bold hover:text-primary transition">Login</Link>
                <Link to="/register" className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-primary/30 transition">Join Now</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 font-bold"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Link to="/login" className="p-4 text-center rounded-2xl border font-bold">Login</Link>
                  <Link to="/register" className="p-4 text-center rounded-2xl bg-primary text-white font-bold">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import { motion } from 'framer-motion';
import { Home, Twitter, Instagram, Github, Mail, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-background pt-32 pb-12 border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[150px] -mb-[300px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="md:col-span-1">
             <Link to="/" className="flex items-center space-x-3 group mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white shadow-lg">
                   <Home size={24} />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white">Nest<span className="text-primary-light">Finder</span></span>
             </Link>
             <p className="text-text-muted font-medium mb-8 leading-relaxed">
                Redefining the architectural search experience through neural discovery and immersive design protocols.
             </p>
             <div className="flex gap-4">
                {[Twitter, Instagram, Github].map((Icon, i) => (
                  <motion.a 
                    key={i} 
                    href="#" 
                    whileHover={{ y: -5, color: '#6366f1' }}
                    className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-text-muted transition-colors border border-white/5"
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
             </div>
          </div>

          <div className="md:col-span-1">
             <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] mb-10">Network Node</h4>
             <ul className="space-y-6">
                {['Universal Discover', 'Premium Sector', 'Verified Hosts', 'AI Recommendations'].map(item => (
                  <li key={item}><Link to="/" className="text-text-muted font-bold hover:text-primary transition-colors">{item}</Link></li>
                ))}
             </ul>
          </div>

          <div className="md:col-span-1">
             <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] mb-10">Protocols</h4>
             <ul className="space-y-6">
                {['Security Audit', 'Privacy Policy', 'Terms of Sync', 'Cookie Matrix'].map(item => (
                  <li key={item}><Link to="/" className="text-text-muted font-bold hover:text-primary transition-colors">{item}</Link></li>
                ))}
             </ul>
          </div>

          <div className="md:col-span-1">
             <h4 className="text-white font-black uppercase text-xs tracking-[0.3em] mb-10">Direct Comms</h4>
             <p className="text-text-muted font-bold mb-8">Subscribe to get tactical updates and elite listing drops.</p>
             <div className="relative">
                <input 
                  type="email" 
                  placeholder="nexus@protocol.com" 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-primary transition-all font-bold text-white pr-16" 
                />
                <button className="absolute right-2 top-2 bottom-2 w-12 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                   <Mail size={20} />
                </button>
             </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <p className="text-text-muted font-bold text-xs uppercase tracking-widest">
              Â© 2026 NESTFINDER SYSTEMS. ALL SIGNALS SECURED.
           </p>
           <button 
             onClick={scrollToTop}
             className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-widest group"
           >
              Return to Zenith <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
           </button>
        </div>
      </div>
    </footer>
  );
}

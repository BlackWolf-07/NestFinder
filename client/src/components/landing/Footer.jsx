import { motion } from 'framer-motion';
import { Mail, Globe, MessageSquare, Share2, Zap } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    { icon: Mail, href: '#' },
    { icon: Globe, href: '#' },
    { icon: MessageSquare, href: '#' },
    { icon: Share2, href: '#' },
    { icon: Zap, href: '#' },
  ];

  return (
    <footer className="bg-[#0a0a0a] pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <h2 className="text-3xl font-black text-white mb-6 tracking-tighter">
              Nest<span className="text-purple-500">Finder</span>
            </h2>
            <p className="text-gray-500 max-w-sm mb-8 font-medium leading-relaxed">
              The world's most advanced property discovery platform. AI-powered, human-verified, and designed for the future.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -5, color: '#a855f7' }}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Buy Properties</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Rent Properties</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Verified Hosts</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">AI Matching</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-sm font-medium">
            © 2026 NestFinder. All rights reserved. Built with ?? for the future.
          </p>
          <div className="flex gap-8 text-sm text-gray-600 font-medium">
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Badge } from '../components/UIElements';

export default function Recommendations() {
  const location = useLocation();
  const navigate = useNavigate();
  const { recommendations, preferences } = location.state || { recommendations: [], preferences: {} };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-sm mb-4"
          >
            <Sparkles className="w-5 h-5" /> AI Curated Matches
          </motion.div>
          <h1 className="text-5xl font-black tracking-tight text-secondary dark:text-white mb-4">Your Intelligent Nest Selection</h1>
          <p className="text-text-muted text-xl font-medium max-w-2xl">
            Our discovery engine has analyzed {recommendations.length} potential nests in {preferences.city || 'your area'} to find these top matches for you.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-40 bg-card rounded-[40px] border-2 border-dashed border-border"
          >
            <div className="text-8xl mb-6 text-gray-300">🕵️</div>
            <h3 className="text-3xl font-black mb-4">No Perfect Matches Found</h3>
            <p className="text-text-muted max-w-sm mx-auto mb-10 text-lg">We couldn't find exact matches for your criteria. Let's try refining your preferences.</p>
            <PremiumButton onClick={() => navigate('/onboarding')} className="flex items-center gap-2 mx-auto">
              <RefreshCw className="w-5 h-5" /> Restart AI Onboarding
            </PremiumButton>
          </motion.div>
        ) : (
          <div className="grid gap-12">
            {recommendations.map((property, idx) => (
              <motion.div 
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
              >
                <Card className="flex flex-col lg:flex-row overflow-hidden hover:border-primary transition-all duration-500 group">
                  <div className="lg:w-2/5 h-[400px] lg:h-auto relative overflow-hidden">
                    <img 
                      src={property.images && JSON.parse(property.images)[0] ? `http://localhost:5000${JSON.parse(property.images)[0]}` : 'https://via.placeholder.com/800x600'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:hidden" />
                    <div className="absolute top-8 left-8">
                      <div className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl">
                        {idx + 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-12 flex flex-col justify-between bg-card relative">
                    <div className="absolute top-0 right-0 p-8">
                      <Badge variant="success" className="!px-4 !py-2 text-sm shadow-xl">
                        <Zap className="w-4 h-4 inline mr-1 fill-current" /> High Compatibility
                      </Badge>
                    </div>

                    <div>
                      <div className="mb-6">
                        <h2 className="text-4xl font-black text-secondary dark:text-white tracking-tight mb-2 group-hover:text-primary transition-colors">{property.title}</h2>
                        <p className="text-text-muted text-lg font-bold flex items-center">
                          <MapPin className="text-primary mr-2 w-5 h-5" />
                          {property.locality}, {property.city}
                        </p>
                      </div>

                      <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10 mb-10 relative">
                        <div className="absolute -top-3 left-8 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                          Discovery Insight
                        </div>
                        <p className="text-secondary dark:text-white leading-relaxed italic text-lg font-medium">
                          "{property.aiReason}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-8 border-t border-border">
                      <div className="text-center sm:text-left">
                        <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Estimated Investment</p>
                        <p className="text-4xl font-black text-primary tracking-tighter">${Number(property.price).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-4 w-full sm:w-auto">
                        <Link to={`/properties/${property.id}`} className="flex-1 sm:flex-initial">
                          <PremiumButton className="w-full flex items-center justify-center gap-2 group/btn !rounded-2xl !px-10 py-5 text-lg">
                            Take a Tour <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </PremiumButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

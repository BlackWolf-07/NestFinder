import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAiRecommendations } from '../api/ai';
import { Card, PremiumButton, Skeleton } from '../components/UIElements';
import { Sparkles, ChevronLeft, ChevronRight, Home, MapPin, DollarSign, Heart } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  {
    title: "What's your goal?",
    subtitle: "Select the primary purpose for your new nest.",
    icon: <Home className="w-10 h-10" />,
    fields: ["type"],
    options: { type: ["rent", "buy"] }
  },
  {
    title: "Preferred Location",
    subtitle: "Tell us where you'd love to live.",
    icon: <MapPin className="w-10 h-10" />,
    fields: ["city", "locality"],
  },
  {
    title: "Budget & Space",
    subtitle: "Define your ideal configuration and limits.",
    icon: <DollarSign className="w-10 h-10" />,
    fields: ["budget", "bhk"],
  },
  {
    title: "Lifestyle & Perks",
    subtitle: "What makes a house feel like a home to you?",
    icon: <Heart className="w-10 h-10" />,
    fields: ["lifestyle", "amenities"],
    options: { 
      lifestyle: ["family", "bachelor", "pet-friendly", "student"],
      amenities: ["WiFi", "Parking", "Gym", "Lift", "Security", "Pool", "Garden"]
    }
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    type: 'rent',
    city: '',
    locality: '',
    budget: '',
    bhk: '',
    lifestyle: 'family',
    amenities: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const recommendations = await getAiRecommendations(data);
      toast.success('AI Discovery Complete! Analyzing results...');
      navigate('/recommendations', { state: { recommendations, preferences: data } });
    } catch (err) {
      toast.error('AI Recommendation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateData = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleAmenityToggle = (amenity) => {
    const current = data.amenities;
    if (current.includes(amenity)) {
      updateData('amenities', current.filter(a => a !== amenity));
    } else {
      updateData('amenities', [...current, amenity]);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -ml-48 -mb-48" />

      <Card className="max-w-3xl w-full !rounded-[40px] overflow-hidden bg-white/90 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
        <div className="h-2 bg-gray-100/50">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>
        
        <div className="p-12 md:p-16">
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-3">Discovery Phase {step + 1} of {STEPS.length}</p>
              <h2 className="text-4xl font-black text-secondary tracking-tight">{STEPS[step].title}</h2>
              <p className="text-gray-500 font-medium mt-2">{STEPS[step].subtitle}</p>
            </div>
            <div className="p-4 bg-primary/10 text-primary rounded-3xl">
              {STEPS[step].icon}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[250px]"
            >
              {step === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {STEPS[0].options.type.map(t => (
                    <button
                      key={t}
                      onClick={() => updateData('type', t)}
                      className={`group p-8 rounded-[32px] border-4 text-left transition-all ${data.type === t ? 'border-primary bg-primary/5' : 'border-gray-50 hover:border-gray-200 bg-gray-50/50'}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${data.type === t ? 'bg-primary text-white' : 'bg-white text-gray-400 group-hover:bg-primary/20'}`}>
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <span className="block font-black text-2xl capitalize text-secondary">I want to {t}</span>
                      <p className="text-sm text-gray-500 font-bold mt-2">Find the best {t === 'rent' ? 'lease' : 'ownership'} options available.</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Target City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. New York, London..." 
                      className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-[24px] outline-none focus:border-primary/20 focus:bg-white transition-all font-black text-xl text-secondary"
                      value={data.city}
                      onChange={(e) => updateData('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Specific Locality (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Manhattan, Kensington..." 
                      className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-[24px] outline-none focus:border-primary/20 focus:bg-white transition-all font-black text-xl text-secondary"
                      value={data.locality}
                      onChange={(e) => updateData('locality', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Maximum Investment (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                      <input 
                        type="number" 
                        placeholder="2500" 
                        className="w-full pl-14 pr-5 py-5 bg-gray-50 border-4 border-transparent rounded-[24px] outline-none focus:border-primary/20 focus:bg-white transition-all font-black text-xl text-secondary"
                        value={data.budget}
                        onChange={(e) => updateData('budget', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Bedrooms (BHK)</label>
                    <input 
                      type="number" 
                      placeholder="2" 
                      className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-[24px] outline-none focus:border-primary/20 focus:bg-white transition-all font-black text-xl text-secondary"
                      value={data.bhk}
                      onChange={(e) => updateData('bhk', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 block mb-4">Your Lifestyle</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {STEPS[3].options.lifestyle.map(l => (
                        <button
                          key={l}
                          onClick={() => updateData('lifestyle', l)}
                          className={`p-4 rounded-2xl border-2 font-black text-sm capitalize transition-all ${data.lifestyle === l ? 'bg-secondary text-white border-secondary shadow-lg' : 'bg-gray-50 border-gray-100 hover:border-gray-300'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 block mb-4">Must-have Amenities</label>
                    <div className="flex flex-wrap gap-3">
                      {STEPS[3].options.amenities.map(a => (
                        <button
                          key={a}
                          onClick={() => handleAmenityToggle(a)}
                          className={`px-6 py-3 rounded-full border-2 font-black text-xs transition-all ${data.amenities.includes(a) ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-400'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 flex justify-between items-center">
            {step > 0 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-2 text-gray-400 font-black hover:text-secondary transition"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            ) : <div />}
            
            <PremiumButton 
              onClick={handleNext}
              disabled={loading}
              className="!px-12 py-5 !rounded-3xl text-xl flex items-center gap-3 shadow-2xl shadow-primary/30"
            >
              {loading ? 'Processing Engine...' : step === STEPS.length - 1 ? (
                <>Generate Matches <Sparkles className="w-6 h-6" /></>
              ) : (
                <>Continue <ChevronRight className="w-6 h-6" /></>
              )}
            </PremiumButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

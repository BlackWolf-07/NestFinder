import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAiRecommendations } from '../api/ai';
import { Card, PremiumButton, Skeleton } from '../components/UIElements';
import { Sparkles, ChevronLeft, ChevronRight, Home, MapPin, IndianRupee, Heart } from 'lucide-react';
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
    icon: <IndianRupee className="w-10 h-10" />,
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

const INDIAN_GEOGRAPHY = {
  "Kolkata": ["Salt Lake", "New Town", "Ballygunge", "South City", "Park Street"],
  "Bangalore": ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar"],
  "Mumbai": ["Bandra", "Andheri", "Juhu", "Worli", "Powai"],
  "Delhi": ["Hauz Khas", "Greater Kailash", "Saket", "Vasant Vihar", "Rohini"],
  "Pune": ["Koregaon Park", "Baner", "Viman Nagar", "Kothrud", "Hinjewadi"]
};

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
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [isCustomLocality, setIsCustomLocality] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && (!data.city || !data.locality)) {
      return toast.error('Please select or enter both city and locality');
    }
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
    if (field === 'city') {
      setData(prev => ({ ...prev, city: value, locality: '' }));
      setIsCustomLocality(false);
    }
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

      <Card className="max-w-4xl w-full !rounded-[40px] overflow-hidden bg-white/90 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
        <div className="h-2 bg-gray-100/50">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>
        
        <div className="p-10 md:p-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center space-x-3 group relative z-10">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20"
                >
                  <Home className="w-7 h-7" />
                </motion.div>
                <span className="text-2xl font-black tracking-tighter text-secondary">
                  Nest<span className="text-primary">Finder</span>
                </span>
              </Link>
              <div className="hidden md:block w-px h-10 bg-gray-200" />
              <div>
                <p className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-1">Discovery Phase {step + 1} of {STEPS.length}</p>
                <h2 className="text-4xl font-black text-secondary tracking-tight leading-none">{STEPS[step].title}</h2>
              </div>
            </div>
            <div className="p-4 bg-primary/10 text-primary rounded-3xl hidden md:block">
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
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest px-1">Select Target City</label>
                    <div className="flex flex-wrap gap-3">
                      {Object.keys(INDIAN_GEOGRAPHY).map(city => (
                        <button
                          key={city}
                          onClick={() => {
                            updateData('city', city);
                            setIsCustomCity(false);
                          }}
                          className={`px-6 py-3 rounded-2xl border-2 font-black text-sm transition-all ${data.city === city && !isCustomCity ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-secondary'}`}
                        >
                          {city}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setIsCustomCity(true);
                          updateData('city', '');
                        }}
                        className={`px-6 py-3 rounded-2xl border-2 font-black text-sm transition-all ${isCustomCity ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-secondary'}`}
                      >
                        Custom City
                      </button>
                    </div>
                    {isCustomCity && (
                      <motion.input 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        type="text" 
                        placeholder="Enter Indian City (e.g. Kolkata, Bangalore)" 
                        className="w-full p-5 bg-gray-50 border-4 border-primary/20 rounded-[24px] outline-none focus:border-primary focus:bg-white transition-all font-black text-xl text-black"
                        value={data.city}
                        onChange={(e) => updateData('city', e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest px-1">Specific Locality</label>
                    {!data.city || (isCustomCity && !data.city.trim()) ? (
                      <p className="text-sm text-secondary italic font-bold p-5 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">Please select or enter a city first to view localities.</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                          {INDIAN_GEOGRAPHY[data.city]?.map(loc => (
                            <button
                              key={loc}
                              onClick={() => {
                                updateData('locality', loc);
                                setIsCustomLocality(false);
                              }}
                              className={`px-6 py-3 rounded-2xl border-2 font-black text-sm transition-all ${data.locality === loc && !isCustomLocality ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-secondary'}`}
                            >
                              {loc}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setIsCustomLocality(true);
                              updateData('locality', '');
                            }}
                            className={`px-6 py-3 rounded-2xl border-2 font-black text-sm transition-all ${isCustomLocality ? 'bg-primary text-white border-primary shadow-lg' : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-secondary'}`}
                          >
                            Custom Locality
                          </button>
                        </div>
                        {isCustomLocality && (
                          <motion.input 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            type="text" 
                            placeholder="Enter Locality Name" 
                            className="w-full p-5 bg-gray-50 border-4 border-primary/20 rounded-[24px] outline-none focus:border-primary focus:bg-white transition-all font-black text-xl text-black"
                            value={data.locality}
                            onChange={(e) => updateData('locality', e.target.value)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest px-1">Maximum Investment (INR)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
                      <input 
                        type="number" 
                        placeholder="50000" 
                        className="w-full pl-14 pr-5 py-5 bg-gray-50 border-4 border-transparent rounded-[24px] outline-none focus:border-primary/20 focus:bg-white transition-all font-black text-xl text-black"
                        value={data.budget}
                        onChange={(e) => updateData('budget', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest px-1">Bedrooms (BHK)</label>
                    <input 
                      type="number" 
                      placeholder="2" 
                      className="w-full p-5 bg-gray-50 border-4 border-transparent rounded-[24px] outline-none focus:border-primary/20 focus:bg-white transition-all font-black text-xl text-black"
                      value={data.bhk}
                      onChange={(e) => updateData('bhk', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-10">
                  <div>
                    <label className="text-xs font-black text-secondary uppercase tracking-widest px-1 block mb-4">Your Lifestyle</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {STEPS[3].options.lifestyle.map(l => (
                        <button
                          key={l}
                          onClick={() => updateData('lifestyle', l)}
                          className={`p-4 rounded-2xl border-2 font-black text-sm capitalize transition-all ${data.lifestyle === l ? 'bg-secondary text-white border-secondary shadow-lg' : 'bg-gray-50 border-gray-100 hover:border-gray-300 text-secondary'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-black text-secondary uppercase tracking-widest px-1 block mb-4">Must-have Amenities</label>
                    <div className="flex flex-wrap gap-3">
                      {STEPS[3].options.amenities.map(a => (
                        <button
                          key={a}
                          onClick={() => handleAmenityToggle(a)}
                          className={`px-6 py-3 rounded-full border-2 font-black text-xs transition-all ${data.amenities.includes(a) ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white border-gray-100 hover:border-gray-300 text-secondary'}`}
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
            <button 
              onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
              className="flex items-center gap-2 px-6 py-2 text-secondary font-black hover:text-primary transition group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
              {step > 0 ? 'Previous Phase' : 'Exit to Home'}
            </button>
            
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

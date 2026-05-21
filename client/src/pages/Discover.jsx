import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, X, Sparkles, Zap, Shield, TrendingUp, RefreshCcw } from 'lucide-react';
import { getProperties } from '../api/property';
import PropertyCard from '../components/PropertyCard';
import GlobalAssistant from '../components/GlobalAssistant';
import Navbar from '../components/Navbar';
import { Skeleton, PremiumButton, Card, Badge } from '../components/UIElements';

const CATEGORIES = ['flat', 'house', 'PG', 'hostel', 'commercial'];
const BHK_OPTIONS = [1, 2, 3, 4, 5];

const MOCK_PROPERTIES = [
  { id: 'm1', title: 'Futuristic Neo-Apartment', locality: 'Neo-Tokyo', city: 'Sector 7', price: 2500000, bhk: 3, type: 'buy', category: 'flat', images: '[]', isVerified: true, avgRating: 4.8 },
  { id: 'm2', title: 'Cyberpunk Penthouse', locality: 'Sky-Rise', city: 'Mars Colony', price: 12000, bhk: 2, type: 'rent', category: 'house', images: '[]', isVerified: true, avgRating: 4.9 },
  { id: 'm3', title: 'Glass Oasis Villa', locality: 'Oceanic-Rim', city: 'Venice 2.0', price: 8500000, bhk: 5, type: 'buy', category: 'house', images: '[]', isVerified: false, avgRating: 4.5 },
];

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState({ properties: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    bhk: '',
    locality: '',
    page: 1,
    limit: 6
  });

  const isFirstRender = useRef(true);

  const fetchProperties = useCallback(async (currentFilters) => {
    console.log("Home: Initiating fetch sequence...");
    setLoading(true);
    setError(null);

    try {
      const res = await getProperties(currentFilters || filters);
      console.log("Home: Fetch success.", res);
      // res is { success: true, data: [...] }
      const propertyList = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
      setData({
        properties: propertyList,
        total: propertyList.length,
        page: 1,
        totalPages: 1
      });
    } catch (err) {
      console.error("Home: Communication failure:", err);
      setError("Sector data unreachable. Offline cache engaged.");
      setData(prev => prev.properties.length > 0 ? prev : { properties: MOCK_PROPERTIES, total: 3, page: 1, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  }, [filters]); 

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 100);
    return () => clearTimeout(timer);
  }, [filters, fetchProperties]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > data.totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="bg-background min-h-screen text-white selection:bg-primary/30">
      <Navbar />
      <GlobalAssistant onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f, page: 1 }))} />

      {/* Futuristic Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light">Universal Real Estate Matrix</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight"
          >
            Find Your <br />
            <span className="text-gradient">Futuristic</span> Nest
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-text-muted mb-12 max-w-2xl mx-auto font-medium"
          >
            Neural-powered property discovery with verified architectural signatures.
          </motion.p>

          <div className="max-w-4xl mx-auto">
            <div className="glass p-2 rounded-[32px] shadow-2xl flex flex-col md:flex-row items-center gap-2 border-white/10 group focus-within:border-primary/50 transition-all">
              <div className="flex-1 flex items-center px-6 w-full">
                <MapPin className="text-primary w-6 h-6 mr-4" />
                <input
                  type="text"
                  name="city"
                  placeholder="Target Sector (City)..."
                  className="w-full bg-transparent py-5 outline-none font-bold text-xl text-white placeholder:text-gray-500"
                  value={filters.city}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="w-full md:w-auto flex gap-2 p-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-5 rounded-2xl flex items-center justify-center transition-all ${showFilters ? 'bg-primary text-white' : 'glass-light hover:bg-white/10'}`}
                >
                  <SlidersHorizontal className="w-6 h-6" />
                </button>
                <PremiumButton onClick={() => fetchProperties()} className="w-full md:w-auto px-12 py-5 !rounded-2xl">
                  Sync Search
                </PremiumButton>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-8 glass rounded-[40px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left border-white/5"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Type</label>
                    <select name="type" className="w-full bg-white/5 p-3 rounded-xl border border-white/10 outline-none font-bold text-sm" value={filters.type} onChange={handleFilterChange}>
                      <option value="">All Modes</option>
                      <option value="rent">Lease</option>
                      <option value="buy">Ownership</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Category</label>
                    <select name="category" className="w-full bg-white/5 p-3 rounded-xl border border-white/10 outline-none font-bold text-sm" value={filters.category} onChange={handleFilterChange}>
                      <option value="">Any Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Layout</label>
                    <select name="bhk" className="w-full bg-white/5 p-3 rounded-xl border border-white/10 outline-none font-bold text-sm" value={filters.bhk} onChange={handleFilterChange}>
                      <option value="">Any BHK</option>
                      {BHK_OPTIONS.map(b => <option key={b} value={b}>{b} BHK</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest">Budget</label>
                    <div className="flex gap-2">
                      <input type="number" name="minPrice" placeholder="Min" className="w-1/2 bg-white/5 p-3 rounded-xl border border-white/10 outline-none font-bold text-sm" value={filters.minPrice} onChange={handleFilterChange} />
                      <input type="number" name="maxPrice" placeholder="Max" className="w-1/2 bg-white/5 p-3 rounded-xl border border-white/10 outline-none font-bold text-sm" value={filters.maxPrice} onChange={handleFilterChange} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {error && (
          <div className="mb-10 p-5 glass rounded-2xl border-accent/30 flex items-center justify-between text-accent font-black text-xs uppercase tracking-widest"> 
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> {error}</span>
            <button onClick={() => fetchProperties()} className="hover:rotate-180 transition-transform duration-500"><RefreshCcw className="w-4 h-4" /></button>    
          </div>
        )}

        <div className="flex justify-between items-end mb-12">
          <div>
            <Badge variant="info">Curated Protocol</Badge>
            <h2 className="text-5xl font-black mt-4 tracking-tighter">Premium Listings</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-[350px] rounded-[32px]" />
                <Skeleton className="h-8 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-1/2 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.properties && data.properties.map((property, idx) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  index={idx} 
                  setProperties={setData}
                />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-4">
                <PremiumButton variant="glass" disabled={data.page === 1} onClick={() => handlePageChange(data.page - 1)} className="!p-4">
                  <ChevronLeft />
                </PremiumButton>
                <div className="flex gap-2">
                  {[...Array(data.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-12 h-12 rounded-xl font-black transition-all ${data.page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'glass-light hover:bg-white/10'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <PremiumButton variant="glass" disabled={data.page === data.totalPages} onClick={() => handlePageChange(data.page + 1)} className="!p-4">
                  <ChevronRight />
                </PremiumButton>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-secondary/30 py-20 border-t border-white/5 text-center">
        <h3 className="text-4xl font-black mb-4 tracking-tighter text-gradient italic">Initialize Hosting</h3>
        <p className="text-text-muted mb-8 max-w-lg mx-auto">Sync your premium architectural nodes with the planet's elite network.</p>
        <PremiumButton onClick={() => navigate('/host/add-property')}>
          Begin Protocol
        </PremiumButton>
      </footer>
    </div>
  );
}

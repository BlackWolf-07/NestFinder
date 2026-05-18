import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getProperties } from '../api/property';
import PropertyCard from '../components/PropertyCard';
import GlobalAssistant from '../components/GlobalAssistant';
import Navbar from '../components/Navbar';
import { Skeleton, PremiumButton, Card } from '../components/UIElements';

const CATEGORIES = ['flat', 'house', 'PG', 'hostel', 'commercial'];
const BHK_OPTIONS = [1, 2, 3, 4, 5];

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState({ properties: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await getProperties(filters);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="bg-background min-h-screen">
      <Navbar />
      <GlobalAssistant onFilterChange={(f) => setFilters(prev => ({ ...prev, ...f, page: 1 }))} />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden bg-secondary">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent rounded-full blur-[150px]" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
          >
            Find Your <span className="text-primary italic">Perfect</span> Nest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Experience the future of property discovery with AI-powered insights and verified listings tailored just for you.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card p-2 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-2 border border-border"
          >
            <div className="flex-1 flex items-center px-4 w-full">
              <MapPin className="text-text-muted mr-3 w-5 h-5" />
              <input
                type="text"
                name="city"
                placeholder="Where would you like to live?"
                className="w-full bg-transparent py-4 outline-none font-bold text-lg"
                value={filters.city}
                onChange={handleFilterChange}
              />
            </div>
            <div className="w-full md:w-auto flex gap-2 p-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-2xl flex items-center justify-center transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
              >
                <SlidersHorizontal className="w-6 h-6" />
              </button>
              <PremiumButton className="w-full md:w-auto px-10 py-4 !rounded-2xl">
                Search
              </PremiumButton>
            </div>
          </motion.div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-8 bg-card rounded-3xl shadow-xl border border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left"
              >
                <div>
                  <label className="block text-xs font-black text-text-muted uppercase mb-2">Property Type</label>
                  <select
                    name="type"
                    className="w-full bg-background p-3 rounded-xl border border-border outline-none focus:border-primary font-bold"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="rent">Rent</option>
                    <option value="buy">Buy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-text-muted uppercase mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full bg-background p-3 rounded-xl border border-border outline-none focus:border-primary font-bold"
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-text-muted uppercase mb-2">BHK</label>
                  <select
                    name="bhk"
                    className="w-full bg-background p-3 rounded-xl border border-border outline-none focus:border-primary font-bold"
                    value={filters.bhk}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any BHK</option>
                    {BHK_OPTIONS.map(b => <option key={b} value={b}>{b} BHK</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-text-muted uppercase mb-2">Price Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      className="w-1/2 bg-background p-3 rounded-xl border border-border outline-none focus:border-primary font-bold"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      className="w-1/2 bg-background p-3 rounded-xl border border-border outline-none focus:border-primary font-bold"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-secondary dark:text-white tracking-tight">Verified Properties</h2>
            <p className="text-text-muted mt-2 font-medium">Browse our hand-picked selection of high-quality nests.</p>
          </div>
          {filters.city && (
            <div className="mt-4 md:mt-0 flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              Showing results in {filters.city}
              <button onClick={() => setFilters(p => ({ ...p, city: '', page: 1 }))} className="ml-2 hover:scale-110 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 rounded-3xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : data.properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 bg-card rounded-[40px] border-2 border-dashed border-border"
          >
            <div className="text-8xl mb-6">🏘️</div>
            <h3 className="text-3xl font-black mb-2 tracking-tight">No Nests Found</h3>
            <p className="text-text-muted max-w-sm mx-auto">We couldn't find any properties matching your current criteria.</p>
            <PremiumButton
              variant="outline"
              className="mt-8"
              onClick={() => setFilters({ city: '', type: '', category: '', minPrice: '', maxPrice: '', bhk: '', locality: '', page: 1, limit: 6 })}
            >
              Reset All Filters
            </PremiumButton>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.properties.map((property, idx) => (
                <PropertyCard key={property.id} property={property} index={idx} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center space-x-4">
                <PremiumButton
                  variant="ghost"
                  disabled={data.page === 1}
                  onClick={() => handlePageChange(data.page - 1)}
                  className="!p-3"
                >
                  <ChevronLeft />
                </PremiumButton>

                <div className="flex items-center space-x-2">
                  {[...Array(data.totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-12 h-12 rounded-2xl font-black transition-all ${data.page === i + 1 ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 'bg-card hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <PremiumButton
                  variant="ghost"
                  disabled={data.page === data.totalPages}
                  onClick={() => handlePageChange(data.page + 1)}
                  className="!p-3"
                >
                  <ChevronRight />
                </PremiumButton>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Teaser */}
      <footer className="bg-secondary text-white py-20 px-8 text-center">
        <h3 className="text-3xl font-black mb-4">Want to list your property?</h3>
        <p className="text-gray-400 mb-8">Join the premium network of property owners on NestFinder.</p>
        <PremiumButton onClick={() => navigate('/host/add-property')}>
          Become a Host
        </PremiumButton>
      </footer>
    </div>
  );
}

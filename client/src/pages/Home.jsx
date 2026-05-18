import { useState, useEffect } from 'react';
import { getProperties } from '../api/property';
import PropertyCard from '../components/PropertyCard';
import GlobalAssistant from '../components/GlobalAssistant';

const CATEGORIES = ['flat', 'house', 'PG', 'hostel', 'commercial'];
const BHK_OPTIONS = [1, 2, 3, 4, 5];

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
    city: '', 
    type: '', 
    category: '', 
    minPrice: '', 
    maxPrice: '', 
    bhk: '',
    locality: ''
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await getProperties(filters);
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAiFilter = (aiFilters) => {
    setFilters(prev => ({ ...prev, ...aiFilters }));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <GlobalAssistant onFilterChange={handleAiFilter} />
      {/* Hero Section */}
      <div className="bg-secondary text-white py-24 px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>

        <h1 className="text-6xl font-extrabold mb-6 relative z-10">Smart Real Estate Discovery</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 relative z-10">
          Join thousands of happy families finding their dream homes using our AI-powered discovery engine.
        </p>
        
        {/* Search & Main Filter */}
        <div className="max-w-5xl mx-auto bg-white p-3 rounded-2xl shadow-2xl flex flex-col lg:flex-row gap-3 relative z-10">
          <div className="flex-1 flex items-center px-4 border-r border-gray-100">
            <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <input 
              type="text" 
              name="city"
              placeholder="Enter City (e.g. New York)" 
              className="w-full p-3 text-secondary outline-none font-medium"
              value={filters.city}
              onChange={handleFilterChange}
            />
          </div>
          <div className="lg:w-48 flex items-center px-4 border-r border-gray-100">
            <select 
              name="type"
              className="w-full p-3 text-secondary outline-none font-medium bg-transparent"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="rent">Rent</option>
              <option value="buy">Buy</option>
            </select>
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 text-secondary font-bold hover:bg-gray-100 rounded-xl transition flex items-center justify-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
          </button>
          <button className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition">
            Discover Now
          </button>
        </div>

        {/* Advanced Filters Dropdown */}
        {showFilters && (
          <div className="max-w-5xl mx-auto mt-4 bg-white p-8 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Locality</label>
              <input 
                type="text" 
                name="locality"
                placeholder="Area name" 
                className="w-full p-2 border-b text-secondary font-semibold outline-none focus:border-primary"
                value={filters.locality}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Category</label>
              <select 
                name="category"
                className="w-full p-2 border-b text-secondary font-semibold outline-none focus:border-primary"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">Any Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">BHK</label>
              <select 
                name="bhk"
                className="w-full p-2 border-b text-secondary font-semibold outline-none focus:border-primary"
                value={filters.bhk}
                onChange={handleFilterChange}
              >
                <option value="">Any BHK</option>
                {BHK_OPTIONS.map(b => <option key={b} value={b}>{b} BHK</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Price Range</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="number" 
                  name="minPrice"
                  placeholder="Min" 
                  className="w-1/2 p-2 border-b text-secondary font-semibold outline-none focus:border-primary"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />
                <span className="text-gray-300">-</span>
                <input 
                  type="number" 
                  name="maxPrice"
                  placeholder="Max" 
                  className="w-1/2 p-2 border-b text-secondary font-semibold outline-none focus:border-primary"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto py-16 px-8">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-secondary mb-2">Verified Properties</h2>
            <p className="text-gray-500">Curated listings for high-quality living standards</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-gray-200 rounded-full text-sm font-bold text-gray-600">
            {properties.length} Results Found
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-56 bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-secondary mb-2">No matching properties</h3>
            <p className="text-gray-500">Try adjusting your filters or search in a different area.</p>
            <button 
              onClick={() => setFilters({ city: '', type: '', category: '', minPrice: '', maxPrice: '', bhk: '', locality: '' })}
              className="mt-6 text-primary font-bold hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

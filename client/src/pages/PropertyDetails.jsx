import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import { getPropertyDetails, deleteProperty } from '../api/property';
import axios from 'axios';

// ... (rest of imports)
import { scheduleVisit } from '../api/booking';
import { addToFavorites, removeFromFavorites, getMyFavorites } from '../api/favorite';
import { getReviews, addReview } from '../api/review';
import { reportProperty } from '../api/report';
import { formatPrice } from '../utils/formatPrice';
import useAuthStore from '../store/authStore';
import L from 'leaflet';
import ChatBot from '../components/ChatBot';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Badge, Skeleton, FuturisticInput } from '../components/UIElements';
import { MapPin, Calendar, Clock, Phone, Mail, ShieldCheck, Flag, Star, ChevronLeft, Zap, Sparkles, MessageSquare, ChevronRight, Home } from 'lucide-react';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [intelligence, setIntelligence] = useState(null);
  const [intelLoading, setIntelLoading] = useState(false);

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchData();
    fetchReviews();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (property?.city && property?.locality) {
      fetchIntelligence();
    }
  }, [property]);

  const fetchIntelligence = async () => {
    if (!property?.address) return;
    setIntelLoading(true);
    try {
      const res = await axios.get(`/properties/intelligence?location=${encodeURIComponent(property.address)}&city=${encodeURIComponent(property.city)}&locality=${encodeURIComponent(property.locality)}&lat=${property.latitude}&lon=${property.longitude}`);
      if (res.data.success) {
        setIntelligence(res.data.data);
        // Fallback update for coordinates if missing in property but found in intelligence
        if (!property.latitude && res.data.lat) {
          setProperty(prev => ({ ...prev, latitude: res.data.lat, longitude: res.data.lon }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch intelligence', err);
    } finally {
      setIntelLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getPropertyDetails(id);
      // Fixed response handling
      const data = response.success ? response.property : response;
      setProperty(data);

      if (isAuthenticated) {
        try {
            const favoritesRes = await getMyFavorites();
            const favorites = favoritesRes.success ? favoritesRes.favorites : (Array.isArray(favoritesRes) ? favoritesRes : []);
            setIsFavorite(favorites.some(f => f.id === parseInt(id)));
        } catch (fErr) {
            console.error("Failed to fetch favorites", fErr);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await getReviews(id);
      const data = response.success ? response.data : response;
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Identity Verification Required. Please login.');
    if (!visitDate || !visitTime) return toast.error('Protocol Incomplete. Select date and time.');

    setBookingLoading(true);
    try {
      await scheduleVisit({ propertyId: id, visitDate, visitTime });
      toast.success('Visit Synchronized! System updated.');
    } catch (err) {
      toast.error('Synchronization failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Identity Verification Required.');
    try {
      await addReview({ propertyId: id, ...newReview });
      toast.success('Review Integrated!');
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      toast.error('Integration failure');
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) return toast.error('Identity Verification Required.');
    try {
      await reportProperty({ propertyId: id, reason: reportReason });
      toast.success('Anomaly Reported. Security team notified.');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      toast.error('Reporting failure');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return toast.error('Identity Verification Required.');
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        toast.info('Archived Link Removed');
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        toast.success('Link Secured in Favorites!');
      }
    } catch (err) {
      toast.error('Action Rejection');
    }
  };

  if (loading) return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto p-12 space-y-12">
        <Skeleton className="h-[600px] w-full rounded-[48px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="h-8 w-1/3 rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-[32px]" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-[40px]" />
        </div>
      </div>
    </div>
  );

  if (!property) return <div className="p-20 text-center text-4xl font-black text-accent italic animate-float">SIGNAL LOST: PROPERTY NOT FOUND</div>;

  const imageUrl = property.image 
    ? (property.image.startsWith('http') ? property.image : `http://localhost:5000${property.image}`)
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200';

  // Safe Amenities Parsing
  let amenities = [];
  try {
    amenities = typeof property.amenities === 'string' ? JSON.parse(property.amenities) : (property.amenities || []);
  } catch (e) {
    console.error("Amenities parsing failed", e);
    amenities = [];
  }

  const neighborhood = property.neighborhood ? (typeof property.neighborhood === 'string' ? JSON.parse(property.neighborhood) : property.neighborhood) : {};        

  const lat = Number(property.latitude);
  const lng = Number(property.longitude);

  return (
    <div className="bg-background min-h-screen text-white">
      <Navbar />

      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 -left-24 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 -right-24 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 pt-32">
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center text-sm font-black text-text-muted"
          >
            <Link to="/" className="hover:text-primary transition-all flex items-center gap-2 group">
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Navigation
            </Link>
            <span className="mx-4 opacity-20">/</span>
            <span className="capitalize text-primary-light">{property.category}</span>
            <span className="mx-4 opacity-20">/</span>
            <span className="truncate max-w-[200px] opacity-60 italic">{property.title}</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowReportModal(true)}
            className="text-accent text-xs font-black bg-accent/10 border border-accent/20 px-6 py-3 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest"
          >
            <Flag className="w-4 h-4" /> Report Anomaly
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-16">
            {/* Immersive Image Gallery */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[650px] rounded-[48px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative border border-white/10 group"
              >
                <img
                  src={imageUrl}
                  onError={(e) => e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-10 left-10 flex flex-col gap-4">
                  <Badge variant="glass" className="text-sm px-6 py-3 shadow-2xl">
                    {property.type === 'buy' ? 'Ownership Protocol' : 'Access Lease'}
                  </Badge>
                  {property.isVerified && (
                    <Badge variant="info" className="text-sm px-6 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                      <ShieldCheck className="w-5 h-5" /> Secured & Verified
                    </Badge>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Core Info Architecture */}
            <section className="space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]"
                  >
                    {property.title}
                  </motion.h1>
                  <div className="flex items-center text-primary-light text-2xl font-black tracking-tighter">
                    <MapPin className="text-primary mr-3 w-8 h-8" />
                    {property.locality}, <span className="text-white opacity-40 ml-2">{property.city}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Market Valuation</p>
                    <p className="text-5xl font-black text-gradient tracking-tighter">{formatPrice(property.price)}</p>
                  </div>
                  <PremiumButton
                    variant={isFavorite ? 'primary' : 'glass'}
                    onClick={handleFavorite}
                    className="!px-10 !py-5 !rounded-3xl shadow-2xl group"
                  >
                    <Star className={`w-6 h-6 group-hover:rotate-45 transition-transform ${isFavorite ? 'fill-white' : ''}`} />
                    <span className="ml-2 uppercase tracking-widest text-xs">{isFavorite ? 'Secured' : 'Secure Link'}</span>
                  </PremiumButton>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Configuration', value: `${property.bhk} BHK`, icon: <Zap className="w-5 h-5" /> },
                  { label: 'Architecture', value: property.category, capitalize: true, icon: <Home className="w-5 h-5" /> },
                  { label: 'Furnishing', value: property.furnishing, capitalize: true, icon: <Sparkles className="w-5 h-5" /> },
                  { label: 'Status', value: 'Prime', icon: <ShieldCheck className="w-5 h-5" /> }
                ].map((item, i) => (
                  <div key={i} className="glass-card p-8 text-center group hover:border-primary/50 transition-all">
                    <div className="flex justify-center mb-4 text-primary group-hover:scale-125 transition-transform">{item.icon}</div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{item.label}</p>
                    <p className={`text-xl font-black text-white ${item.capitalize ? 'capitalize' : ''}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="glass-card p-10 space-y-6">
                <h3 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic">
                  <Zap className="text-primary w-8 h-8" /> Data Description
                </h3>
                <p className="text-text-muted text-xl leading-[1.6] whitespace-pre-wrap font-medium opacity-80">
                  {property.description}
                </p>
              </div>

              <div className="space-y-8">
                <h3 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                  <Sparkles className="text-primary w-8 h-8" /> Integrated Amenities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {amenities.map(item => (
                    <motion.div
                      key={item}
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-4 p-5 glass-light border-white/5 rounded-3xl font-black text-sm uppercase tracking-widest text-white group"  
                    >
                      <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)] group-hover:scale-150 transition-transform" />
                      {item}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Neighborhood Intelligence */}
              <div className="space-y-10 pt-16 border-t border-white/5">
                <h3 className="text-3xl font-black tracking-tighter">Neighborhood Intelligence</h3>
                
                {intelLoading ? (
                  <div className="col-span-full py-10 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-text-muted font-black uppercase tracking-widest text-xs">Syncing Locality Intelligence...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    {[
                      { title: 'Education', icon: '🎓', list: intelligence?.education || [], color: 'primary' },
                      { title: 'Healthcare', icon: '🏥', list: intelligence?.healthcare || [], color: 'accent' },
                      { title: 'Connectivity', icon: '🚉', list: intelligence?.connectivity || [], color: 'primary' },
                      { title: 'Lifestyle', icon: '🛒', list: intelligence?.lifestyle || [], color: 'accent' }
                    ].map((cat, i) => (
                      <div key={i} className="glass-card p-1 group">
                        <div className="bg-secondary/40 p-8 rounded-[30px] flex gap-6 h-full">
                          <div className="text-5xl group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">{cat.icon}</div>
                          <div>
                            <h4 className="font-black text-xl mb-3 text-white tracking-tight">{cat.title}</h4>
                            <ul className="space-y-2">
                              {cat.list.length > 0 ? cat.list.map((item, j) => (
                                <li key={j} className="text-sm font-bold text-text-muted flex items-center gap-2 italic">
                                  <div className="w-1.5 h-1.5 bg-white/20 rounded-full" /> {item}
                                </li>
                              )) : (
                                <li className="text-xs font-bold text-text-muted/40 italic">No nearby data found</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Sync (Reviews) */}
              <div className="space-y-12 pt-16 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black tracking-tighter flex items-center gap-3 italic">
                    <MessageSquare className="text-primary w-8 h-8" /> Community Sync
                  </h3>
                  <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 text-primary-light px-6 py-3 rounded-2xl font-black text-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <Star className="w-6 h-6 fill-primary" />
                    {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : '9.5'}
                  </div>
                </div>

                {isAuthenticated && (
                  <Card className="p-10 border-dashed border-2 border-primary/30 bg-primary/5">
                    <h4 className="font-black mb-6 uppercase text-[10px] tracking-[0.4em] text-primary">Input New Feedback Data</h4>
                    <div className="flex gap-4 mb-8">
                      {[1, 2, 3, 4, 5].map(star => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`text-4xl transition-all ${newReview.rating >= star ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-white/10'}`}
                        >
                          Ã¢Ëœâ€¦
                        </motion.button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your technical observation..."
                      className="w-full p-8 bg-secondary/80 border border-white/10 rounded-[32px] outline-none focus:border-primary/50 font-bold min-h-[150px] mb-8 text-white placeholder:text-gray-600 transition-all"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    />
                    <PremiumButton onClick={handleAddReview} className="w-full md:w-auto px-12">Submit Feedback</PremiumButton>
                  </Card>
                )}

                <div className="grid grid-cols-1 gap-8">
                  {reviews.map((review, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      key={review.id}
                      className="glass-card p-8 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <MessageSquare className="w-24 h-24" />
                      </div>
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg">
                            {review.userName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-black text-xl text-white">{review.userName || 'Anonymous User'}</p>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString()}</p>  
                          </div>
                        </div>
                        <div className="flex gap-1 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400' : 'text-white/10'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-text-muted font-bold text-lg leading-relaxed opacity-80 italic relative z-10">" {review.comment} "</p>
                    </motion.div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-20 glass rounded-[40px] border border-dashed border-white/5">
                       <p className="text-2xl text-text-muted font-black italic tracking-tighter">SIGNAL SILENT: NO FEEDBACK LOGS DETECTED</p>
                       <p className="text-sm text-text-muted mt-2 uppercase tracking-widest font-bold">Initiate first community sync</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Tactical Actions */}
          <div className="space-y-12">
            <div className="sticky top-32">
              <Card className="p-10 !bg-secondary-dark !rounded-[48px] border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative z-10">
                  <h3 className="text-4xl font-black mb-10 tracking-tighter italic text-primary leading-none">Schedule <br />Synchronization</h3>
                  <form onSubmit={handleBooking} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">Mission Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                        <input
                          type="date"
                          className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 font-black text-white transition-all hover:bg-white/10 cursor-pointer"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] px-1">Mission Time</label>
                      <div className="relative">
                        <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                        <input
                          type="time"
                          className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 font-black text-white transition-all hover:bg-white/10 cursor-pointer"
                          value={visitTime}
                          onChange={(e) => setVisitTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <PremiumButton
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-6 !rounded-3xl text-xl shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.5)]"        
                    >
                      {bookingLoading ? 'Synchronizing...' : 'Initialize Mission'}
                    </PremiumButton>
                  </form>

                  <div className="mt-12 pt-12 border-t border-white/10 space-y-8">
                    <motion.div whileHover={{ x: 10 }} className="flex items-center gap-5 group cursor-pointer">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-transparent transition-all shadow-lg">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Voice Comms</p>
                        <p className="font-black text-lg text-white">{property.contactNumber || property.phone || '+1 800-NEST-FIND'}</p>
                      </div>
                    </motion.div>
                    <motion.div whileHover={{ x: 10 }} className="flex items-center gap-5 group cursor-pointer">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-transparent transition-all shadow-lg">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Signal Transmission</p>
                        <p className="font-black text-lg text-white truncate max-w-[180px]">{property.email || 'nexus@nestfinder.ai'}</p>
                      </div>
                    </motion.div>
                  </div>

                  <div className="mt-12 h-72 rounded-[40px] overflow-hidden grayscale contrast-150 border-4 border-white/5 relative group">
                    <div className="absolute inset-0 z-10 pointer-events-none border-[20px] border-secondary-dark/80 rounded-[40px] group-hover:opacity-0 transition-opacity" />
                    {lat && lng ? (
                      <MapContainer
                        center={[lat, lng]}
                        zoom={15}
                        style={{ height: "300px", width: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        <Marker position={[lat, lng]}>
                          <Popup>
                            {property.title} <br />
                            {property.address}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    ) : (
                      <p>Accurate location not available</p>
                    )}
                  </div>
                </div>
              </Card>

              <div className="mt-10">
                <ChatBot propertyId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal protocol */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[70] p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
              className="glass p-1 rounded-[48px] max-w-xl w-full"
            >
              <div className="bg-secondary-dark p-12 rounded-[47px] space-y-8">
                <div className="flex items-center gap-4 text-accent">
                   <Flag className="w-10 h-10" />
                   <h2 className="text-4xl font-black tracking-tighter uppercase italic">Anomaly Detected</h2>
                </div>
                <p className="text-text-muted font-bold text-lg opacity-80">Describe the protocol violation or data inaccuracy detected in this listing.</p>        
                <textarea
                  className="w-full bg-white/5 border border-white/10 p-8 rounded-[32px] h-48 outline-none focus:border-accent/50 font-black text-white placeholder:text-gray-700 transition-all shadow-inner"
                  placeholder="Input anomaly data here..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="flex gap-6">
                  <PremiumButton
                    variant="glass"
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 !py-5"
                  >
                    Abort
                  </PremiumButton>
                  <PremiumButton
                    onClick={handleReport}
                    className="flex-1 bg-accent hover:bg-accent/80 shadow-accent/20 !py-5"
                  >
                    Transmit Report
                  </PremiumButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
import { getPropertyDetails } from '../api/property';
import { scheduleVisit } from '../api/booking';
import { addToFavorites, removeFromFavorites, getMyFavorites } from '../api/favorite';
import { getReviews, addReview } from '../api/review';
import { reportProperty } from '../api/report';
import useAuthStore from '../store/authStore';
import L from 'leaflet';
import ChatBot from '../components/ChatBot';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Badge, Skeleton } from '../components/UIElements';
import { MapPin, Calendar, Clock, Phone, Mail, ShieldCheck, Flag, Star, ChevronLeft } from 'lucide-react';

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
  const [activeImage, setActiveImage] = useState(0);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchData();
    fetchReviews();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPropertyDetails(id);
      setProperty(data);
      
      if (isAuthenticated) {
        const favorites = await getMyFavorites();
        setIsFavorite(favorites.some(f => f.id === parseInt(id)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await getReviews(id);
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to schedule a visit');
    if (!visitDate || !visitTime) return toast.error('Please select date and time');

    setBookingLoading(true);
    try {
      await scheduleVisit({ propertyId: id, visitDate, visitTime });
      toast.success('Visit scheduled! Check your dashboard for updates.');
    } catch (err) {
      toast.error('Failed to schedule visit');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to add a review');
    try {
      await addReview({ propertyId: id, ...newReview });
      toast.success('Review added!');
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      toast.error('Failed to add review');
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) return toast.error('Please login to report');
    try {
      await reportProperty({ propertyId: id, reason: reportReason });
      toast.success('Report submitted. Thank you for keeping NestFinder safe.');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      toast.error('Failed to submit report');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return toast.error('Please login to save favorites');
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
        toast.info('Removed from favorites');
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
        toast.success('Added to favorites!');
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto p-12 space-y-8">
        <Skeleton className="h-[500px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );

  if (!property) return <div className="p-20 text-center text-2xl text-red-500">Property not found!</div>;

  const images = property.images ? JSON.parse(property.images) : [];
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];
  const neighborhood = property.neighborhood ? (typeof property.neighborhood === 'string' ? JSON.parse(property.neighborhood) : property.neighborhood) : {};

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center text-sm font-bold text-text-muted">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Home
            </Link>
            <span className="mx-3 opacity-30">/</span>
            <span className="capitalize">{property.category}</span>
            <span className="mx-3 opacity-30">/</span>
            <span className="text-secondary dark:text-white truncate max-w-[200px]">{property.title}</span>
          </div>
          <button 
            onClick={() => setShowReportModal(true)}
            className="text-red-500 text-sm font-black hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-xl transition flex items-center gap-2"
          >
            <Flag className="w-4 h-4" />
            Report Listing
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <motion.div 
                layoutId="main-image"
                className="h-[600px] rounded-[40px] overflow-hidden shadow-2xl relative border border-border"
              >
                <img 
                  src={images[activeImage] ? `http://localhost:5000${images[activeImage]}` : 'https://via.placeholder.com/1200x800'} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-8 left-8 flex flex-col gap-3">
                  <Badge variant={property.type === 'buy' ? 'success' : 'info'} className="text-sm px-4 py-2">
                    {property.type}
                  </Badge>
                  {property.isVerified && (
                    <Badge variant="info" className="text-sm px-4 py-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Verified Listing
                    </Badge>
                  )}
                </div>
              </motion.div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {images.map((img, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${activeImage === idx ? 'border-primary shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={`http://localhost:5000${img}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Core Info */}
            <section className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-5xl font-black text-secondary dark:text-white tracking-tight mb-4">{property.title}</h1>
                  <div className="flex items-center text-text-muted text-xl font-bold">
                    <MapPin className="text-primary mr-2 w-6 h-6" />
                    {property.locality}, {property.city}
                  </div>
                </div>
                <PremiumButton 
                  variant={isFavorite ? 'primary' : 'outline'}
                  onClick={handleFavorite}
                  className="!p-5 !rounded-3xl shadow-xl"
                >
                  <Star className={`w-8 h-8 ${isFavorite ? 'fill-white' : ''}`} />
                </PremiumButton>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Investment', value: `$${Number(property.price).toLocaleString()}`, color: 'text-primary' },
                  { label: 'Configuration', value: `${property.bhk} BHK` },
                  { label: 'Category', value: property.category, capitalize: true },
                  { label: 'Furnishing', value: property.furnishing, capitalize: true }
                ].map((item, i) => (
                  <div key={i} className="bg-card p-6 rounded-3xl border border-border text-center">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2">{item.label}</p>
                    <p className={`text-xl font-black ${item.color || 'text-secondary dark:text-white'} ${item.capitalize ? 'capitalize' : ''}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-2xl font-black mb-4">Description</h3>
                <p className="text-text-muted text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {property.description}
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-black">Premium Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map(item => (
                    <div key={item} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl font-bold text-text-main">
                      <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Neighborhood */}
              <div className="space-y-8 pt-8 border-t border-border">
                <h3 className="text-2xl font-black">Neighborhood Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { title: 'Education', icon: '🏫', list: neighborhood.schools || ["Elite Public School", "Central University"], color: 'blue' },
                    { title: 'Healthcare', icon: '🏥', list: neighborhood.hospitals || ["Apollo Hospital", "City Care Clinic"], color: 'red' },
                    { title: 'Connectivity', icon: '🚆', list: neighborhood.transport || ["Metro Station", "Highway Access"], color: 'green' },
                    { title: 'Lifestyle', icon: '🛒', list: neighborhood.markets || ["Premium Mall", "Organic Market"], color: 'orange' }
                  ].map((cat, i) => (
                    <div key={i} className="bg-card p-6 rounded-3xl border border-border flex gap-4">
                      <div className="text-4xl">{cat.icon}</div>
                      <div>
                        <h4 className="font-black text-lg mb-2">{cat.title}</h4>
                        <ul className="space-y-1">
                          {cat.list.map((item, j) => (
                            <li key={j} className="text-sm font-bold text-text-muted">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="space-y-8 pt-8 border-t border-border">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black">Community Feedback</h3>
                  <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-600 px-4 py-2 rounded-full font-black">
                    <Star className="w-5 h-5 fill-yellow-600" />
                    {reviews.length > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 'New'}
                  </div>
                </div>

                {isAuthenticated && (
                  <Card className="p-8 border-dashed border-2">
                    <h4 className="font-black mb-4 uppercase text-xs tracking-widest text-text-muted">Rate this property</h4>
                    <div className="flex gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className={`text-3xl transition-transform hover:scale-125 ${newReview.rating >= star ? 'text-yellow-500' : 'text-border'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your detailed experience..."
                      className="w-full p-6 bg-background border border-border rounded-3xl outline-none focus:border-primary font-bold min-h-[120px] mb-6"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    />
                    <PremiumButton onClick={handleAddReview}>Submit Review</PremiumButton>
                  </Card>
                )}

                <div className="space-y-6">
                  {reviews.map(review => (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      key={review.id} 
                      className="bg-card p-6 rounded-3xl border border-border"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl">
                            {review.userName?.[0]}
                          </div>
                          <div>
                            <p className="font-black">{review.userName}</p>
                            <p className="text-xs text-text-muted font-bold">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-500' : 'text-border'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-text-muted font-medium leading-relaxed">{review.comment}</p>
                    </motion.div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-center py-10 text-text-muted font-bold italic">No reviews yet. Be the first to share your thoughts!</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-8">
            <div className="sticky top-24">
              <Card className="p-8 bg-secondary text-white border-none shadow-2xl">
                <h3 className="text-3xl font-black mb-8 tracking-tight italic text-primary">Secure Your Visit</h3>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Preferred Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="date" 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary font-bold text-white transition-colors"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Preferred Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input 
                        type="time" 
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary font-bold text-white transition-colors"
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <PremiumButton 
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-5 !rounded-2xl text-xl"
                  >
                    {bookingLoading ? 'Requesting...' : 'Book Private Tour'}
                  </PremiumButton>
                </form>

                <div className="mt-10 pt-10 border-t border-white/10 space-y-6">
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase">Call Agent</p>
                      <p className="font-bold">{property.phone || '+1 800-NEST-FIND'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-500 uppercase">Email Support</p>
                      <p className="font-bold">{property.email || 'concierge@nestfinder.com'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 h-64 rounded-3xl overflow-hidden grayscale contrast-125 border border-white/10">
                  <MapContainer center={[property.latitude || 20.5937, property.longitude || 78.9629]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[property.latitude || 20.5937, property.longitude || 78.9629]}>
                      <Popup>{property.title}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </Card>

              <div className="mt-8">
                <ChatBot propertyId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-border"
            >
              <h2 className="text-3xl font-black mb-4 tracking-tight">Report Listing</h2>
              <p className="text-text-muted font-medium mb-8">We take safety seriously. Please describe the issue with this listing.</p>
              <textarea
                className="w-full bg-background border border-border p-6 rounded-3xl h-40 mb-8 outline-none focus:border-primary font-bold"
                placeholder="Reason for report (e.g. fraud, incorrect info)..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <div className="flex gap-4">
                <PremiumButton 
                  variant="outline" 
                  onClick={() => setShowReportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </PremiumButton>
                <PremiumButton 
                  onClick={handleReport}
                  className="flex-1 bg-red-500 hover:bg-red-600 shadow-red-500/20"
                >
                  Submit
                </PremiumButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

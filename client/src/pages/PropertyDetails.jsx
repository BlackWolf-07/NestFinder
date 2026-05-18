import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getPropertyDetails } from '../api/property';
import { scheduleVisit } from '../api/booking';
import { addToFavorites, removeFromFavorites, getMyFavorites } from '../api/favorite';
import useAuthStore from '../store/authStore';
import L from 'leaflet';
import ChatBot from '../components/ChatBot';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('Please login to schedule a visit');
    if (!visitDate || !visitTime) return alert('Please select date and time');

    setBookingLoading(true);
    try {
      await scheduleVisit({ propertyId: id, visitDate, visitTime });
      alert('Visit scheduled successfully! Check your dashboard for updates.');
    } catch (err) {
      alert('Failed to schedule visit');
    } finally {
      setBookingLoading(false);
    }
  };
...
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
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

  const handleFavorite = async () => {
    if (!isAuthenticated) return alert('Please login to save favorites');
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
        setIsFavorite(false);
      } else {
        await addToFavorites(id);
        setIsFavorite(true);
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  if (loading) return <div className="p-20 text-center text-2xl">Loading property details...</div>;
  if (!property) return <div className="p-20 text-center text-2xl text-red-500">Property not found!</div>;

  const images = property.images ? JSON.parse(property.images) : [];
  const amenities = property.amenities ? JSON.parse(property.amenities) : [];

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <span className="capitalize">{property.category}</span>
          <span className="mx-2">/</span>
          <span className="font-semibold text-secondary truncate">{property.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="h-[500px] rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={images[activeImage] ? `http://localhost:5000${images[activeImage]}` : 'https://via.placeholder.com/800x600'} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={`http://localhost:5000${img}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description and Info */}
            <div className="bg-gray-50 p-8 rounded-2xl border">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-secondary mb-2">{property.title}</h1>
                  <p className="text-gray-600 text-lg">{property.locality}, {property.city}</p>
                </div>
                <button 
                  onClick={handleFavorite}
                  className={`p-4 rounded-full shadow-md transition ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-200">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Price</p>
                  <p className="text-2xl font-bold text-primary">${property.price}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Bedrooms</p>
                  <p className="text-2xl font-bold text-secondary">{property.bhk} BHK</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Category</p>
                  <p className="text-2xl font-bold text-secondary capitalize">{property.category}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Furnishing</p>
                  <p className="text-2xl font-bold text-secondary capitalize">{property.furnishing}</p>
                </div>
              </div>

              <div className="py-8">
                <h3 className="text-xl font-bold mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>

              <div className="py-8 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-6">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map(item => (
                    <div key={item} className="flex items-center space-x-3 text-gray-700 bg-white p-3 rounded-lg border">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact and Map */}
          <div className="space-y-8">
            <div className="bg-secondary text-white p-8 rounded-2xl shadow-xl sticky top-8">
              <h3 className="text-2xl font-bold mb-6">Interested?</h3>
              <form onSubmit={handleBooking} className="space-y-4 mb-8 text-secondary">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preferred Date</label>
                  <input 
                    type="date" 
                    className="w-full p-3 rounded-xl bg-white outline-none"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preferred Time</label>
                  <input 
                    type="time" 
                    className="w-full p-3 rounded-xl bg-white outline-none"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-primary py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition disabled:bg-blue-300"
                >
                  {bookingLoading ? 'Scheduling...' : 'Book a Visit'}
                </button>
              </form>
              ...
              <div className="mt-12 h-64 rounded-xl overflow-hidden border-2 border-white/10 grayscale">
                <MapContainer center={[property.latitude || 20.5937, property.longitude || 78.9629]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[property.latitude || 20.5937, property.longitude || 78.9629]}>
                    <Popup>{property.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p className="mt-4 text-center text-sm text-gray-400">Map view of exact locality</p>
            </div>

            {/* AI Chatbot Section */}
            <div className="sticky top-[450px] mt-8">
              <ChatBot propertyId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

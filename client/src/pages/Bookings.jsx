import { useState, useEffect } from 'react';
import { getMyBookings, updateBookingStatus } from '../api/booking';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Badge, Skeleton } from '../components/UIElements';
import useAuthStore from '../store/authStore';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getMyBookings();
      // The API now returns { success: true, bookings: [] }
      const data = response.success ? response.bookings : (Array.isArray(response) ? response : []);
      setBookings(data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${status} successfully`);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Scheduled Tours</h1>
          <p className="text-text-muted font-medium mt-2">Manage your property visits and tour requests.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-40 bg-card rounded-[40px] border-2 border-dashed border-border"
          >
            <div className="text-7xl mb-6 text-gray-300">ðŸ“…</div>
            <h3 className="text-2xl font-black mb-2">No Scheduled Tours</h3>
            <p className="text-text-muted max-w-sm mx-auto">Your upcoming property visits will appear here once you've requested a tour.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-8 flex flex-col md:flex-row items-center gap-8 group">
                  {/* Property Preview */}
                  <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-border">
                    <img
                      src={booking.propertyImage ? `http://localhost:5000${booking.propertyImage}` : 'https://via.placeholder.com/200x150'}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{booking.propertyTitle}</h3>
                        <p className="text-text-muted font-bold flex items-center text-sm mt-1">
                          <MapPin className="w-4 h-4 mr-1 text-primary" /> {booking.locality}, {booking.city}
                        </p>
                      </div>
                      <Badge variant={
                        booking.status === 'approved' ? 'success' :
                        booking.status === 'rejected' ? 'error' : 'warning'
                      }>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-6 items-center pt-2">
                      <div className="flex items-center gap-2 text-text-main font-black">
                        <Calendar className="w-5 h-5 text-primary" />
                        {new Date(booking.visitDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-text-main font-black">
                        <Clock className="w-5 h-5 text-primary" />
                        {booking.visitTime}
                      </div>
                      <div className="text-text-muted text-sm font-bold border-l border-border pl-6">
                        Contact: {booking.buyerName || booking.ownerName}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Owner */}
                  {user && user.role === 'owner' && booking.status === 'pending' && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                        className="p-4 bg-green-500/10 text-green-600 rounded-2xl hover:bg-green-500 hover:text-white transition-all"
                        title="Approve Tour"
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                        className="p-4 bg-red-500/10 text-red-600 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                        title="Reject Tour"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

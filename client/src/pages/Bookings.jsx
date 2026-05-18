import { useState, useEffect } from 'react';
import { getMyBookings, updateBookingStatus, downloadAgreement } from '../api/booking';
import useAuthStore from '../store/authStore';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDownload = async (id) => {
    try {
      await downloadAgreement(id);
    } catch (err) {
      alert('Download failed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-4xl font-extrabold text-secondary mb-10">
        {user.role === 'owner' ? 'Manage Visits' : 'My Scheduled Visits'}
      </h1>

      {loading ? (
        <div className="text-center py-20 text-xl text-gray-400">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
          <p className="text-gray-500 text-lg">No visits scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white p-6 rounded-3xl shadow-sm border flex flex-col md:flex-row justify-between items-center hover:shadow-md transition">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status}
                  </span>
                  <h3 className="text-xl font-bold text-secondary">{booking.title}</h3>
                </div>
                <p className="text-gray-500 mb-2">
                  📍 {booking.locality}, {booking.city}
                </p>
                <p className="text-secondary font-semibold">
                  📅 {new Date(booking.visitDate).toLocaleDateString()} at {booking.visitTime}
                </p>
                {user.role === 'owner' && (
                  <p className="mt-2 text-sm text-primary font-bold">
                    User: {booking.userName} ({booking.userPhone})
                  </p>
                )}
              </div>

              <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
                {user.role === 'owner' && booking.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      className="bg-green-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 transition"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="bg-red-50 text-red-600 px-6 py-2 rounded-xl font-bold hover:bg-red-100 transition"
                    >
                      Decline
                    </button>
                  </>
                )}
                
                {booking.status === 'confirmed' && (
                  <button 
                    onClick={() => handleDownload(booking.id)}
                    className="bg-secondary text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Rental Agreement
                  </button>
                )}

                {user.role === 'buyer' && booking.status === 'confirmed' && (
                  <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 transition">
                    Pay Deposit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

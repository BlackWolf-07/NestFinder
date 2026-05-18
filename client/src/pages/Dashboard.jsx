import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyProperties, deleteProperty } from '../api/property';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Badge, Skeleton } from '../components/UIElements';
import { Plus, Trash2, Edit3, ExternalLink, LayoutGrid, Heart, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role === 'owner' || user.role === 'admin') {
      fetchMyProperties();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMyProperties = async () => {
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('This action cannot be undone. Delete this listing?')) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter(p => p.id !== id));
        toast.success('Listing deleted successfully');
      } catch (err) {
        toast.error('Failed to delete property');
      }
    }
  };

  const OwnerDashboard = () => (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Management Console</h1>
          <p className="text-text-muted font-medium mt-2">Oversee your property portfolio and performance.</p>
        </div>
        <PremiumButton onClick={() => navigate('/add-property')} className="flex items-center gap-2 !px-8">
          <Plus className="w-5 h-5" /> List New Property
        </PremiumButton>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80" />)}
        </div>
      ) : properties.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 bg-card rounded-[40px] border-2 border-dashed border-border"
        >
          <div className="text-7xl mb-6">🏘️</div>
          <h3 className="text-2xl font-black mb-2">No Properties Yet</h3>
          <p className="text-text-muted mb-8 max-w-sm mx-auto">Start your journey as a host by listing your first premium property.</p>
          <PremiumButton variant="outline" onClick={() => navigate('/add-property')}>
            Add First Listing
          </PremiumButton>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, idx) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group h-full flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={property.images && JSON.parse(property.images)[0] ? `http://localhost:5000${JSON.parse(property.images)[0]}` : 'https://via.placeholder.com/400x300'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant={property.status === 'available' ? 'success' : 'info'}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-xl truncate mb-1">{property.title}</h3>
                      <p className="text-primary font-black text-lg">${Number(property.price).toLocaleString()}</p>
                    </div>
                    <Badge variant={
                      property.approvalStatus === 'approved' ? 'success' : 
                      property.approvalStatus === 'rejected' ? 'error' : 'warning'
                    }>
                      {property.approvalStatus || 'pending'}
                    </Badge>
                  </div>
                  
                  <div className="mt-auto pt-6 flex gap-2 border-t border-border">
                    <Link 
                      to={`/properties/${property.id}`}
                      className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all group"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                    <button 
                      className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-secondary hover:text-white transition-all"
                      title="Edit Details"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(property.id)}
                      className="flex-1 p-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      title="Delete Property"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const BuyerDashboard = () => (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Hi, {user.name.split(' ')[0]}!</h1>
          <p className="text-text-muted font-medium mt-2">Manage your journey to finding the perfect home.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 text-center space-y-4 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[20px] flex items-center justify-center mx-auto">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black">Explore All</h3>
          <p className="text-sm text-text-muted font-medium">Browse our full collection of verified premium nests.</p>
        </Card>

        <Card className="p-8 text-center space-y-4 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-16 h-16 bg-pink-500/10 text-pink-500 rounded-[20px] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black">My Favorites</h3>
          <p className="text-sm text-text-muted font-medium">Quickly access the properties you've fallen in love with.</p>
        </Card>

        <Card className="p-8 text-center space-y-4 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate('/bookings')}>
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-[20px] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black">Scheduled Visits</h3>
          <p className="text-sm text-text-muted font-medium">Keep track of your upcoming property tours and visits.</p>
        </Card>
      </div>

      <section className="pt-10">
        <div className="bg-secondary rounded-[40px] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 italic text-primary">Need Professional Help?</h2>
            <p className="text-gray-400 max-w-lg mb-8 text-lg font-medium leading-relaxed">
              Our AI discovery engine is ready to curate a personalized list of properties just for you. No more endless scrolling.
            </p>
            <PremiumButton onClick={() => navigate('/onboarding')}>
              Start AI Onboarding
            </PremiumButton>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16">
        {user.role === 'buyer' ? <BuyerDashboard /> : <OwnerDashboard />}
      </div>
    </div>
  );
}

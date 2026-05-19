import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyProperties, deleteProperty } from '../api/property';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Badge, Skeleton } from '../components/UIElements';
import { Plus, Trash2, Edit3, ExternalLink, LayoutGrid, Heart, Calendar, Settings, Zap, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (user.role === 'owner' || user.role === 'admin')) {
      fetchMyProperties();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyProperties = async () => {
    try {
      const response = await getMyProperties();
      // The API now returns { success: true, properties: [] }
      const data = response.success ? response.properties : (Array.isArray(response) ? response : []);
      setProperties(data);
    } catch (err) {
      console.error(err);
      toast.error('Data retrieval failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('IRREVERSIBLE ACTION: Purge this listing from the network?')) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter(p => p.id !== id));
        toast.success('Listing Purged Successfully.');
      } catch (err) {
        toast.error('Purge failure.');
      }
    }
  };

  if (!user) return <div className="bg-background min-h-screen flex items-center justify-center text-white font-black italic">SYNCHRONIZING PROFILE...</div>;

  const OwnerDashboard = () => (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Badge variant="info">Management Mode</Badge>
          <h1 className="text-5xl font-black tracking-tighter text-white mt-4">Command <span className="text-gradient">Console</span></h1>
          <p className="text-text-muted font-medium mt-2">Orchestrate your property portfolio and network status.</p>
        </motion.div>
        <PremiumButton onClick={() => navigate('/host/add-property')} className="flex items-center gap-3 !px-10 !py-5 shadow-[0_0_30px_rgba(99,102,241,0.3)]">      
          <Plus className="w-6 h-6" /> Initialize New Listing
        </PremiumButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { label: 'Network Reach', value: '1.2M', icon: <TrendingUp className="text-green-400" /> },
           { label: 'Active Listings', value: properties.length, icon: <LayoutGrid className="text-primary" /> },
           { label: 'Security Score', value: '98%', icon: <Shield className="text-blue-400" /> }
         ].map((s, i) => (
           <Card key={i} className="p-8 group hover:border-primary/50 transition-all">
             <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{s.label}</p>
                  <p className="text-4xl font-black text-white">{s.value}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{s.icon}</div>
             </div>
           </Card>
         ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96 rounded-[40px]" />)}
        </div>
      ) : properties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-40 glass rounded-[48px] border-2 border-dashed border-white/5"
        >
          <div className="text-8xl mb-8 animate-float">Ã°Å¸â€ºÂ°Ã¯Â¸</div>
          <h3 className="text-3xl font-black mb-4">Network Empty</h3>
          <p className="text-text-muted mb-10 max-w-sm mx-auto text-lg">Your sector currently has zero active property links.</p>
          <PremiumButton variant="outline" onClick={() => navigate('/host/add-property')}>
            Add First Link
          </PremiumButton>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {properties.map((property, idx) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group h-full flex flex-col relative overflow-hidden">
                <div className="relative h-56 overflow-hidden m-2 rounded-[32px]">
                  <img
                    src={(property.images && (typeof property.images === 'string' ? JSON.parse(property.images) : property.images)[0]) ? `http://localhost:5000${(typeof property.images === 'string' ? JSON.parse(property.images) : property.images)[0]}` : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600'}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant={property.status === 'available' ? 'success' : 'info'}>
                      {property.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-black text-2xl truncate mb-2 group-hover:text-primary transition-colors">{property.title}</h3>
                      <p className="text-gradient font-black text-2xl tracking-tighter">${Number(property.price).toLocaleString()}</p>
                    </div>
                    <Badge variant={
                      property.approvalStatus === 'approved' ? 'success' :
                      property.approvalStatus === 'rejected' ? 'error' : 'warning'
                    }>
                      {property.approvalStatus || 'pending'}
                    </Badge>
                  </div>

                  <div className="mt-auto pt-8 flex gap-3 border-t border-white/5">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 p-4 glass-light rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"    
                      title="Access Public View"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                    <button
                      className="flex-1 p-4 glass-light rounded-2xl flex items-center justify-center hover:bg-secondary-light hover:text-white transition-all"      
                      title="Modify Matrix"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex-1 p-4 bg-accent/10 text-accent rounded-2xl flex items-center justify-center hover:bg-accent hover:text-white transition-all"  
                      title="Purge Link"
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
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge variant="info">User Profile Integrated</Badge>
          <h1 className="text-6xl font-black tracking-tighter text-white mt-6">Welcome, <span className="text-gradient">{user.name.split(' ')[0]}</span></h1>       
          <p className="text-text-muted font-medium mt-4 text-xl">Operational sector active. Your journey to a premium nest continues.</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} className="glass-light p-4 rounded-3xl border-primary/20 flex items-center gap-4">
           <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-6 h-6 text-white" />
           </div>
           <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">AI Status</p>
              <p className="text-sm font-black text-white">Synchronized</p>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <Card className="p-10 text-center space-y-6 group hover:border-primary transition-all cursor-pointer relative overflow-hidden" onClick={() => navigate('/')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-all" />
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mx-auto border border-primary/20 group-hover:scale-110 transition-transform">
            <LayoutGrid className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black">Universal Explore</h3>
          <p className="text-sm text-text-muted font-bold leading-relaxed">Access the entire matrix of verified premium listings across all sectors.</p>
        </Card>

        <Card className="p-10 text-center space-y-6 group hover:border-accent transition-all cursor-pointer relative overflow-hidden" onClick={() => navigate('/dashboard')}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-accent/20 transition-all" />
          <div className="w-20 h-20 bg-accent/10 text-accent rounded-[28px] flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black">Secured Links</h3>
          <p className="text-sm text-text-muted font-bold leading-relaxed">Instantly access the property signatures you've archived for review.</p>
        </Card>

        <Card className="p-10 text-center space-y-6 group hover:border-blue-400 transition-all cursor-pointer relative overflow-hidden" onClick={() => navigate('/bookings')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-400/20 transition-all" />
          <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-[28px] flex items-center justify-center mx-auto border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black">Mission Schedule</h3>
          <p className="text-sm text-text-muted font-bold leading-relaxed">Track your scheduled tactical site visits and synchronization meetings.</p>
        </Card>
      </div>

      <section className="pt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-futuristic rounded-[56px] p-16 text-white relative overflow-hidden border border-white/5"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -mr-64 -mt-64" />
          <div className="relative z-10">
            <Badge variant="glass" className="mb-6">AI Discovery Engine v4.2</Badge>
            <h2 className="text-5xl font-black mb-6 tracking-tighter leading-none">Need Tactical <br />Assistance?</h2>
            <p className="text-text-muted max-w-xl mb-12 text-xl font-medium leading-[1.6]">
              Our neural network is optimized to curate a personalized list of nests based on your behavioral patterns and aesthetic preferences.
            </p>
            <PremiumButton onClick={() => navigate('/onboarding')} className="shadow-[0_0_40px_rgba(99,102,241,0.4)] px-12 py-6 text-xl">
              Launch Neural Onboarding
            </PremiumButton>
          </div>
        </motion.div>
      </section>
    </div>
  );

  return (
    <div className="bg-background min-h-screen text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-24 pt-32 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={user.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {user.role === 'buyer' ? <BuyerDashboard /> : <OwnerDashboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

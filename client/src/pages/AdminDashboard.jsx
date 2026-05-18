import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminStats, getPendingProperties, approveProperty, verifyProperty, getAllReports, resolveReport } from '../api/admin';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Badge, Skeleton } from '../components/UIElements';
import { Users, Home, ClipboardList, AlertCircle, CheckCircle, XCircle, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, p, r] = await Promise.all([
        getAdminStats(),
        getPendingProperties(),
        getAllReports()
      ]);
      setStats(s.data);
      setPendingProperties(p.data);
      setReports(r.data);
    } catch (err) {
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await approveProperty(id, status);
      toast.success(`Property ${status} successfully`);
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleVerify = async (id, current) => {
    try {
      await verifyProperty(id, !current);
      toast.success(current ? 'Verification removed' : 'Property verified!');
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleResolveReport = async (id) => {
    try {
      await resolveReport(id);
      toast.success('Report marked as resolved');
      fetchData();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className={`p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-black text-text-muted uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black">{value || 0}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-slate-800`}>
          <Icon className="w-6 h-6 text-secondary dark:text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-secondary dark:text-white">Admin Central</h1>
            <p className="text-text-muted font-medium mt-2">Manage the NestFinder ecosystem and maintain trust.</p>
          </div>
          <PremiumButton variant="outline" onClick={fetchData} className="!px-4 !py-2 text-sm">
            Refresh Data
          </PremiumButton>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <StatCard title="Total Users" value={stats?.users} icon={Users} color="border-blue-500" />
              <StatCard title="Properties" value={stats?.properties} icon={Home} color="border-green-500" />
              <StatCard title="Pending" value={stats?.pendingApprovals} icon={ClipboardList} color="border-yellow-500" />
              <StatCard title="Reports" value={stats?.activeReports} icon={AlertCircle} color="border-red-500" />
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-card p-1 rounded-2xl border border-border w-fit">
          <button 
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'properties' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-text-muted'}`}
          >
            Pending Listings
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'reports' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-text-muted'}`}
          >
            Active Reports
          </button>
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card rounded-3xl border border-border overflow-hidden"
          >
            {activeTab === 'properties' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50 dark:bg-slate-800/50">
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Property</th>
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Location</th>
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Price</th>
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProperties.map(p => (
                      <tr key={p.id} className="border-b border-border hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-6">
                          <p className="font-black text-secondary dark:text-white">{p.title}</p>
                          <p className="text-xs text-text-muted font-bold">{p.category}</p>
                        </td>
                        <td className="p-6 text-sm font-bold text-text-muted">{p.locality}, {p.city}</td>
                        <td className="p-6 text-primary font-black">${Number(p.price).toLocaleString()}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleApprove(p.id, 'approved')} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition" title="Approve">
                              <CheckCircle className="w-6 h-6" />
                            </button>
                            <button onClick={() => handleApprove(p.id, 'rejected')} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition" title="Reject">
                              <XCircle className="w-6 h-6" />
                            </button>
                            <button onClick={() => handleVerify(p.id, p.isVerified)} className={`p-2 rounded-xl transition ${p.isVerified ? 'text-primary bg-primary/10' : 'text-text-muted hover:bg-gray-100 dark:hover:bg-slate-800'}`} title="Verify">
                              <Shield className="w-6 h-6" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingProperties.length === 0 && (
                      <tr><td colSpan="4" className="p-20 text-center text-text-muted font-bold">All caught up! No pending properties.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50 dark:bg-slate-800/50">
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Target</th>
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Reporter</th>
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Reason</th>
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Status</th>
                      <th className="p-6 text-xs font-black text-text-muted uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(r => (
                      <tr key={r.id} className="border-b border-border hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-6 font-black text-secondary dark:text-white">{r.propertyTitle}</td>
                        <td className="p-6 text-sm font-bold text-text-muted">{r.userName}</td>
                        <td className="p-6 text-sm italic text-red-500 font-medium">"{r.reason}"</td>
                        <td className="p-6">
                          <Badge variant={r.status === 'pending' ? 'warning' : 'success'}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="p-6">
                          {r.status === 'pending' && (
                            <PremiumButton onClick={() => handleResolveReport(r.id)} className="!py-2 !px-4 text-xs">
                              Resolve
                            </PremiumButton>
                          )}
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr><td colSpan="5" className="p-20 text-center text-text-muted font-bold">Excellent! No active reports.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

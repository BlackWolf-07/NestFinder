import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { loginUser } from '../api/auth';
import useAuthStore from '../store/authStore';
import { Card, PremiumButton, FuturisticInput, Badge } from '../components/UIElements';
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      setAuth(res.user, res.token);
      toast.success('Access Granted. Welcome back, ' + res.user.name);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failure. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white overflow-hidden relative">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <div className="flex items-center justify-center p-6 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl"
        >
          <Card className="p-12 !rounded-[40px] border-white/10 relative overflow-hidden group">
            {/* Corner Accent */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rotate-45 group-hover:bg-primary/40 transition-all duration-700" />
            
            <div className="text-center mb-12">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border-primary/20 mb-6"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light">Secure Access Point</span>
              </motion.div>
              <h2 className="text-5xl font-black tracking-tighter mb-4">Initialize <br /><span className="text-gradient">Session</span></h2>
              <p className="text-text-muted font-medium">Enter your credentials to access the NestFinder network.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <FuturisticInput
                label="Identity (Email)"
                icon={Mail}
                placeholder="you@domain.com"
                {...register('email')}
              />
              {errors.email && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-accent text-xs font-black px-1 uppercase tracking-wider">
                  {errors.email.message}
                </motion.p>
              )}

              <FuturisticInput
                label="Security Key (Password)"
                icon={Lock}
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                {...register('password')}
              />
              {errors.password && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-accent text-xs font-black px-1 uppercase tracking-wider">
                  {errors.password.message}
                </motion.p>
              )}

              <div className="pt-4">
                <PremiumButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 !rounded-2xl flex items-center justify-center gap-3 text-lg group"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </div>
                  ) : (
                    <>
                      Authorize Access <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </PremiumButton>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-text-muted font-bold text-sm">
                New Entity? <Link to="/register" className="text-primary hover:text-primary-light transition-colors underline decoration-primary/30 underline-offset-8">Create New Profile</Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

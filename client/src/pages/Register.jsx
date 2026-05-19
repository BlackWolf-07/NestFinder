import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { registerUser } from '../api/auth';
import useAuthStore from '../store/authStore';
import { Card, PremiumButton, FuturisticInput } from '../components/UIElements';
import { User, Mail, Lock, Phone, ArrowRight, ShieldPlus } from 'lucide-react';
import Navbar from '../components/Navbar';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'owner']),
});

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'buyer' }
  });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      setAuth(res.user, res.token);
      toast.success('Profile Synthesized. Welcome to the network, ' + res.user.name);
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Network rejection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white overflow-hidden relative">
      <Navbar />
      
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/3 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      <div className="flex items-center justify-center p-6 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-12 !rounded-[48px] border-white/10 relative overflow-hidden">
            <div className="text-center mb-12">
               <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border-primary/20 mb-6"
              >
                <ShieldPlus className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light">New Entity Registration</span>
              </motion.div>
              <h2 className="text-5xl font-black tracking-tighter mb-4">Create <br /><span className="text-gradient">Universal Profile</span></h2>
              <p className="text-text-muted font-medium">Synchronize with the NestFinder ecosystem.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FuturisticInput label="Full Name" icon={User} placeholder="Enter your alias" {...register('name')} />
                <FuturisticInput label="Identity (Email)" icon={Mail} placeholder="you@domain.com" {...register('email')} />
                <FuturisticInput label="Communication (Phone)" icon={Phone} placeholder="+1 (000) 000-0000" {...register('phone')} />
                <FuturisticInput label="Security Key" icon={Lock} type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" {...register('password')} />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1">Network Role</label>
                <div className="grid grid-cols-2 gap-4">
                  {['buyer', 'owner'].map((role) => (
                    <label key={role} className="relative group cursor-pointer">
                      <input 
                        type="radio" 
                        {...register('role')} 
                        value={role} 
                        className="peer hidden" 
                      />
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 peer-checked:border-primary peer-checked:bg-primary/10 transition-all text-center group-hover:bg-white/10">
                        <span className="text-sm font-black uppercase tracking-widest text-text-muted peer-checked:text-primary">{role}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <PremiumButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 !rounded-3xl flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? 'Synthesizing...' : (
                    <>
                      Initialize Onboarding <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </PremiumButton>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-text-muted font-bold text-sm">
                Already Authenticated? <Link to="/login" className="text-primary hover:text-primary-light transition-colors underline decoration-primary/30 underline-offset-8">Resume Session</Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

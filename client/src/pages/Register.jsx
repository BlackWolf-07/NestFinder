import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { registerUser } from '../api/auth';
import useAuthStore from '../store/authStore';
import { Card, PremiumButton } from '../components/UIElements';
import { User, Mail, Lock, Phone, ArrowRight, Home } from 'lucide-react';
import Navbar from '../components/Navbar';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'owner']),
});

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'buyer' }
  });
  const [loading, setLoading] = useState(false); const selectedRole = watch('role');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data);
      setAuth(res.user, res.token);
      toast.success('Account created! Welcome to NestFinder, ' + res.user.name);
      navigate('/onboarding');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center p-6 py-20">
        <Card className="w-full max-w-lg p-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black tracking-tight mb-2">Create Account</h2>
            <p className="text-text-muted font-medium">Join our premium real estate network</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-text-muted uppercase px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    {...register('name')}
                    className={`w-full pl-12 pr-4 py-3 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold ${errors.name ? 'border-red-500' : 'border-border focus:border-primary'}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs font-bold px-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-text-muted uppercase px-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    {...register('phone')}
                    className={`w-full pl-12 pr-4 py-3 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold ${errors.phone ? 'border-red-500' : 'border-border focus:border-primary'}`}
                    placeholder="1234567890"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs font-bold px-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-text-muted uppercase px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-12 pr-4 py-3 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold ${errors.email ? 'border-red-500' : 'border-border focus:border-primary'}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold px-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-text-muted uppercase px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full pl-12 pr-4 py-3 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold ${errors.password ? 'border-red-500' : 'border-border focus:border-primary'}`}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold px-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-text-muted uppercase px-1">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${selectedRole === 'buyer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-gray-50'}`}>
                  <input {...register('role')} type="radio" value="buyer" className="hidden" />
                  <User className={`w-6 h-6 ${selectedRole === 'buyer' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className="font-bold">Buyer</span>
                </label>
                <label className={`cursor-pointer border-2 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${selectedRole === 'owner' ? 'border-primary bg-primary/5' : 'border-border hover:bg-gray-50'}`}>
                  <input {...register('role')} type="radio" value="owner" className="hidden" />
                  <Home className={`w-6 h-6 ${selectedRole === 'owner' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className="font-bold">Owner</span>
                </label>
              </div>
            </div>

            <PremiumButton
              type="submit"
              disabled={loading}
              className="w-full py-4 !rounded-2xl flex items-center justify-center gap-2 text-lg"
            >
              {loading ? 'Creating Account...' : (
                <>
                  Register Now <ArrowRight className="w-5 h-5" />
                </>
              )}
            </PremiumButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-muted font-bold">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

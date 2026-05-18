import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { loginUser } from '../api/auth';
import useAuthStore from '../store/authStore';
import { Card, PremiumButton } from '../components/UIElements';
import { Mail, Lock, ArrowRight } from 'lucide-react';
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
      toast.success('Welcome back, ' + res.user.name + '!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center p-6 pt-20">
        <Card className="w-full max-w-md p-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h2>
            <p className="text-text-muted font-medium">Log in to your NestFinder account</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-text-muted uppercase px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-12 pr-4 py-4 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold ${errors.email ? 'border-red-500' : 'border-border focus:border-primary'}`}
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
                  className={`w-full pl-12 pr-4 py-4 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold ${errors.password ? 'border-red-500' : 'border-border focus:border-primary'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold px-1">{errors.password.message}</p>}
            </div>

            <PremiumButton
              type="submit"
              disabled={loading}
              className="w-full py-4 !rounded-2xl flex items-center justify-center gap-2 text-lg"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Login <ArrowRight className="w-5 h-5" />
                </>
              )}
            </PremiumButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-text-muted font-bold">
              New here? <Link to="/register" className="text-primary hover:underline">Create an account</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

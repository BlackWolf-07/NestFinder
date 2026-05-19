import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { loginUser, sendOtp, verifyOtp } from '../api/auth';
import useAuthStore from '../store/authStore';
import { Card, PremiumButton, FuturisticInput } from '../components/UIElements';
import { Mail, Lock, ArrowRight, ShieldCheck, Phone, Smartphone } from 'lucide-react';
import Navbar from '../components/Navbar';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('email'); // 'email' or 'phone'
  const [otpStep, setOtpStep] = useState(1); // 1: phone input, 2: otp input
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  // Handle Google Callback
  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    if (token && userStr) {
      const user = JSON.parse(decodeURIComponent(userStr));
      setAuth(user, token);
      toast.success('Google Access Granted. Welcome, ' + user.name);
      navigate('/dashboard');
    }
  }, [searchParams, setAuth, navigate]);

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

  const handleSendOtp = async () => {
    // Basic validation: ensure it's at least 10 digits
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return toast.error('Enter a valid 10-digit phone number');
    }

    setLoading(true);
    try {
      const res = await sendOtp(phone);
      toast.success(res.devNote || 'Access code transmitted. Check your device.');
      // For development, we show where to find the code
      if (res.devNote) {
        toast.info('DEVELOPER MODE: ' + res.devNote, { duration: 8000 });
      }
      setOtpStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP');
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      setAuth(res.user, res.token);
      toast.success('Phone Verified. Welcome back, ' + res.user.name);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-background text-white overflow-hidden relative">
      <Navbar />
      
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
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rotate-45 group-hover:bg-primary/40 transition-all duration-700" />
            
            <div className="text-center mb-10">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border-primary/20 mb-6"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-light">Secure Access Point</span>
              </motion.div>
              <h2 className="text-5xl font-black tracking-tighter mb-4">Initialize <br /><span className="text-gradient">Session</span></h2>
              
              <div className="flex justify-center gap-4 mt-8">
                <button 
                  onClick={() => setLoginMode('email')}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginMode === 'email' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                >
                  Email
                </button>
                <button 
                  onClick={() => setLoginMode('phone')}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginMode === 'phone' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                >
                  Mobile OTP
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loginMode === 'email' ? (
                <motion.form 
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit(onSubmit)} 
                  className="space-y-6"
                >
                  <FuturisticInput
                    label="Identity (Email)"
                    icon={Mail}
                    placeholder="you@domain.com"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-accent text-xs font-black px-1 uppercase tracking-wider">{errors.email.message}</p>}

                  <FuturisticInput
                    label="Security Key"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  {errors.password && <p className="text-accent text-xs font-black px-1 uppercase tracking-wider">{errors.password.message}</p>}

                  <PremiumButton type="submit" disabled={loading} className="w-full py-5 !rounded-2xl flex items-center justify-center gap-3 text-lg group mt-4">
                    {loading ? 'Authenticating...' : <>Authorize Access <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>}
                  </PremiumButton>
                </motion.form>
              ) : (
                <motion.div 
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {otpStep === 1 ? (
                    <>
                      <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-4">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center">
                          Development Mode: OTP will be logged in the backend console.
                        </p>
                      </div>
                      <FuturisticInput
                        label="Communication (Phone)"
                        icon={Phone}
                        placeholder="+91 00000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <PremiumButton onClick={handleSendOtp} disabled={loading} className="w-full py-5 !rounded-2xl flex items-center justify-center gap-3 text-lg group">
                        {loading ? 'Transmitting...' : <>Send Access Code <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>}
                      </PremiumButton>
                    </>
                  ) : (
                    <>
                      <FuturisticInput
                        label="Verification Code (OTP)"
                        icon={Smartphone}
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <PremiumButton onClick={handleVerifyOtp} disabled={loading} className="w-full py-5 !rounded-2xl flex items-center justify-center gap-3 text-lg group">
                        {loading ? 'Verifying...' : <>Confirm Code <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>}
                      </PremiumButton>
                      <button onClick={() => setOtpStep(1)} className="w-full text-xs font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors">Change Number</button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-text-muted font-black tracking-widest">Or Synchronize Via</span></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white text-secondary rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-100 transition-all group overflow-hidden relative shadow-xl"
            >
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-black text-sm uppercase tracking-tighter">Continue with Google</span>
            </button>

            <div className="mt-10 text-center">
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

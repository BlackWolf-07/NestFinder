import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../api/property';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Skeleton } from '../components/UIElements';
import { Upload, MapPin, DollarSign, Home, CheckCircle2 } from 'lucide-react';

const AMENITIES_LIST = ['WiFi', 'Parking', 'Gym', 'Lift', 'CCTV', 'Security', 'Pet Friendly', 'Swimming Pool', 'Garden'];

export default function AddProperty() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { amenities: [] }
  });
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'amenities') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });
      
      images.forEach(image => {
        formData.append('images', image);
      });

      await createProperty(formData);
      toast.success('Property listed successfully! Awaiting admin approval.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to list property');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="space-y-2">
      <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />}
        <input 
          {...props}
          className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-4 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold focus:border-primary`}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tight mb-2">List Your Premium Nest</h1>
          <p className="text-text-muted font-medium">Reach high-intent buyers and renters in our curated network.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="p-8 space-y-6">
                <InputField 
                  label="Listing Title" 
                  icon={Home} 
                  placeholder="e.g. Modern Penthouse with Skyline View"
                  {...register('title', { required: true })}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Type</label>
                    <select {...register('type')} className="w-full px-4 py-4 bg-background border border-border rounded-2xl font-bold outline-none focus:border-primary">
                      <option value="rent">For Rent</option>
                      <option value="buy">For Sale</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Category</label>
                    <select {...register('category')} className="w-full px-4 py-4 bg-background border border-border rounded-2xl font-bold outline-none focus:border-primary">
                      <option value="flat">Flat/Apartment</option>
                      <option value="house">Independent House</option>
                      <option value="PG">PG</option>
                      <option value="hostel">Hostel</option>
                      <option value="commercial">Commercial Space</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Price (USD)" icon={DollarSign} type="number" placeholder="Price" {...register('price', { required: true })} />
                  <InputField label="BHK / Configuration" icon={CheckCircle2} type="number" placeholder="e.g. 3" {...register('bhk')} />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Description</label>
                  <textarea 
                    {...register('description', { required: true })} 
                    className="w-full p-6 bg-background border border-border rounded-3xl outline-none focus:border-primary font-bold min-h-[150px]"
                    placeholder="Tell us more about your property..."
                  />
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-text-muted">Premium Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {AMENITIES_LIST.map(amenity => (
                    <label key={amenity} className="flex items-center gap-3 p-4 bg-background border border-border rounded-2xl cursor-pointer hover:border-primary transition-colors group">
                      <input type="checkbox" value={amenity} {...register('amenities')} className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary" />
                      <span className="font-bold text-sm text-text-muted group-hover:text-text-main">{amenity}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            {/* Location & Images */}
            <div className="space-y-8">
              <Card className="p-8 space-y-6">
                <h3 className="text-lg font-black mb-4 uppercase tracking-widest text-text-muted">Location Details</h3>
                <InputField label="City" icon={MapPin} placeholder="e.g. San Francisco" {...register('city', { required: true })} />
                <InputField label="Locality" placeholder="e.g. Nob Hill" {...register('locality', { required: true })} />
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Full Address</label>
                  <textarea 
                    {...register('location', { required: true })} 
                    className="w-full p-4 bg-background border border-border rounded-2xl outline-none focus:border-primary font-bold"
                    rows="3"
                  />
                </div>
              </Card>

              <Card className="p-8 space-y-6">
                <h3 className="text-lg font-black mb-4 uppercase tracking-widest text-text-muted">Visual Assets</h3>
                <div className="border-2 border-dashed border-border rounded-[32px] p-10 text-center space-y-4 hover:border-primary transition-colors relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-black">Upload Photos</p>
                    <p className="text-xs text-text-muted font-bold mt-1">{images.length} files selected</p>
                  </div>
                </div>
              </Card>

              <PremiumButton 
                type="submit" 
                disabled={loading}
                className="w-full py-5 !rounded-3xl text-xl shadow-2xl shadow-primary/30"
              >
                {loading ? 'Processing...' : 'Publish Listing'}
              </PremiumButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

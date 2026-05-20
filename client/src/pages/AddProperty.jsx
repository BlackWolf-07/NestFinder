import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Upload, Home, MapPin, IndianRupee, Info, Check, Plus, X, Navigation, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Card, PremiumButton, Skeleton } from '../components/UIElements';
import API from '../api';

const CATEGORIES = ['flat', 'house', 'PG', 'hostel', 'commercial'];
const TYPES = ['rent', 'buy'];
const FURNISHING = ['unfurnished', 'semi-furnished', 'fully-furnished'];
const AMENITIES_LIST = ["WiFi", "Parking", "Gym", "Lift", "Security", "Pool", "Garden"];

const CITIES_DATA = {
  "Mumbai": ["Andheri", "Bandra", "Juhu", "South Mumbai", "Powai"],
  "Delhi": ["South Delhi", "Connaught Place", "Dwarka", "Rohini", "Saket"],
  "Bangalore": ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Jayanagar"],
  "Hyderabad": ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur"],
  "Chennai": ["Adyar", "Besant Nagar", "T. Nagar", "Mylapore", "Velachery"]
};

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  type: z.enum(['rent', 'buy']),
  category: z.enum(['flat', 'house', 'PG', 'hostel', 'commercial']),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Locality is required'),
  address: z.string().min(10, 'Full address must be at least 10 characters'),
  price: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  bhk: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'BHK must be a number'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished']),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

export default function AddProperty() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const [customCity, setCustomCity] = useState('');
  const [customLocality, setCustomLocality] = useState('');
  const [showAddressField, setShowAddressField] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'rent',
      category: 'flat',
      furnishing: 'unfurnished',
      city: '',
      locality: '',
      address: '',
      contactNumber: ''
    }
  });

  const selectedCity = watch('city');
  const selectedLocality = watch('locality');

  // Reset locality if city changes
  useEffect(() => {
    if (selectedCity !== 'custom') {
      setValue('locality', '');
      setCustomLocality('');
    }
  }, [selectedCity, setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      return toast.error('Maximum 10 images allowed');
    }
    setImages([...images, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity) => {
    setAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const onSubmit = async (data) => {
    const finalCity = data.city === 'custom' ? customCity : data.city;
    const finalLocality = data.locality === 'custom' ? customLocality : data.locality;

    if (!finalCity) return toast.error("City is required");
    if (!finalLocality) return toast.error("Locality is required");

    if (images.length === 0) {
      return toast.error("Please upload at least one image");
    }

    setLoading(true);
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'city') formData.append(key, finalCity);
      else if (key === 'locality') formData.append(key, finalLocality);
      else if (key === 'address') formData.append(key, data.address);
      else formData.append(key, data[key]);
    });
    formData.append("amenities", JSON.stringify(amenities));
    formData.append("isFeatured", true);
    images.forEach(img => formData.append("images", img));

    try {
      const response = await API.post("/properties/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Property listed successfully!");
      window.location.href = "/";
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const isLocalityDisabled = !selectedCity || (selectedCity === 'custom' && !customCity);
  const isAddressDisabled = isLocalityDisabled || !selectedLocality || (selectedLocality === 'custom' && !customLocality);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-secondary tracking-tight mb-2">List Your Property</h1>        
          <p className="text-text-muted font-medium">Reach thousands of potential residents in minutes.</p>     
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card className="p-8 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Basic Information
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-black text-text-muted uppercase tracking-widest">Property Title</label>
                <input
                  {...register('title')}
                  placeholder="e.g. Modern 2BHK Apartment in Downtown"
                  className={`w-full p-4 bg-gray-50 text-gray-900 placeholder:text-gray-400 border-2 rounded-2xl outline-none transition-all font-bold ${errors.title ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                />
                {errors.title && <p className="text-red-500 text-xs font-bold mt-1">{errors.title.message}</p>} 
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Listing Type</label>
                  <select
                    {...register('type')}
                    className="w-full p-4 bg-gray-50 text-gray-900 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold"
                  >
                    {TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Category</label>
                  <select
                    {...register('category')}
                    className="w-full p-4 bg-gray-50 text-gray-900 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="uppercase">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">City</label>  
                  <select
                    {...register('city')}
                    className={`w-full p-4 bg-gray-50 text-gray-900 border-2 rounded-2xl outline-none transition-all font-bold ${errors.city ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                  >
                    <option value="">Select City</option>
                    {Object.keys(CITIES_DATA).map(city => <option key={city} value={city}>{city}</option>)}
                    <option value="custom">Other (Type Custom)</option>
                  </select>
                  {selectedCity === 'custom' && (
                    <input
                      type="text"
                      placeholder="e.g. Pune"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className="w-full mt-2 p-4 bg-gray-50 text-gray-900 border-2 border-primary/20 rounded-2xl outline-none font-bold"
                    />
                  )}
                  {errors.city && <p className="text-red-500 text-xs font-bold mt-1">{errors.city.message}</p>} 
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Locality</label>
                  <select
                    {...register('locality')}
                    disabled={isLocalityDisabled}
                    className={`w-full p-4 bg-gray-50 text-gray-900 border-2 rounded-2xl outline-none transition-all font-bold ${isLocalityDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${errors.locality ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                  >
                    <option value="">Select Locality</option>
                    {selectedCity && CITIES_DATA[selectedCity] && CITIES_DATA[selectedCity].map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                    {selectedCity && <option value="custom">Other (Type Custom)</option>}
                  </select>
                  {selectedLocality === 'custom' && (
                    <input
                      type="text"
                      placeholder="e.g. Koregaon Park"
                      value={customLocality}
                      onChange={(e) => setCustomLocality(e.target.value)}
                      className="w-full mt-2 p-4 bg-gray-50 text-gray-900 border-2 border-primary/20 rounded-2xl outline-none font-bold"
                    />
                  )}
                  {errors.locality && <p className="text-red-500 text-xs font-bold mt-1">{errors.locality.message}</p>}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" /> Full Address
                </h2>
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Property Location Signature</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-text-muted" />
                    <textarea
                      {...register('address')}
                      rows="3"
                      placeholder="e.g. Flat 101, Sunshine Apartments, Sector 5, Near Metro Station..."
                      className={`w-full p-4 pl-12 bg-gray-50 text-gray-900 border-2 rounded-2xl outline-none transition-all font-bold resize-none ${errors.address ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs font-bold mt-1">{errors.address.message}</p>}
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-wider">Required for precise GPS synchronization on the map.</p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" /> Pricing & Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Price (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="number"
                      placeholder="Enter price"
                      {...register('price')}
                      className={`w-full p-4 pl-12 bg-gray-50 text-gray-900 border-2 rounded-2xl outline-none transition-all font-bold ${errors.price ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs font-bold mt-1">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      {...register('contactNumber')}
                      className={`w-full p-4 pl-12 bg-gray-50 text-gray-900 border-2 rounded-2xl outline-none transition-all font-bold ${errors.contactNumber ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                    />
                  </div>
                  {errors.contactNumber && <p className="text-red-500 text-xs font-bold mt-1">{errors.contactNumber.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">BHK</label>   
                  <input
                    type="number"
                    {...register('bhk')}
                    placeholder="2"
                    className={`w-full p-4 bg-gray-50 text-gray-900 border-2 rounded-2xl outline-none transition-all font-bold ${errors.bhk ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                  />
                  {errors.bhk && <p className="text-red-500 text-xs font-bold mt-1">{errors.bhk.message}</p>}   
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest">Furnishing</label>
                  <select
                    {...register('furnishing')}
                    className="w-full p-4 bg-gray-50 text-gray-900 border-2 border-transparent rounded-2xl outline-none focus:border-primary/20 focus:bg-white transition-all font-bold"
                  >
                    {FURNISHING.map(f => <option key={f} value={f}>{f.replace('-', ' ').toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Check className="w-5 h-5 text-primary" /> Amenities
              </h2>
              <div className="flex flex-wrap gap-3">
                {AMENITIES_LIST.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-6 py-3 rounded-full border-2 font-black text-xs transition-all ${amenities.includes(a) ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-400'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Property Images
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-border group">
                    <img src={src} className="w-full h-full object-cover" alt="Preview" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {previews.length < 10 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition text-text-muted hover:text-primary hover:border-primary/30">
                    <Plus className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase">Add Image</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-text-muted font-black uppercase">Upload at least 1 image. Max 10.</p>
            </div>

            <hr className="border-border" />

            <div className="space-y-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Home className="w-5 h-5 text-primary" /> Description
              </h2>
              <div className="space-y-2">
                <textarea
                  {...register('description')}
                  rows="6"
                  placeholder="Tell potential residents what makes your property special..."
                  className={`w-full p-4 bg-gray-50 text-gray-900 border-2 rounded-2xl outline-none transition-all font-bold resize-none ${errors.description ? 'border-red-500' : 'border-transparent focus:border-primary/20 focus:bg-white'}`}
                />
                {errors.description && <p className="text-red-500 text-xs font-bold mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </Card>

          <div className="flex justify-end pt-4">
            <PremiumButton
              type="submit"
              disabled={loading}
              className="!px-16 py-6 !rounded-[32px] text-xl shadow-2xl shadow-primary/30"
            >
              {loading ? 'Publishing Listing...' : 'List My Property Now'}
            </PremiumButton>
          </div>
        </form>
      </div>
    </div>
  );
}

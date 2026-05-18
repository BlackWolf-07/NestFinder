import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../api/property';

const AMENITIES_LIST = ['WiFi', 'Parking', 'Gym', 'Lift', 'CCTV', 'Security', 'Pet Friendly'];

export default function AddProperty() {
  const { register, handleSubmit, formState: { errors } } = useForm();
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
      alert('Property listed successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to list property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">List New Property</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg border space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Property Title</label>
            <input 
              {...register('title', { required: true })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Modern 2BHK Flat with Lake View"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select {...register('type')} className="w-full p-3 border rounded-lg">
              <option value="rent">For Rent</option>
              <option value="buy">For Sale</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select {...register('category')} className="w-full p-3 border rounded-lg">
              <option value="flat">Flat</option>
              <option value="house">House</option>
              <option value="PG">PG</option>
              <option value="hostel">Hostel</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input 
              type="number"
              {...register('price', { required: true })}
              className="w-full p-3 border rounded-lg"
              placeholder="Price in USD"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">BHK</label>
            <input 
              type="number"
              {...register('bhk')}
              className="w-full p-3 border rounded-lg"
              placeholder="Number of bedrooms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input {...register('city', { required: true })} className="w-full p-3 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Locality</label>
            <input {...register('locality', { required: true })} className="w-full p-3 border rounded-lg" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Full Address / Location</label>
            <textarea {...register('location', { required: true })} className="w-full p-3 border rounded-lg" rows="2"></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {AMENITIES_LIST.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" value={amenity} {...register('amenities')} className="w-4 h-4 text-primary" />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Upload Images (Up to 10)</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-4 rounded-lg font-bold text-xl hover:bg-blue-600 transition disabled:bg-blue-300"
        >
          {loading ? 'Submitting...' : 'List Property'}
        </button>
      </form>
    </div>
  );
}

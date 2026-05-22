import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bed, ShieldCheck, Star, ArrowUpRight, Trash2 } from 'lucide-react';
import { Card, Badge, PremiumButton } from './UIElements';
import { formatPrice } from '../utils/formatPrice';
import { deleteProperty } from "../api/property";

export default function PropertyCard({ property, index = 0, setProperties }) {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    try {
      await deleteProperty(id);

      // remove from UI instantly
      if (setProperties) {
        setProperties((prev) => {
          if (Array.isArray(prev)) return prev.filter((item) => item.id !== id);
          if (prev && prev.properties) return { ...prev, properties: prev.properties.filter(item => item.id !== id) };
          return prev;
        });
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const imageUrl = property.image 
    ? (property.image.startsWith('http') ? property.image : `http://localhost:5000${property.image}`)
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800';

  return (
    <Card className="group relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-all duration-700" />

      <div className="relative h-[280px] overflow-hidden m-2 rounded-[28px]">
        <motion.img
          whileHover={{ scale: 1.15, rotate: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"}
        />

        {/* Overlays */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Badge variant="glass" className="!bg-black/40 backdrop-blur-md border-white/20">
            {property.type === 'buy' ? 'Ownership' : 'Lease'}
          </Badge>
          {property.isVerified && (
            <Badge variant="info" className="flex items-center gap-1 shadow-lg shadow-primary/20">
              <ShieldCheck className="w-3 h-3" /> Secure
            </Badge>
          )}
        </div>

        {property.avgRating && (
          <div className="absolute top-4 right-4 glass-light px-3 py-1.5 rounded-2xl flex items-center gap-1.5 font-black text-xs shadow-xl border-white/20">       
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            {Number(property.avgRating).toFixed(1)}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent opacity-60" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
            <motion.div
              whileHover={{ rotate: 45 }}
              onClick={() => navigate(`/property/${property.id}`)}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-secondary shadow-2xl cursor-pointer"
            >
              <ArrowUpRight className="w-8 h-8" />
            </motion.div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-black text-white leading-tight group-hover:text-primary-light transition-colors duration-300 truncate pr-4">
            {property.title}
          </h3>
          <Badge variant="success">{formatPrice(property.price)}</Badge>
        </div>

        <div className="flex items-center text-text-muted text-sm font-bold mb-8">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 border border-white/10 group-hover:border-primary/30 transition-colors">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <span className="truncate">{property.locality}, {property.city}</span>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Layout</span>
              <div className="flex items-center gap-2 mt-1">
                <Bed className="w-4 h-4 text-primary" />
                <span className="font-black text-white">{property.bhk} BHK</span>
              </div>
            </div>
            
            <button
              onClick={() => handleDelete(property.id)}
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl transition-all flex items-center gap-1 text-xs font-black"
            >
              <Trash2 size={14} /> DELETE
            </button>
          </div>
          <motion.button
            whileHover={{ x: 5 }}
            onClick={() => navigate(`/property/${property.id}`)}
            className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-tighter"
          >
            Inspect <ArrowUpRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </Card>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bed, ShieldCheck, Star } from 'lucide-react';
import { Card, Badge, PremiumButton } from './UIElements';

export default function PropertyCard({ property, index = 0 }) {
  const imageUrl = property.images && JSON.parse(property.images)[0] 
    ? `http://localhost:5000${JSON.parse(property.images)[0]}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <Card className="group">
      <div className="relative h-64 overflow-hidden">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Badge variant={property.type === 'buy' ? 'success' : 'info'}>
            {property.type}
          </Badge>
          {property.isVerified && (
            <Badge variant="info" className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </Badge>
          )}
        </div>
        
        {property.avgRating && (
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 font-bold text-sm shadow-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            {Number(property.avgRating).toFixed(1)}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <Link to={`/properties/${property.id}`} className="w-full">
            <PremiumButton className="w-full !rounded-xl">View Details</PremiumButton>
          </Link>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-black text-secondary dark:text-white mb-2 truncate group-hover:text-primary transition-colors">
          {property.title}
        </h3>
        
        <div className="flex items-center text-text-muted text-sm font-bold mb-4">
          <MapPin className="w-4 h-4 mr-1 text-primary" />
          <span className="truncate">{property.locality}, {property.city}</span>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-text-muted">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="font-black">{property.bhk} BHK</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-text-muted uppercase">Price</p>
            <p className="text-2xl font-black text-primary tracking-tight">${Number(property.price).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

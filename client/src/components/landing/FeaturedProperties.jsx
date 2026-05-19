import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, MapPin, Bed, Star } from 'lucide-react';
import { Badge, PremiumButton } from '../UIElements';
import { useNavigate } from 'react-router-dom';

const PropertySlide = ({ property }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="flex-shrink-0 w-[400px] group cursor-pointer"
    >
      <div className="glass p-1 rounded-[40px] border-white/5 bg-secondary/20 hover:border-primary/30 transition-all duration-500 overflow-hidden">
        <div className="relative h-[300px] overflow-hidden rounded-[38px] m-1">
          <img 
            src={property.image} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
            alt={property.title} 
          />
          <div className="absolute top-6 left-6 z-10">
             <Badge variant="glass" className="bg-black/50 backdrop-blur-md">Prime Sector</Badge>
          </div>
          <div className="absolute bottom-6 right-6 z-10">
             <div className="bg-white text-secondary px-4 py-2 rounded-2xl font-black text-lg shadow-2xl">
                ${property.price}
             </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
             <h4 className="text-2xl font-black text-white group-hover:text-primary transition-colors">{property.title}</h4>
             <div className="flex items-center gap-1 text-yellow-400">
                <Star size={16} className="fill-yellow-400" />
                <span className="text-sm font-black">4.9</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2 text-text-muted font-bold text-sm mb-6 italic">
             <MapPin size={16} className="text-primary" />
             {property.location}
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
             <div className="flex items-center gap-4 text-xs font-black text-white uppercase tracking-widest">
                <div className="flex items-center gap-2">
                   <Bed size={14} className="text-primary" />
                   {property.bhk} BHK
                </div>
             </div>
             <motion.div 
               whileHover={{ x: 5 }}
               className="text-primary font-black text-sm flex items-center gap-2"
             >
                INSPECT <ArrowRight size={16} />
             </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function FeaturedProperties() {
  const navigate = useNavigate();
  
  const properties = [
    { title: 'The Glass Pavilion', location: 'Neo-Tokyo, Sector 7', price: '2,500/mo', bhk: 3, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
    { title: 'Cyber Zenith Loft', location: 'Sky-Rise City', price: '4.2M', bhk: 2, image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800' },
    { title: 'Oceanic Rim Villa', location: 'Marina Bay 2.0', price: '8,400/mo', bhk: 5, image: 'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=800' },
    { title: 'Neon Gardens', location: 'Central District', price: '1.8M', bhk: 1, image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800' },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
           <Badge variant="info" className="mb-4">Elite Selection</Badge>
           <h2 className="text-6xl font-black tracking-tighter text-white">Featured <span className="text-gradient">Architectures</span></h2>
        </div>
        <PremiumButton variant="outline" onClick={() => navigate('/')} className="!rounded-2xl">
           Explore Entire Matrix
        </PremiumButton>
      </div>

      <div className="relative">
        <div className="flex gap-8 overflow-x-auto pb-12 px-6 no-scrollbar snap-x">
          {properties.map((p, i) => (
            <PropertySlide key={i} property={p} />
          ))}
        </div>
        {/* Shadow Overlays for scroll hint */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </section>
  );
}

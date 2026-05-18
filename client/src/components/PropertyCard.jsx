import { Link } from 'react-router-dom';

export default function PropertyCard({ property }) {
  const imageUrl = property.images && JSON.parse(property.images)[0] 
    ? `http://localhost:5000${JSON.parse(property.images)[0]}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <div className="relative h-48">
        <img src={imageUrl} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold capitalize">
          {property.type}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-secondary truncate">{property.title}</h3>
        <p className="text-gray-500 text-sm mb-4">{property.locality}, {property.city}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primary">${property.price}</span>
          <span className="text-gray-600">{property.bhk} BHK • {property.category}</span>
        </div>

        <Link 
          to={`/properties/${property.id}`}
          className="block text-center bg-secondary text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties, deleteProperty } from '../api/property';
import useAuthStore from '../store/authStore';

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const data = await getMyProperties();
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter(p => p.id !== id));
      } catch (err) {
        alert('Failed to delete property');
      }
    }
  };

  if (user.role === 'buyer') {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <p className="text-gray-600 mb-4">You can browse properties and save your favorites.</p>
          <Link to="/" className="text-primary font-bold hover:underline">Start Exploring</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary">My Listings</h1>
        <Link 
          to="/add-property" 
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
        >
          + Add New Property
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading your properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4 text-lg">No properties listed yet.</p>
          <Link to="/add-property" className="text-primary font-bold">List your first property</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-gray-200">
                {property.images && JSON.parse(property.images)[0] && (
                  <img 
                    src={`http://localhost:5000${JSON.parse(property.images)[0]}`} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg truncate">{property.title}</h3>
                <p className="text-primary font-bold">${property.price}</p>
                <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">{property.status}</p>
                <div className="flex space-x-2">
                  <Link 
                    to={`/edit-property/${property.id}`}
                    className="flex-1 text-center bg-gray-100 py-2 rounded font-semibold text-sm hover:bg-gray-200"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(property.id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 rounded font-semibold text-sm hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

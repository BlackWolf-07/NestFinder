import { useLocation, Link } from 'react-router-dom';

export default function Recommendations() {
  const location = useLocation();
  const { recommendations, preferences } = location.state || { recommendations: [], preferences: {} };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-secondary mb-4">AI Top Matches for You</h1>
          <p className="text-gray-500 text-lg">
            Based on your preference for a {preferences.bhk} BHK in {preferences.city} for {preferences.type}.
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border">
            <p className="text-gray-500 text-xl">No exact AI matches found. Try broadening your preferences!</p>
            <Link to="/onboarding" className="mt-4 inline-block text-primary font-bold">Restart Onboarding</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {recommendations.map((property, idx) => (
              <div key={property.id} className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 hover:border-primary transition duration-500">
                <div className="lg:w-1/3 h-64 lg:h-auto relative">
                  <img 
                    src={property.images && JSON.parse(property.images)[0] ? `http://localhost:5000${JSON.parse(property.images)[0]}` : 'https://via.placeholder.com/600x400'} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-secondary font-bold shadow-lg">
                    Match #{idx + 1}
                  </div>
                </div>
                
                <div className="flex-1 p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-3xl font-bold text-secondary">{property.title}</h2>
                      <span className="text-3xl font-extrabold text-primary">${property.price}</span>
                    </div>
                    <p className="text-gray-500 mb-6 flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {property.locality}, {property.city}
                    </p>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 relative mb-8">
                      <div className="absolute -top-3 left-6 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        AI Recommendation Insight
                      </div>
                      <p className="text-secondary leading-relaxed italic">
                        "{property.aiReason}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      to={`/properties/${property.id}`}
                      className="flex-1 bg-secondary text-white text-center py-4 rounded-xl font-bold hover:bg-gray-800 transition"
                    >
                      View Full Details
                    </Link>
                    <button className="flex-1 border-2 border-secondary text-secondary py-4 rounded-xl font-bold hover:bg-gray-50 transition">
                      Schedule a Call
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

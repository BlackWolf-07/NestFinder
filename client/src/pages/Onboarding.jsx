import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAiRecommendations } from '../api/ai';

const STEPS = [
  {
    title: "What's your goal?",
    fields: ["type"],
    options: { type: ["rent", "buy"] }
  },
  {
    title: "Preferred Location",
    fields: ["city", "locality"],
  },
  {
    title: "Budget & Space",
    fields: ["budget", "bhk"],
  },
  {
    title: "Lifestyle & Amenities",
    fields: ["lifestyle", "amenities"],
    options: { 
      lifestyle: ["family", "bachelor", "pet-friendly", "student"],
      amenities: ["WiFi", "Parking", "Gym", "Lift", "Security"]
    }
  }
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    type: 'rent',
    city: '',
    locality: '',
    budget: '',
    bhk: '',
    lifestyle: 'family',
    amenities: []
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const recommendations = await getAiRecommendations(data);
      navigate('/recommendations', { state: { recommendations, preferences: data } });
    } catch (err) {
      alert('AI Recommendation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateData = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleAmenityToggle = (amenity) => {
    const current = data.amenities;
    if (current.includes(amenity)) {
      updateData('amenities', current.filter(a => a !== amenity));
    } else {
      updateData('amenities', [...current, amenity]);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-2 bg-gray-100">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-12">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">Step {step + 1} of {STEPS.length}</p>
          <h2 className="text-4xl font-extrabold text-secondary mb-10">{STEPS[step].title}</h2>

          <div className="space-y-8">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-4">
                {STEPS[0].options.type.map(t => (
                  <button
                    key={t}
                    onClick={() => updateData('type', t)}
                    className={`p-6 rounded-2xl border-2 font-bold text-xl capitalize transition ${data.type === t ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    I want to {t}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Which city?" 
                  className="w-full p-4 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-primary"
                  value={data.city}
                  onChange={(e) => updateData('city', e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Locality (Optional)" 
                  className="w-full p-4 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-primary"
                  value={data.locality}
                  onChange={(e) => updateData('locality', e.target.value)}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Max Budget (USD)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2000" 
                    className="w-full p-4 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-primary"
                    value={data.budget}
                    onChange={(e) => updateData('budget', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Bedrooms (BHK)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 2" 
                    className="w-full p-4 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-primary"
                    value={data.bhk}
                    onChange={(e) => updateData('bhk', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-3">Your Lifestyle</label>
                  <div className="grid grid-cols-2 gap-3">
                    {STEPS[3].options.lifestyle.map(l => (
                      <button
                        key={l}
                        onClick={() => updateData('lifestyle', l)}
                        className={`p-3 rounded-lg border text-sm font-bold capitalize transition ${data.lifestyle === l ? 'bg-secondary text-white border-secondary' : 'bg-gray-50 border-gray-100'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-3">Must-have Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {STEPS[3].options.amenities.map(a => (
                      <button
                        key={a}
                        onClick={() => handleAmenityToggle(a)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition ${data.amenities.includes(a) ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200'}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-between">
            {step > 0 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="px-8 py-3 text-gray-400 font-bold hover:text-secondary transition"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={loading}
              className="ml-auto bg-primary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-600 shadow-xl shadow-blue-500/30 transition disabled:bg-blue-300"
            >
              {loading ? 'Analyzing...' : step === STEPS.length - 1 ? 'Find My Match' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

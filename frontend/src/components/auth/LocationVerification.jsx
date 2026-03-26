import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const POPULAR_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Miami', 'Seattle', 'Denver',
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'
];

const LocationVerification = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [filteredCities, setFilteredCities] = useState(POPULAR_CITIES);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (city.length > 0) {
      setFilteredCities(
        POPULAR_CITIES.filter((c) => c.toLowerCase().includes(city.toLowerCase()))
      );
      setShowDropdown(true);
    } else {
      setFilteredCities(POPULAR_CITIES);
      setShowDropdown(false);
    }
  }, [city]);

  const selectCity = (selectedCity) => {
    setCity(selectedCity);
    setShowDropdown(false);
  };

  const handleContinue = async () => {
    if (!city || !address) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Get coordinates from city (simplified, in production use geocoding API)
      const coordinates = [0, 0]; // Placeholder
      
      // Save location data
      localStorage.setItem('location', JSON.stringify({ city, address, coordinates }));
      navigate('/onboarding/profile-setup');
    } catch (err) {
      console.error('Error saving location:', err);
      alert('Failed to save location');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/skills');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Verify Your Location</h1>
            <div className="text-sm text-gray-600">Step 3 of 4</div>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <div className="flex items-start">
            <span className="text-3xl mr-4">📍</span>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Why We Need Your Location</h2>
              <p className="text-gray-700">
                We use your location to match you with nearby jobs and help clients find qualified workers
                in your area. Your exact address won't be shared with clients until you accept a job.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg p-8 shadow-md mb-8">
          {/* City Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <div className="relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder="Start typing your city..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              {showDropdown && filteredCities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredCities.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectCity(c)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your street address, neighborhood, or area"
              rows="3"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Make sure this is the location where you want clients to find you
            </p>
          </div>

          {/* Map Preview (Optional) */}
          <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center mb-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">📍 Map preview</p>
              <p className="text-sm text-gray-500">
                {city} {address ? '- ' + address : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!city || !address || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationVerification;

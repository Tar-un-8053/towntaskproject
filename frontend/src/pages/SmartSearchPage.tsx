import { useState, useEffect } from 'react';
import { smartSearchApi } from '../services/api';
import { buildJobDetailRoute } from '../router/routes';
import {
  Search, MapPin, Loader2, Filter, Wifi, Navigation, ChevronDown,
  Briefcase, Star, AlertCircle, ArrowRight, X,
} from 'lucide-react';

const POPULAR_SKILLS = [
  'Physics Tutor', 'Plumber', 'Electrician', 'House Cleaning', 'Carpenter',
  'AC Repair', 'Painter', 'Cook', 'Driver', 'Mechanic',
];

type ServiceMode = 'in-person' | 'online' | 'all';

export default function SmartSearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [serviceMode, setServiceMode] = useState<ServiceMode>('in-person');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [results, setResults] = useState<any[]>([]);
  const [searchMessage, setSearchMessage] = useState('');
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Tab
  const [searchType, setSearchType] = useState<'jobs' | 'providers'>('jobs');

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLoading(false);
        },
        () => {
          setLocationError('Enable location for radius-based search');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleSearch = async () => {
    if (!query && !category) return;
    setSearching(true);
    setSearched(true);

    try {
      if (searchType === 'jobs') {
        const res = await smartSearchApi.searchJobs({
          query: query || undefined,
          category: category || undefined,
          lat: location?.lat || 0,
          lng: location?.lng || 0,
          serviceMode: serviceMode === 'all' ? undefined : serviceMode,
        });
        setResults(res.jobs || []);
        setSearchMessage(res.message || '');
        setSearchRadius(res.radius);
        setExpanded(res.expanded);
      } else {
        const res = await smartSearchApi.searchProviders({
          skill: query || category || undefined,
          lat: location?.lat || 0,
          lng: location?.lng || 0,
          serviceMode: serviceMode === 'all' ? undefined : serviceMode,
        });
        setResults(res.providers || []);
        setSearchMessage(res.message || '');
        setSearchRadius(res.radius);
        setExpanded(res.expanded);
      }
    } catch (err: any) {
      setSearchMessage(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleQuickSearch = (skill: string) => {
    setQuery(skill);
    setCategory('');
    setTimeout(handleSearch, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Smart Search</h1>
          <p className="text-violet-100">Find services & providers near you with intelligent radius expansion</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-4">
        {/* Search box */}
        <div className="bg-white rounded-2xl shadow-lg p-4">
          {/* Type toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSearchType('jobs')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'jobs' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-1 mb-0.5" /> Search Jobs
            </button>
            <button
              onClick={() => setSearchType('providers')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                searchType === 'providers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1 mb-0.5" /> Search Providers
            </button>
          </div>

          {/* Search input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={searchType === 'jobs' ? 'Search jobs (e.g., Physics tutor, Plumber)...' : 'Search by skill...'}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || (!query && !category)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            <Filter className="w-4 h-4" /> Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              {/* Service mode */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Service Mode</label>
                <div className="flex gap-2">
                  {([['in-person', 'In-Person', Navigation], ['online', 'Online', Wifi], ['all', 'All', Search]] as const).map(([id, label, Icon]) => (
                    <button
                      key={id}
                      onClick={() => setServiceMode(id as ServiceMode)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm border-2 transition-colors flex items-center justify-center gap-1 ${
                        serviceMode === id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-red-500" />
                {locationLoading ? (
                  <span className="text-sm text-gray-500">Fetching location...</span>
                ) : location ? (
                  <span className="text-sm text-green-600">
                    Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </span>
                ) : (
                  <button onClick={fetchLocation} className="text-sm text-blue-600 hover:underline">
                    {locationError || 'Enable location'}
                  </button>
                )}
              </div>

              {serviceMode === 'online' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  <Wifi className="w-4 h-4" />
                  Online mode: showing all matching providers regardless of distance
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular searches */}
        {!searched && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => { setQuery(skill); }}
                  className="px-3 py-1.5 bg-white rounded-full text-sm text-gray-700 border border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search message (radius expansion notice) */}
        {searchMessage && (
          <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
            expanded ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${expanded ? 'text-yellow-600' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm font-medium ${expanded ? 'text-yellow-800' : 'text-blue-800'}`}>
                {searchMessage}
              </p>
              {searchRadius && (
                <p className="text-xs text-gray-500 mt-1">
                  Search radius: {searchRadius} km from your location
                </p>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {searched && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                {results.length} {searchType === 'jobs' ? 'Jobs' : 'Providers'} Found
              </h3>
              {searchRadius && (
                <span className="text-sm text-gray-500">
                  Within {searchRadius} km
                </span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No results found. Try different keywords or expand your search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchType === 'jobs' ? (
                  results.map((job: any) => (
                    <div
                      key={job._id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => { window.location.hash = buildJobDetailRoute(job._id); }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{job.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {job.area}
                            </span>
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{job.category}</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{job.description}</p>
                          {job.salary && (
                            <p className="text-green-600 font-medium text-sm mt-1">{job.salary}</p>
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3" />
                      </div>
                    </div>
                  ))
                ) : (
                  results.map((provider: any) => (
                    <div
                      key={provider._id || provider.userId}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {provider.name?.[0] || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {provider.area && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {provider.area}
                              </span>
                            )}
                            {provider.ratingAverage > 0 && (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Star className="w-3 h-3 fill-current" /> {provider.ratingAverage}
                              </span>
                            )}
                          </div>
                          {provider.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {provider.skills.slice(0, 5).map((skill: string) => (
                                <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {provider.badgeLevel && provider.badgeLevel !== 'none' && (
                          <span className="text-lg">
                            {provider.badgeLevel === 'gold' ? '🥇' : provider.badgeLevel === 'silver' ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-20" />
    </div>
  );
}

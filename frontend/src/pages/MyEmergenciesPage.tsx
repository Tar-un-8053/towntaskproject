import { useState, useEffect } from 'react';
import { emergencyApi, ratingApi, volunteerApi } from '../services/api';
import { buildEmergencyRoute, buildVolunteerRoute } from '../router/routes';
import InstantVerificationDialog from '../components/common/InstantVerificationDialog';
import { toast } from 'react-toastify';
import {
  AlertTriangle, Clock, MapPin, CheckCircle, User, Star, Loader2,
  Shield, ChevronRight, XCircle, Flag, RefreshCw, Heart,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  OPEN: { color: 'text-red-700', bg: 'bg-red-100', label: 'Open - Waiting for help' },
  IN_PROGRESS: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Help on the way' },
  RESOLVED: { color: 'text-green-700', bg: 'bg-green-100', label: 'Resolved' },
  EXPIRED: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Expired' },
};

export default function MyEmergenciesPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [ratings, setRatings] = useState({ helpfulness: 4, behavior: 4, safety: 4, responseTime: 4 });
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [showInstantVerification, setShowInstantVerification] = useState(false);
  const [pendingAcceptId, setPendingAcceptId] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadEmergencies();
    // Load user phone/email from auth data
    try {
      const authData = localStorage.getItem('towntask_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        setUserPhone(parsed.profile?.phone || '');
        setUserEmail(parsed.profile?.email || '');
      }
    } catch {}
  }, []);

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const res = await emergencyApi.getMyEmergencies();
      setEmergencies(res.emergencies || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await emergencyApi.resolveEmergency(id);
      await loadEmergencies();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resolve emergency');
    }
  };

  const handleExpand = async (id: string) => {
    try {
      await emergencyApi.expandRadius(id);
      await loadEmergencies();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to expand emergency radius');
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await emergencyApi.acceptEmergency(id);
      toast.success(`Emergency accepted. Exact location: ${res.exactLocation.lat}, ${res.exactLocation.lng}`);
      await loadEmergencies();
    } catch (err: any) {
      // Check if requires instant verification
      const errorData = err.message || '';
      if (errorData.includes('Volunteer verification required') || errorData.includes('volunteer status does not allow')) {
        // Check volunteer status
        try {
          const status = await volunteerApi.getStatus();
          if (status.volunteerStatus === 'NOT_APPLIED' || status.volunteerStatus === 'REJECTED') {
            setPendingAcceptId(id);
            setShowInstantVerification(true);
            return;
          }
          if (status.volunteerStatus === 'TEMP_VERIFIED' && status.tempEmergencyCount >= 2) {
            toast.info('Temp verified limit reached (2/2). Complete full verification for unlimited access.');
            window.location.hash = buildVolunteerRoute();
            return;
          }
        } catch {
          // Fallback — show instant verification
          setPendingAcceptId(id);
          setShowInstantVerification(true);
          return;
        }
      }
      toast.error(err?.message || 'Failed to accept emergency');
    }
  };

  const handleInstantVerificationComplete = async () => {
    setShowInstantVerification(false);
    if (pendingAcceptId) {
      // Retry accept after instant verification
      try {
        const res = await emergencyApi.acceptEmergency(pendingAcceptId);
        toast.success(`Verified and accepted. Location: ${res.exactLocation.lat}, ${res.exactLocation.lng}`);
        await loadEmergencies();
      } catch (err: any) {
        toast.error(err?.message || 'Failed to accept emergency');
      }
      setPendingAcceptId(null);
    }
  };

  const handleCancelVolunteer = async (id: string) => {
    try {
      await emergencyApi.cancelVolunteer(id);
      await loadEmergencies();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel volunteer assignment');
    }
  };

  const handleReportFake = async (id: string) => {
    if (!confirm('Are you sure this emergency is fake? False reports will affect your trust score.')) return;
    try {
      await emergencyApi.reportFake(id);
      await loadEmergencies();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to report emergency');
    }
  };

  const handleSubmitRating = async () => {
    if (!ratingModal) return;
    setRatingSubmitting(true);
    try {
      await ratingApi.submitRating({
        toUser: ratingModal.targetUser,
        emergencyId: ratingModal.emergencyId,
        type: 'emergency',
        ...ratings,
        reviewText,
      });
      setRatingModal(null);
      setReviewText('');
      toast.success('Rating submitted!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Emergencies</h1>
            <p className="text-red-100 text-sm">{emergencies.length} total</p>
          </div>
          <button
            onClick={() => { window.location.hash = buildEmergencyRoute(); }}
            className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30"
          >
            + New Emergency
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {emergencies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No emergencies yet</p>
          </div>
        ) : (
          emergencies.map((e: any) => {
            const status = STATUS_CONFIG[e.status] || STATUS_CONFIG.OPEN;
            const isExpanded = expandedId === e._id;
            const userId = localStorage.getItem('userId') || '';
            const isOwner = e.userId === userId;
            const isVolunteer = e.acceptedBy === userId;

            return (
              <div key={e._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  className="w-full p-4 text-left flex items-center gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : e._id)}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    e.status === 'OPEN' ? 'bg-red-500 animate-pulse' :
                    e.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                    e.status === 'RESOLVED' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.color}`}>
                        {e.type === 'high' ? 'SOS' : 'Priority'} - {status.label}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium truncate capitalize">
                      {e.category?.replace('_', ' ')}
                    </p>
                    <p className="text-gray-500 text-sm truncate">{e.description}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {formatTime(e.createdAt)}
                      {e.currentRadius && (
                        <span className="ml-3">
                          <MapPin className="w-3 h-3 inline mr-1" />{e.currentRadius} km radius
                        </span>
                      )}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    <p className="text-gray-700 text-sm">{e.description}</p>

                    {e.acceptedBy && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          Helper: {e.acceptedBy}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {e.status === 'OPEN' && isOwner && e.type === 'high' && (
                        <button
                          onClick={() => handleExpand(e._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200"
                        >
                          <RefreshCw className="w-4 h-4" /> Expand Radius
                        </button>
                      )}

                      {e.status === 'OPEN' && !isOwner && (
                        <button
                          onClick={() => handleAccept(e._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          <Heart className="w-4 h-4" /> Accept & Help
                        </button>
                      )}

                      {e.status === 'IN_PROGRESS' && isVolunteer && (
                        <button
                          onClick={() => handleCancelVolunteer(e._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                        >
                          <XCircle className="w-4 h-4" /> Cancel My Help
                        </button>
                      )}

                      {(e.status === 'OPEN' || e.status === 'IN_PROGRESS') && (isOwner || isVolunteer) && (
                        <button
                          onClick={() => handleResolve(e._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                        >
                          <CheckCircle className="w-4 h-4" /> Mark Resolved
                        </button>
                      )}

                      {e.status === 'RESOLVED' && (
                        <button
                          onClick={() => setRatingModal({
                            emergencyId: e._id,
                            targetUser: isOwner ? e.acceptedBy : e.userId,
                          })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200"
                        >
                          <Star className="w-4 h-4" /> Rate
                        </button>
                      )}

                      {!isOwner && e.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleReportFake(e._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                        >
                          <Flag className="w-4 h-4" /> Report Fake
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Rate the Experience</h3>

            {['helpfulness', 'behavior', 'safety', 'responseTime'].map((key) => (
              <div key={key} className="mb-3">
                <label className="text-sm font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setRatings({ ...ratings, [key]: n })}
                      className={`w-8 h-8 rounded-full ${
                        n <= (ratings as any)[key] ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a review (optional)..."
              className="w-full h-20 p-3 border rounded-lg resize-none mt-2"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRatingModal(null)}
                className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={ratingSubmitting}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50"
              >
                {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Verification Dialog */}
      {showInstantVerification && (
        <InstantVerificationDialog
          userPhone={userPhone}
          userEmail={userEmail}
          onComplete={handleInstantVerificationComplete}
          onClose={() => {
            setShowInstantVerification(false);
            setPendingAcceptId(null);
          }}
        />
      )}
    </div>
  );
}

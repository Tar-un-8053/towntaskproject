import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Job } from '../../backend';
import { buildJobDetailRoute } from '../../router/routes';
import 'leaflet/dist/leaflet.css';

// Category emoji mapping
const categoryIcons: Record<string, string> = {
  cleaning: '🧹', delivery: '🚚', tutoring: '📚', cooking: '🍳',
  gardening: '🌱', repair: '🔧', painting: '🎨', moving: '📦',
  childcare: '👶', tech: '💻', writing: '✍️', design: '🎯',
  photography: '📸', fitness: '💪', music: '🎵',
};

const getCategoryEmoji = (category: string) => {
  const lower = category.toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lower.includes(key)) return icon;
  }
  return '💼';
};

// Create custom div icon with emoji
const createEmojiIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="font-size:24px;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid #7c3aed;">${emoji}</div>`,
    className: 'custom-emoji-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
  });
};

// Component to auto-fit map bounds
function FitBounds({ jobs }: { jobs: Job[] }) {
  const map = useMap();

  useEffect(() => {
    const jobsWithCoords = jobs.filter(j => j.lat && j.lng);
    if (jobsWithCoords.length === 0) return;

    const bounds = L.latLngBounds(
      jobsWithCoords.map(j => [j.lat!, j.lng!] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [jobs, map]);

  return null;
}

interface JobsMapProps {
  jobs: Job[];
  height?: string;
  selectedJobId?: string;
  onJobSelect?: (jobId: string) => void;
}

export default function JobsMap({ jobs, height = '400px', selectedJobId, onJobSelect }: JobsMapProps) {
  const jobsWithCoords = jobs.filter(j => j.lat && j.lng);

  if (jobsWithCoords.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border bg-muted/30 p-8" style={{ height }}>
        <p className="text-sm text-muted-foreground">No location data available for these jobs.</p>
      </div>
    );
  }

  // Center on India by default
  const center: [number, number] = [22.5, 78.5];

  return (
    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ height }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds jobs={jobsWithCoords} />
        {jobsWithCoords.map((job) => {
          const emoji = getCategoryEmoji(job.category);
          const isSelected = selectedJobId === (job._id || job.id);
          return (
            <Marker
              key={job._id || job.id}
              position={[job.lat!, job.lng!]}
              icon={createEmojiIcon(emoji)}
              eventHandlers={{
                click: () => onJobSelect?.(job._id || job.id || ''),
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>{emoji}</span>
                    <strong style={{ fontSize: '14px', color: '#1a1a2e' }}>{job.title}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    📍 {job.area}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    📂 {job.category}
                  </div>
                  {job.salary && (
                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginBottom: '8px' }}>
                      💰 {job.salary}
                    </div>
                  )}
                  <a
                    href={buildJobDetailRoute(job._id || job.id || '')}
                    style={{
                      display: 'inline-block', padding: '4px 12px', fontSize: '12px',
                      background: '#7c3aed', color: 'white', borderRadius: '6px',
                      textDecoration: 'none', fontWeight: 500,
                    }}
                  >
                    View Details →
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

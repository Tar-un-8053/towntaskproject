const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, default: '' },
  state: { type: String, required: true },
  skills: [{ type: String }],
  description: { type: String, required: true },
  salary: { type: String },
  postedBy: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  lat: { type: Number },
  lng: { type: Number },
  // Geo location for radius search
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  // Service mode
  serviceMode: { type: String, enum: ['in-person', 'online', 'both'], default: 'in-person' },
}, { timestamps: true });

// Enable text search on title, category, area, state
jobSchema.index({ title: 'text', category: 'text', area: 'text', city: 'text', state: 'text', skills: 'text' });
jobSchema.index({ state: 1 });
jobSchema.index({ city: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ city: 1, skills: 1 });
jobSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Job', jobSchema);

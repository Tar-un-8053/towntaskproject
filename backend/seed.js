const Profile = require('./models/Profile');
const Job = require('./models/Job');

const seedData = async () => {
  // Check if data already exists
  const jobCount = await Job.countDocuments();
  if (jobCount > 0) {
    console.info(`📦 Database already has ${jobCount} jobs — skipping seed`);
    return;
  }

  console.info('🌱 Seeding database with sample data...');

  // Sample providers
  const providers = [
    { userId: 'provider-1', name: 'Rajesh Kumar', email: 'rajesh@example.com', area: 'Connaught Place, Delhi', profileType: 'provider' },
    { userId: 'provider-2', name: 'Priya Sharma', email: 'priya@example.com', area: 'Koramangala, Bangalore', profileType: 'provider' },
    { userId: 'provider-3', name: 'Amit Patel', email: 'amit@example.com', area: 'Andheri, Mumbai', profileType: 'provider' },
    { userId: 'provider-4', name: 'Sneha Gupta', email: 'sneha@example.com', area: 'Sector 62, Noida', profileType: 'provider' },
    { userId: 'provider-5', name: 'Vikram Singh', email: 'vikram@example.com', area: 'Banjara Hills, Hyderabad', profileType: 'provider' },
  ];

  // Sample workers
  const workers = [
    { userId: 'worker-1', name: 'Suresh Yadav', email: 'suresh@example.com', area: 'Laxmi Nagar, Delhi', profileType: 'worker' },
    { userId: 'worker-2', name: 'Meena Kumari', email: 'meena@example.com', area: 'HSR Layout, Bangalore', profileType: 'worker' },
  ];

  await Profile.insertMany([...providers, ...workers]);

  // Sample Jobs with coordinates and states
  const sampleJobs = [
    { title: 'House Cleaning - 3BHK Apartment', category: 'Cleaning', area: 'Connaught Place, Delhi', state: 'Delhi', description: 'Need an experienced cleaner for a 3BHK apartment. Deep cleaning required including kitchen, bathrooms, and all rooms. Must bring own cleaning supplies. Weekly recurring job available for the right candidate.', postedBy: 'provider-1', salary: '₹800/day', lat: 28.6315, lng: 77.2167 },
    { title: 'Food Delivery Partner', category: 'Delivery', area: 'Koramangala, Bangalore', state: 'Karnataka', description: 'Looking for a reliable delivery partner for our home-cooked food business. Must have own two-wheeler and valid driving license. Delivery within 5km radius. Flexible timing - lunch and dinner shifts available.', postedBy: 'provider-2', salary: '₹15,000/month', lat: 12.9352, lng: 77.6245 },
    { title: 'Mathematics Tutor for Class 10', category: 'Tutoring', area: 'Andheri, Mumbai', state: 'Maharashtra', description: 'Need an experienced math tutor for Class 10 CBSE student. Must be proficient in algebra, geometry, and trigonometry. Classes 3 times a week, 1.5 hours each session. Board exam preparation focus required.', postedBy: 'provider-3', salary: '₹500/hour', lat: 19.1197, lng: 72.8464 },
    { title: 'Garden Maintenance & Landscaping', category: 'Gardening', area: 'Sector 62, Noida', state: 'Uttar Pradesh', description: 'Looking for a skilled gardener for weekly maintenance of a 2000 sq ft garden. Tasks include pruning, mowing, watering, pest control, and seasonal planting. Experience with flower beds and lawn care preferred.', postedBy: 'provider-4', salary: '₹600/day', lat: 28.6270, lng: 77.3654 },
    { title: 'Full Stack Web Developer (Freelance)', category: 'Tech', area: 'Banjara Hills, Hyderabad', state: 'Telangana', description: 'Need a freelance full stack developer for a 3-month e-commerce project. Must know React, Node.js, MongoDB. Remote work with weekly in-person meetings. Portfolio and previous project links required.', postedBy: 'provider-5', salary: '₹50,000/month', lat: 17.4156, lng: 78.4347 },
    { title: 'Cook for Small Restaurant', category: 'Cooking', area: 'Lajpat Nagar, Delhi', state: 'Delhi', description: 'Hiring an experienced North Indian cook for a small family restaurant. Must be skilled in preparing dal, sabzi, roti, rice dishes and basic Chinese. Lunch and dinner shifts. Hygiene standards are a must.', postedBy: 'provider-1', salary: '₹18,000/month', lat: 28.5700, lng: 77.2370 },
    { title: 'Electrician for Office Wiring', category: 'Repair', area: 'MG Road, Bangalore', state: 'Karnataka', description: 'Need a licensed electrician for complete wiring of a new 1500 sq ft office space. Work includes laying new cables, installing switches, fans, lights and AC points. Must have experience with commercial wiring.', postedBy: 'provider-2', salary: '₹1,200/day', lat: 12.9716, lng: 77.6071 },
    { title: 'Babysitter / Nanny (Part-time)', category: 'Childcare', area: 'Powai, Mumbai', state: 'Maharashtra', description: 'Looking for a caring and experienced babysitter for a 3-year-old. Monday to Friday, 9 AM to 2 PM. Must know basic first aid and be comfortable with toddlers. References required. Long-term position.', postedBy: 'provider-3', salary: '₹10,000/month', lat: 19.1176, lng: 72.9060 },
    { title: 'Graphic Designer for Social Media', category: 'Design', area: 'Sector 62, Noida', state: 'Uttar Pradesh', description: 'Need a creative graphic designer to create social media posts, stories, and banners for an online clothing brand. Must know Canva/Photoshop/Illustrator. 15-20 designs per month. Work from home option available.', postedBy: 'provider-4', salary: '₹12,000/month', lat: 28.6292, lng: 77.3650 },
    { title: 'Plumber - Bathroom Renovation', category: 'Repair', area: 'Jubilee Hills, Hyderabad', state: 'Telangana', description: 'Experienced plumber needed for complete bathroom renovation. Work includes removing old fittings, new pipe laying, installing shower, basin, toilet and water heater. Must have own tools. 5-day project.', postedBy: 'provider-5', salary: '₹1,500/day', lat: 17.4325, lng: 78.4073 },
    { title: 'Photography - Wedding Event', category: 'Photography', area: 'Connaught Place, Delhi', state: 'Delhi', description: 'Looking for a professional wedding photographer for a 2-day event. Must have DSLR camera, experience with Indian wedding photography, and ability to deliver edited photos within 2 weeks. Portfolio needed.', postedBy: 'provider-1', salary: '₹25,000/event', lat: 28.6328, lng: 77.2197 },
    { title: 'Packers & Movers Helper', category: 'Moving', area: 'Whitefield, Bangalore', state: 'Karnataka', description: 'Need 3-4 strong helpers for house shifting from Whitefield to Electronic City. Must help with packing, loading, unloading and arranging furniture. One day job. Transportation provided.', postedBy: 'provider-2', salary: '₹700/person/day', lat: 12.9698, lng: 77.7500 },
    { title: 'Yoga Instructor (Morning Batch)', category: 'Fitness', area: 'Juhu, Mumbai', state: 'Maharashtra', description: 'Looking for a certified yoga instructor for morning batch (6-7 AM) in a residential society. Must teach basic to intermediate yoga asanas, pranayama and meditation. Group of 10-15 members. 6 days a week.', postedBy: 'provider-3', salary: '₹20,000/month', lat: 19.1075, lng: 72.8263 },
    { title: 'Content Writer - Hindi & English', category: 'Writing', area: 'Sector 18, Noida', state: 'Uttar Pradesh', description: 'Hiring a bilingual content writer for our news portal. Must write 3-4 articles daily in Hindi and English. Topics include local news, lifestyle, and tech reviews. SEO knowledge preferred. Work from office.', postedBy: 'provider-4', salary: '₹15,000/month', lat: 28.5706, lng: 77.3218 },
    { title: 'AC Repair & Service Technician', category: 'Repair', area: 'Gachibowli, Hyderabad', state: 'Telangana', description: 'Need an experienced AC technician for servicing and repairing split & window ACs across residential apartments. Must know all major brands. Own tools required. Can be ongoing weekly work.', postedBy: 'provider-5', salary: '₹900/service', lat: 17.4401, lng: 78.3489 },
    { title: 'Home Painting - 2BHK Flat', category: 'Painting', area: 'Dwarka, Delhi', state: 'Delhi', description: 'Need a professional painter for interior painting of a 2BHK flat. Includes walls, ceiling and woodwork. Asian Paints or equivalent quality required. Must bring own tools and helpers. 4-5 day job.', postedBy: 'provider-1', salary: '₹15,000 (total)', lat: 28.5921, lng: 77.0460 },
    { title: 'Music Teacher - Guitar Lessons', category: 'Music', area: 'Indiranagar, Bangalore', state: 'Karnataka', description: 'Looking for a guitar teacher for a beginner adult learner. Acoustic guitar, basic chords, strumming patterns, and simple songs. 2 classes per week, 1 hour each. Weekday evenings preferred.', postedBy: 'provider-2', salary: '₹600/class', lat: 12.9784, lng: 77.6408 },
    { title: 'Data Entry Operator (Part-time)', category: 'Tech', area: 'Bandra, Mumbai', state: 'Maharashtra', description: 'Need a data entry operator for entering product catalog data into our system. Must have fast typing speed (40+ WPM) and attention to detail. 4 hours/day, Monday to Saturday. Laptop will be provided.', postedBy: 'provider-3', salary: '₹8,000/month', lat: 19.0596, lng: 72.8295 },
    // Additional jobs for more states
    { title: 'Carpenter - Furniture Repair', category: 'Repair', area: 'C-Scheme, Jaipur', state: 'Rajasthan', description: 'Need an experienced carpenter for repairing and polishing old wooden furniture. 3-4 pieces including a bed, wardrobe, and dining table. Must bring own tools. Prefer someone with 5+ years experience.', postedBy: 'provider-1', salary: '₹1,000/day', lat: 26.9124, lng: 75.7873 },
    { title: 'Tailor - Blouse Stitching', category: 'Design', area: 'Vastrapur, Ahmedabad', state: 'Gujarat', description: 'Looking for an experienced tailor for stitching designer blouses and suits. Must handle delicate fabrics. Ongoing orders available. Can work from own shop or our place.', postedBy: 'provider-2', salary: '₹400/piece', lat: 23.0394, lng: 72.5302 },
    { title: 'Private Driver - Daily Commute', category: 'Delivery', area: 'Salt Lake, Kolkata', state: 'West Bengal', description: 'Need a reliable driver for daily office commute (Salt Lake to Park Street). Monday to Saturday, 8:30 AM and 6 PM. Must have valid commercial license. Own car not required.', postedBy: 'provider-3', salary: '₹12,000/month', lat: 22.5804, lng: 88.4217 },
    { title: 'House Painting - Full Villa', category: 'Painting', area: 'Anna Nagar, Chennai', state: 'Tamil Nadu', description: 'Need painters for exterior and interior painting of a 3-story villa. Approximately 4000 sq ft total area. Weather-proof paint for exterior. Team of 3-4 painters required. 10-12 day project.', postedBy: 'provider-4', salary: '₹45,000 (total)', lat: 13.0850, lng: 80.2101 },
    { title: 'Tutor - Science Class 8-10', category: 'Tutoring', area: 'Aliganj, Lucknow', state: 'Uttar Pradesh', description: 'Need a science tutor for two students (class 8 and 10). Physics, Chemistry and Biology. 5 days a week, 2 hours per day. Must be B.Sc/M.Sc qualified. Board exam focus.', postedBy: 'provider-5', salary: '₹8,000/month', lat: 26.8900, lng: 80.9400 },
    { title: 'Event Photographer - Corporate', category: 'Photography', area: 'Viman Nagar, Pune', state: 'Maharashtra', description: 'Professional photographer needed for a corporate annual day event. Full day coverage, edited photos in 5 days. Must have professional camera equipment and previous corporate event experience.', postedBy: 'provider-1', salary: '₹15,000/event', lat: 18.5679, lng: 73.9143 },
    { title: 'Cleaning Service - Office Space', category: 'Cleaning', area: 'Gomti Nagar, Lucknow', state: 'Uttar Pradesh', description: 'Daily office cleaning for a 2000 sq ft coworking space. Tasks: sweeping, mopping, dusting, washroom cleaning. Morning shift 7-9 AM. Must be punctual and thorough.', postedBy: 'provider-4', salary: '₹7,000/month', lat: 26.8467, lng: 81.0040 },
    { title: 'Delivery Executive - E-commerce', category: 'Delivery', area: 'Hinjewadi, Pune', state: 'Maharashtra', description: 'Need delivery executives for e-commerce package delivery in Pune West area. Must have own bike, smartphone, and valid license. Per-package payment with daily minimum guarantee.', postedBy: 'provider-3', salary: '₹18,000/month', lat: 18.5912, lng: 73.7390 },
    { title: 'Mehendi Artist - Wedding Season', category: 'Design', area: 'Malviya Nagar, Jaipur', state: 'Rajasthan', description: 'Looking for experienced mehendi artists for the wedding season. Must know bridal and Arabic designs. Multiple bookings available from December to March. Portfolio required.', postedBy: 'provider-5', salary: '₹3,000/booking', lat: 26.8575, lng: 75.8082 },
    { title: 'Security Guard - Night Shift', category: 'Moving', area: 'Electronic City, Bangalore', state: 'Karnataka', description: 'Need a reliable security guard for night shift (10 PM - 6 AM) at a residential apartment complex. Must be physically fit. Previous security experience preferred. Uniform provided.', postedBy: 'provider-2', salary: '₹14,000/month', lat: 12.8456, lng: 77.6603 },
    { title: 'Cook - Tiffin Service', category: 'Cooking', area: 'Adyar, Chennai', state: 'Tamil Nadu', description: 'Seeking an experienced South Indian cook for a home tiffin service. Must prepare idli, dosa, vada, sambar, chutney and rice items. Morning batch 6-10 AM. Consistent quality is essential.', postedBy: 'provider-4', salary: '₹15,000/month', lat: 13.0012, lng: 80.2565 },
    { title: 'Plumber - New Construction', category: 'Repair', area: 'New Town, Kolkata', state: 'West Bengal', description: 'Experienced plumber needed for pipeline fitting in a newly constructed 4BHK flat. Complete bathroom and kitchen plumbing work. Must have minimum 5 years experience. 7-day project.', postedBy: 'provider-3', salary: '₹1,200/day', lat: 22.5958, lng: 88.4794 },
    { title: 'Fitness Trainer - Home Visits', category: 'Fitness', area: 'Navrangpura, Ahmedabad', state: 'Gujarat', description: 'Personal fitness trainer needed for home workouts. 5 days a week, 1 hour each session (6-7 AM). Must be certified. Focus on weight loss and basic strength training. Client is a 35-year-old beginner.', postedBy: 'provider-2', salary: '₹10,000/month', lat: 23.0374, lng: 72.5604 },
  ];

  await Job.insertMany(sampleJobs.map(j => ({
    ...j,
    status: 'open',
    serviceMode: 'in-person',
    location: j.lat && j.lng ? { type: 'Point', coordinates: [j.lng, j.lat] } : undefined,
  })));

  // Update provider/worker profiles with geo locations for smart search
  const profileLocations = {
    'provider-1': { lat: 28.6315, lng: 77.2167 },  // Delhi
    'provider-2': { lat: 12.9352, lng: 77.6245 },  // Bangalore
    'provider-3': { lat: 19.1197, lng: 72.8464 },  // Mumbai
    'provider-4': { lat: 28.6270, lng: 77.3654 },  // Noida
    'provider-5': { lat: 17.4156, lng: 78.4347 },  // Hyderabad
    'worker-1':   { lat: 28.5700, lng: 77.2500 },  // Delhi
    'worker-2':   { lat: 12.9100, lng: 77.6400 },  // Bangalore
  };
  for (const [uid, loc] of Object.entries(profileLocations)) {
    await Profile.updateOne({ userId: uid }, {
      $set: { lat: loc.lat, lng: loc.lng, location: { type: 'Point', coordinates: [loc.lng, loc.lat] } }
    });
  }

  console.info(`📦 Seeded ${sampleJobs.length} jobs and ${providers.length + workers.length} profiles into MongoDB`);
};

module.exports = seedData;

TownTask - Hyperlocal Marketplace Platform
A MERN stack (MongoDB, Express, React, Node.js) application that connects skilled workers with people who need tasks done in their local area. The platform features automatic radius expansion for job visibility and real-time communication via Socket.io.

📋 Project Structure
Backend (/Backend)
Models (src/models/)
User.js: User accounts with role (poster/worker), skills, location, rating
Job.js: Task postings with location, skills required, expansion tracking
Proposal.js: Worker bids on jobs with price and delivery time
Message.js: Real-time messages between workers/posters for specific jobs
Review.js: Ratings and reviews after job completion
Controllers (src/controllers/)
jobController.js: CRUD operations + expansion logic for proximity-based job visibility
proposalController.js: Worker proposal management (bid, accept, reject, withdraw)
chatController.js: Real-time messaging, conversation management
userController.js: User profile and authentication
authController.js: Login, registration, JWT tokens
Routes (src/routes/)
/api/jobs - Job posting and discovery
/api/proposals - Worker proposals/bidding system
/api/chat - Real-time messaging
/api/auth - Authentication
/api/users - User profiles
Key Features
Proximity-Based Matching: Jobs initially visible only in posting city (15km radius)
Auto Expansion: If no proposals within timeframe, radius expands: 15km → 25km → 40km → 60km
Geospatial Indexing: MongoDB 2dsphere indexes for fast location queries
Real-time Chat: Socket.io integration for live messages between workers and posters
Proposal System: Workers bid on jobs; posters review and select workers
Frontend (/frontend)
Components
auth/RoleSelection.jsx: User chooses Poster or Worker role
auth/SkillSelection.jsx: Workers select their skills
auth/LocationVerification.jsx: Users verify city and address
auth/ProfileSetup.jsx: Final onboarding step with bio/portfolio
Dashboard.jsx: Main dashboard showing jobs/proposals based on role
Key Features
Multi-step onboarding flow with progress tracking
Professional Tailwind CSS styling
Dynamic role-based views (Poster vs Worker)
Profile completion percentage
Job feed and proposal management
🚀 Getting Started
Backend Setup
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables
# MONGODB_URI=mongodb://localhost:27017/towntask
# JWT_SECRET=your_jwt_secret_key
# FRONTEND_URL=http://localhost:3000

# Start development server
npm run dev

# Start production server
npm start
Frontend Setup
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
📦 API Endpoints
Jobs
POST /api/jobs - Create new job
GET /api/jobs/available/for-me - Get available jobs for worker
GET /api/jobs/my-jobs/list - Get user's posted jobs
GET /api/jobs/:id - Get job details with proposals
PUT /api/jobs/:id - Update job
DELETE /api/jobs/:id - Delete job
POST /api/jobs/:id/expand-radius - Expand job visibility
POST /api/jobs/:id/complete - Mark job as completed
Proposals
POST /api/proposals - Submit proposal (worker bids)
GET /api/proposals/job/:jobId - Get proposals for a job
GET /api/proposals/my-proposals/list - Get user's proposals
POST /api/proposals/:proposalId/accept - Accept proposal (assign job)
POST /api/proposals/:proposalId/reject - Reject proposal
POST /api/proposals/:proposalId/withdraw - Withdraw proposal
Chat
POST /api/chat - Send message
GET /api/chat/job/:jobId - Get job conversation
GET /api/chat/conversation/:jobId/:otherUserId - Get direct conversation
PUT /api/chat/:messageId/read - Mark message as read
DELETE /api/chat/:messageId - Delete message
🔧 Database Schema
User
{
  name, email, mobile, password,
  userRole: 'poster' | 'worker',
  city, address, location: { type: Point, coordinates },
  skills: ['Cleaning', 'Repair', ...],
  bio, portfolio: [urls],
  rating, reviewCount,
  profileCompletion: { basicInfo, location, skills, verification, portfolio }
}
Job
{
  posterId, title, description, category,
  requiredSkills: ['Cleaning', ...],
  city, location: { type: Point, coordinates, address },
  budget, budgetType: 'fixed' | 'hourly',
  estimatedDuration, deadline,
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
  isExpanded, currentRadius: 15 | 25 | 40 | 60,
  expansionHistory: [{ radius, expandedAt }],
  visibleCities: ['CityName', ...]
}
Proposal
{
  jobId, workerId,
  proposedPrice, deliveryDays,
  description, attachments: [urls],
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
  acceptedAt, rejectedAt
}
Message
{
  jobId, senderId, receiverId,
  message, messageType: 'text' | 'image' | 'file',
  attachmentUrl, isRead, readAt
}
🔄 Job Expansion Logic (Core Feature)
When a job is posted:

Initially: Visible only in posting city (15km radius)
After 15 minutes (if no proposals): Expand to 25km + neighboring cities
After 30 minutes (if no proposals): Expand to 40km
After 45 minutes (if no proposals): Expand to 60km (max radius)
If proposals are received at any point, expansion stops.

🔌 Real-time Features (Socket.io)
Events
newJobAvailable - Broadcast new job to nearby workers
jobStatusChange - Update job status
proposalReceived - Notify poster of new proposal
sendDirectMessage - Send direct message
receiveDirectMessage - Receive direct message
🛠️ Technology Stack
Backend
Express.js - Web framework
MongoDB - NoSQL database
Mongoose - ODM
Socket.io - Real-time communication
JWT - Authentication
bcryptjs - Password hashing
CORS - Cross-origin requests
Frontend
React - UI library
React Router - Navigation
Tailwind CSS - Styling
Axios - HTTP client
Socket.io-client - Real-time client
📝 .env Configuration
Backend
MONGODB_URI=mongodb://localhost:27017/towntask
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
Frontend
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
🚀 Deployment
Backend (Heroku/Railway)
git push heroku main
Frontend (Vercel/Netlify)
npm run build
# Deploy the dist/ folder
📈 Performance Optimization
Geospatial Indexes: MongoDB 2dsphere indexes on location fields
Pagination: Limit jobs to 50 per query
Caching: Socket.io rooms for efficient real-time updates
Lazy Loading: Load jobs/proposals on demand
🔐 Security
JWT tokens for authentication
Password hashing with bcryptjs
CORS enabled only for frontend origin
Input validation on all routes
Authorization checks on protected endpoints
📚 Future Enhancements
 Payment integration (Stripe)
 Email notifications
 Video verification for workers
 Advanced search filters (rating, reviews)
 Dispute resolution system
 Insurance/Protection for both parties
 Mobile app using React Native
 Advanced analytics dashboard
 Machine learning for job recommendations
🤝 Contributing
Create a feature branch
Commit changes
Push to branch
Open a pull request
📄 License
ISC License

📞 Support
For issues or questions, please open a GitHub issue.

Built with ❤️ for the TownTask community

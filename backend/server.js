require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { Server } = require('socket.io');
const path = require('path');

// Import Models
const Profile = require('./models/Profile');
const Job = require('./models/Job');
const Application = require('./models/Application');
const ChatMessage = require('./models/ChatMessage');
const EmergencyPost = require('./models/EmergencyPost');
const VolunteerVerification = require('./models/VolunteerVerification');
const Rating = require('./models/Rating');
const Feedback = require('./models/Feedback');
const seedData = require('./seed');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || '*';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/towntask';
const corsOrigin = FRONTEND_ORIGIN === '*' ? true : FRONTEND_ORIGIN;

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
}

// ===== EMAIL SETUP (Nodemailer) =====
// Using Ethereal for dev — replace with Gmail/SendGrid in production
let emailTransporter = null;

async function setupEmail() {
  try {
    // Try environment variables first (for real email)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      emailTransporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      console.info(`📧 Email configured with ${process.env.EMAIL_USER}`);
    } else {
      // Fallback: create Ethereal test account (free, no signup needed)
      const testAccount = await nodemailer.createTestAccount();
      emailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.info(`📧 Dev email configured (Ethereal): ${testAccount.user}`);
      console.info(`📧 View sent emails at: https://ethereal.email/login`);
    }
  } catch (err) {
    console.warn('⚠️ Email setup failed, OTP will only be logged to console:', err.message);
  }
}

async function sendOtpEmail(toEmail, otp, userName) {
  if (!emailTransporter || !toEmail) return null;
  try {
    const info = await emailTransporter.sendMail({
      from: '"Towntask" <noreply@towntask.app>',
      to: toEmail,
      subject: `Your OTP Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">🛡️ Towntask</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #334155; font-size: 16px;">Hi${userName ? ' ' + userName : ''},</p>
            <p style="color: #334155; font-size: 16px;">Your verification code is:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af; background: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 2px dashed #93c5fd;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px;">This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.info(`📧 OTP email preview: ${previewUrl}`);
      return previewUrl;
    } else {
      console.info(`📧 OTP email sent to ${toEmail}`);
      return 'sent';
    }
  } catch (err) {
    console.warn(`⚠️ Failed to send OTP email to ${toEmail}:`, err.message);
    return null;
  }
}

async function sendLoginSuccessEmail(toEmail, userName, loginMethod) {
  if (!emailTransporter || !toEmail) return;
  try {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const info = await emailTransporter.sendMail({
      from: '"Towntask" <noreply@towntask.app>',
      to: toEmail,
      subject: '✅ Successful Login — Towntask',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">🛡️ Towntask</h1>
          </div>
          <div style="background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #334155; font-size: 16px;">Hi ${userName || 'there'},</p>
            <p style="color: #334155; font-size: 16px;">You've successfully signed in to your Towntask account! 🎉</p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #166534; font-size: 14px;">
                <strong>✅ Login Details</strong><br/>
                📅 Time: ${now}<br/>
                🔐 Method: ${loginMethod || 'OTP'}<br/>
              </p>
            </div>
            <p style="color: #64748b; font-size: 14px;">If this wasn't you, please secure your account immediately.</p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 16px;">Thank you for using Towntask — Connecting communities, one job at a time.</p>
        </div>
      `,
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.info(`📧 Login email preview: ${previewUrl}`);
    else console.info(`📧 Login success email sent to ${toEmail}`);
  } catch (err) {
    console.warn(`⚠️ Failed to send login email to ${toEmail}:`, err.message);
  }
}

setupEmail();

// ===== IN-MEMORY OTP STORE =====
const otpStore = new Map(); // phone -> { otp, expiresAt, name?, email?, profileType? }

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getRequestUserId(req) {
  return req.headers['x-user-id'] || null;
}

async function getChatContextForUser(userId, applicationId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(applicationId)) {
    return null;
  }

  const application = await Application.findById(applicationId).lean();
  if (!application || application.status !== 'accepted') {
    return null;
  }

  const job = await Job.findById(application.jobId).lean();
  if (!job) {
    return null;
  }

  const participants = [application.applicant, job.postedBy];
  if (!participants.includes(userId)) {
    return null;
  }

  return {
    application,
    job,
    counterpartId: application.applicant === userId ? job.postedBy : application.applicant,
  };
}

async function emitUnreadCount(userId) {
  if (!userId) return 0;
  const count = await ChatMessage.countDocuments({
    receiverId: userId,
    readBy: { $ne: userId },
  });
  io.to(`user:${userId}`).emit('chat_unread_count', { count });
  return count;
}

async function createChatMessageForApplication({ userId, applicationId, message }) {
  const trimmedMessage = (message || '').trim();
  if (!trimmedMessage) {
    throw new Error('Message cannot be empty');
  }

  const context = await getChatContextForUser(userId, applicationId);
  if (!context) {
    throw new Error('Chat is only available for accepted proposals');
  }

  const savedMessage = await ChatMessage.create({
    applicationId: context.application._id,
    senderId: userId,
    receiverId: context.counterpartId,
    message: trimmedMessage,
    readBy: [userId],
  });

  const payload = {
    _id: savedMessage._id,
    applicationId: savedMessage.applicationId,
    senderId: savedMessage.senderId,
    receiverId: savedMessage.receiverId,
    message: savedMessage.message,
    createdAt: savedMessage.createdAt,
    updatedAt: savedMessage.updatedAt,
  };

  io.to(`chat:${String(context.application._id)}`).emit('chat_message', payload);
  await emitUnreadCount(context.counterpartId);

  return payload;
}

io.use((socket, next) => {
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  if (!userId || typeof userId !== 'string') {
    return next(new Error('Authentication required'));
  }
  socket.data.userId = userId;
  return next();
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);
  emitUnreadCount(userId).catch(() => null);

  socket.on('join_chat', async ({ applicationId }) => {
    const context = await getChatContextForUser(userId, applicationId);
    if (!context) {
      socket.emit('chat_error', { error: 'You do not have access to this chat' });
      return;
    }
    socket.join(`chat:${String(context.application._id)}`);
  });

  socket.on('leave_chat', ({ applicationId }) => {
    if (applicationId) {
      socket.leave(`chat:${applicationId}`);
    }
  });

  socket.on('send_message', async ({ applicationId, message }, ack) => {
    try {
      const payload = await createChatMessageForApplication({
        userId,
        applicationId,
        message,
      });
      if (typeof ack === 'function') {
        ack({ success: true, message: payload });
      }
    } catch (err) {
      if (typeof ack === 'function') {
        ack({ success: false, error: err.message || 'Failed to send message' });
      }
    }
  });
});

// ===== AUTH ROUTES =====

// Send OTP (for both signin & signup)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const otp = generateOTP();
    otpStore.set(phone, {
      ...(otpStore.get(phone) || {}),
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    console.info(`📱 OTP for ${phone}: ${otp}`);

    // Check if user has email on file
    const existingProfile = await Profile.findOne({ phone });
    const userEmail = existingProfile?.email || null;
    const maskedPhone = phone.slice(0, 2) + '****' + phone.slice(-4);
    const maskedEmail = userEmail ? userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null;

    // Send OTP via email
    let emailPreviewUrl = null;
    if (userEmail) {
      emailPreviewUrl = await sendOtpEmail(userEmail, otp, existingProfile?.name);
    }

    res.json({
      success: true,
      message: `OTP sent to ${maskedPhone}${maskedEmail ? ' and ' + maskedEmail : ''}`,
      sentTo: { phone: maskedPhone, email: maskedEmail },
      ...(process.env.NODE_ENV !== 'production' && { otp }),
      ...(emailPreviewUrl && emailPreviewUrl !== 'sent' && { emailPreviewUrl }),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const stored = otpStore.get(phone);

    if (!stored || !stored.otp) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // OTP verified — check if user exists
    let profile = await Profile.findOne({ phone });
    const isNewUser = !profile;

    if (isNewUser && stored.name) {
      // Create profile from signup data
      const userId = 'user-' + phone;
      const crypto = require('crypto');
      const hashedPassword = stored.password ? crypto.createHash('sha256').update(stored.password).digest('hex') : '';
      profile = await Profile.findOneAndUpdate(
        { userId },
        {
          userId,
          name: stored.name,
          email: stored.email || '',
          phone,
          area: stored.area || '',
          city: stored.area || '',
          profileType: stored.profileType || 'worker',
          password: hashedPassword,
        },
        { upsert: true, new: true, runValidators: true }
      );
    }

    // Clear OTP
    otpStore.delete(phone);

    const userId = profile ? profile.userId : 'user-' + phone;

    // Send login success email
    if (profile?.email) {
      sendLoginSuccessEmail(profile.email, profile.name, isNewUser ? 'Sign Up (OTP)' : 'OTP');
    }

    res.json({
      success: true,
      isNewUser,
      userId,
      profile: profile || null,
      volunteerStatus: profile?.volunteerStatus || 'NOT_APPLIED',
      token: Buffer.from(JSON.stringify({ userId, phone, ts: Date.now() })).toString('base64'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Signup - store pending data, send OTP
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, phone, email, area, profileType, password } = req.body;

    if (!name || !phone || phone.length < 10) {
      return res.status(400).json({ error: 'Name and valid phone number are required' });
    }

    // Check if phone already registered
    const existing = await Profile.findOne({ phone });
    if (existing) {
      return res.status(409).json({ error: 'Phone number already registered. Please sign in.' });
    }

    const otp = generateOTP();
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      name,
      email,
      area,
      profileType,
      password,
    });

    console.info(`📱 Signup OTP for ${phone}: ${otp}`);

    const maskedPhone = phone.slice(0, 2) + '****' + phone.slice(-4);
    const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null;

    // Send OTP via email
    let emailPreviewUrl = null;
    if (email) {
      emailPreviewUrl = await sendOtpEmail(email, otp, name);
    }

    res.json({
      success: true,
      message: `OTP sent to ${maskedPhone}${maskedEmail ? ' and ' + maskedEmail : ''}`,
      sentTo: { phone: maskedPhone, email: maskedEmail },
      ...(process.env.NODE_ENV !== 'production' && { otp }),
      ...(emailPreviewUrl && emailPreviewUrl !== 'sent' && { emailPreviewUrl }),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }

    const profile = await Profile.findOne({ phone });
    if (!profile) {
      return res.status(404).json({ error: 'No account found with this number. Please sign up first.' });
    }

    const otp = generateOTP();
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.info(`📱 Signin OTP for ${phone}: ${otp}`);

    const maskedPhone = phone.slice(0, 2) + '****' + phone.slice(-4);
    const maskedEmail = profile.email ? profile.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null;

    // Send OTP via email
    let emailPreviewUrl = null;
    if (profile.email) {
      emailPreviewUrl = await sendOtpEmail(profile.email, otp, profile.name);
    }

    res.json({
      success: true,
      hasPassword: !!profile.password,
      message: `OTP sent to ${maskedPhone}${maskedEmail ? ' and ' + maskedEmail : ''}`,
      sentTo: { phone: maskedPhone, email: maskedEmail },
      ...(process.env.NODE_ENV !== 'production' && { otp }),
      ...(emailPreviewUrl && emailPreviewUrl !== 'sent' && { emailPreviewUrl }),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Signin with password
app.post('/api/auth/signin-password', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const profile = await Profile.findOne({ phone });
    if (!profile) {
      return res.status(404).json({ error: 'No account found with this number. Please sign up first.' });
    }
    if (!profile.password) {
      return res.status(400).json({ error: 'Password not set. Please use OTP login and create a password from your profile.' });
    }

    // Simple comparison (use bcrypt in production)
    const crypto = require('crypto');
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
    if (profile.password !== hashedInput) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const userId = profile.userId;

    // Send login success email
    if (profile.email) {
      sendLoginSuccessEmail(profile.email, profile.name, 'Password');
    }

    res.json({
      success: true,
      userId,
      profile,
      volunteerStatus: profile.volunteerStatus || 'NOT_APPLIED',
      token: Buffer.from(JSON.stringify({ userId, phone, ts: Date.now() })).toString('base64'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set / Update password
app.post('/api/auth/set-password', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(password).digest('hex');

    await Profile.findOneAndUpdate({ userId }, { password: hashed });
    res.json({ success: true, message: 'Password created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== PROFILE ROUTES =====

// Get caller profile
app.get('/api/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const profile = await Profile.findOne({ userId });
    res.json({ profile: profile || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get any profile by principal
app.get('/api/profile/:principal', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.principal });
    res.json({ profile: profile || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save caller profile
app.post('/api/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const payload = { ...req.body, userId };
    if (!payload.city && payload.area) {
      payload.city = payload.area;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      payload,
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.json({ profiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get caller user role
app.get('/api/role', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const profile = await Profile.findOne({ userId });
    res.json({ role: profile?.profileType || 'worker' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== JOB ROUTES =====

// Create job
app.post('/api/jobs', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(400).json({ error: 'Profile required' });
    }
    if (profile.profileType !== 'provider') {
      return res.status(403).json({ error: 'Only providers can create jobs' });
    }

    const normalizedArea = (req.body.area || '').trim();
    const normalizedCity = (req.body.city || normalizedArea).trim();
    const normalizedSkills = Array.isArray(req.body.skills)
      ? req.body.skills.filter((skill) => typeof skill === 'string' && skill.trim()).map((skill) => skill.trim())
      : [];

    const job = await Job.create({
      ...req.body,
      area: normalizedArea,
      city: normalizedCity,
      state: req.body.state || normalizedCity || 'Unknown',
      skills: normalizedSkills,
      postedBy: userId,
      status: 'open',
      salary: req.body.salary || null,
    });

    res.json({ success: true, jobId: job._id, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search jobs
app.get('/api/jobs/search', async (req, res) => {
  try {
    const { area, city, title, category, skills, state } = req.query;
    const filter = {};

    if (area) filter.area = { $regex: area, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (skills) {
      const skillList = String(skills)
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map((skill) => new RegExp(skill, 'i'));
      if (skillList.length > 0) {
        filter.skills = { $in: skillList };
      }
    }
    if (state) filter.state = { $regex: `^${state}$`, $options: 'i' };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ANALYTICS ROUTES =====

// State-wise job analytics
app.get('/api/analytics/state-wise', async (req, res) => {
  try {
    const stateStats = await Job.aggregate([
      {
        $group: {
          _id: '$state',
          totalJobs: { $sum: 1 },
          openJobs: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          categories: { $push: '$category' },
        }
      },
      { $sort: { totalJobs: -1 } }
    ]);

    // Process categories to get counts
    const result = stateStats.map(s => {
      const catCount = {};
      s.categories.forEach(c => { catCount[c] = (catCount[c] || 0) + 1; });
      const categories = Object.entries(catCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
      return {
        state: s._id,
        totalJobs: s.totalJobs,
        openJobs: s.openJobs,
        categories,
        topCategory: categories[0]?.category || 'N/A',
      };
    });

    res.json({ analytics: result, totalStates: result.length, totalJobs: result.reduce((a, b) => a + b.totalJobs, 0) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Category-wise analytics
app.get('/api/analytics/category-wise', async (req, res) => {
  try {
    const catStats = await Job.aggregate([
      {
        $group: {
          _id: '$category',
          totalJobs: { $sum: 1 },
          states: { $addToSet: '$state' },
        }
      },
      { $sort: { totalJobs: -1 } }
    ]);

    const result = catStats.map(c => ({
      category: c._id,
      totalJobs: c.totalJobs,
      statesCount: c.states.length,
      states: c.states,
    }));

    res.json({ analytics: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get list of all states
app.get('/api/states', async (req, res) => {
  try {
    const states = await Job.distinct('state');
    res.json({ states: states.sort() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get job by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update job area
app.put('/api/jobs/:id/area', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.postedBy !== userId) return res.status(403).json({ error: 'Only job creator can update' });

    job.area = req.body.area;
    await job.save();

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== APPLICATION ROUTES =====

// Apply to job
app.post('/api/applications', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const profile = await Profile.findOne({ userId });

    if (!profile) return res.status(400).json({ error: 'Profile required' });
    if (profile.profileType !== 'worker') return res.status(403).json({ error: 'Only workers can apply' });

    const { jobId, coverLetter } = req.body;
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.postedBy === userId) return res.status(400).json({ error: 'Cannot apply to your own job' });

    const application = await Application.create({
      jobId: job._id,
      applicant: userId,
      coverLetter,
      status: 'pending',
    });

    res.json({ success: true, applicationId: application._id, application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my applications
app.get('/api/applications/my', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const applications = await Application.find({ applicant: userId }).populate('jobId');
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application status
app.put('/api/applications/:id/status', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const application = await Application.findById(req.params.id);

    if (!application) return res.status(404).json({ error: 'Application not found' });

    const job = await Job.findById(application.jobId);
    if (!job || job.postedBy !== userId) return res.status(403).json({ error: 'Only job owner can update status' });

    const nextStatus = req.body.status;
    if (!['pending', 'accepted', 'rejected'].includes(nextStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    application.status = nextStatus;
    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get job applications (for job owner)
app.get('/api/jobs/:id/applications', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'user-1';
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.postedBy !== userId) return res.status(403).json({ error: 'Only job owner can view applications' });

    const applications = await Application.find({ jobId: job._id });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== CHAT ROUTES =====

app.get('/api/chat/unread-count', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const count = await ChatMessage.countDocuments({
      receiverId: userId,
      readBy: { $ne: userId },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/conversations', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const myJobs = await Job.find({ postedBy: userId }).select('_id').lean();
    const myJobIds = myJobs.map((job) => job._id);

    const applications = await Application.find({
      status: 'accepted',
      $or: [{ applicant: userId }, { jobId: { $in: myJobIds } }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    const jobsById = new Map();
    const counterpartIds = new Set();

    if (applications.length > 0) {
      const appJobIds = [...new Set(applications.map((a) => String(a.jobId)))];
      const jobs = await Job.find({ _id: { $in: appJobIds } })
        .select('_id title area city state postedBy')
        .lean();
      jobs.forEach((job) => jobsById.set(String(job._id), job));
    }

    const conversations = await Promise.all(
      applications.map(async (application) => {
        const applicationId = String(application._id);
        const job = jobsById.get(String(application.jobId));
        if (!job) return null;

        const counterpartId = application.applicant === userId ? job.postedBy : application.applicant;
        counterpartIds.add(counterpartId);

        const [lastMessage, unreadCount] = await Promise.all([
          ChatMessage.findOne({ applicationId: application._id }).sort({ createdAt: -1 }).lean(),
          ChatMessage.countDocuments({
            applicationId: application._id,
            receiverId: userId,
            readBy: { $ne: userId },
          }),
        ]);

        return {
          applicationId,
          counterpartId,
          job: {
            _id: job._id,
            title: job.title,
            area: job.area,
            city: job.city,
            state: job.state,
          },
          unreadCount,
          lastMessage: lastMessage
            ? {
                _id: lastMessage._id,
                senderId: lastMessage.senderId,
                message: lastMessage.message,
                createdAt: lastMessage.createdAt,
              }
            : null,
          updatedAt: lastMessage?.createdAt || application.updatedAt,
        };
      })
    );

    const compactConversations = conversations.filter(Boolean);
    const profiles = await Profile.find({ userId: { $in: [...counterpartIds] } })
      .select('userId name profileType')
      .lean();
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    res.json({
      conversations: compactConversations
        .map((conversation) => ({
          ...conversation,
          counterpart: profileMap.get(conversation.counterpartId) || {
            userId: conversation.counterpartId,
            name: 'Towntask User',
            profileType: 'worker',
          },
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/:applicationId/messages', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const context = await getChatContextForUser(userId, req.params.applicationId);
    if (!context) {
      return res.status(403).json({ error: 'Chat is only available for accepted proposals' });
    }

    const messages = await ChatMessage.find({ applicationId: context.application._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/:applicationId/messages', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const payload = await createChatMessageForApplication({
      userId,
      applicationId: req.params.applicationId,
      message: req.body.message,
    });

    res.json({ success: true, message: payload });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to send message' });
  }
});

app.post('/api/chat/:applicationId/read', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const context = await getChatContextForUser(userId, req.params.applicationId);
    if (!context) {
      return res.status(403).json({ error: 'Chat is only available for accepted proposals' });
    }

    await ChatMessage.updateMany(
      {
        applicationId: context.application._id,
        receiverId: userId,
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    const count = await emitUnreadCount(userId);
    res.json({ success: true, unreadCount: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SMART SKILL/JOB SEARCH WITH RADIUS EXPANSION =====

// Helper: Haversine distance calculation
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Smart search with radius expansion
app.post('/api/jobs/smart-search', async (req, res) => {
  try {
    const { query, category, lat, lng, serviceMode } = req.body;
    const RADIUS_STEPS = [10, 25, 50, 100]; // km

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location (lat/lng) is required for smart search' });
    }

    const textFilter = {};
    if (query) textFilter.title = { $regex: query, $options: 'i' };
    if (category) textFilter.category = { $regex: category, $options: 'i' };
    textFilter.status = 'open';

    // If online service, skip location expansion
    if (serviceMode === 'online') {
      if (category) textFilter.serviceMode = { $in: ['online', 'both'] };
      const jobs = await Job.find(textFilter).sort({ createdAt: -1 });
      return res.json({ jobs, radius: null, message: 'Showing all online providers', expanded: false });
    }

    // Step through radii
    for (const radius of RADIUS_STEPS) {
      const radiusInMeters = radius * 1000;
      const geoFilter = {
        ...textFilter,
        location: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radiusInMeters,
          },
        },
      };

      const jobs = await Job.find(geoFilter).limit(50);
      if (jobs.length > 0) {
        const expanded = radius > RADIUS_STEPS[0];
        const message = expanded
          ? `No providers found in your immediate area. Showing results from ${radius} km away.`
          : null;
        return res.json({ jobs, radius, message, expanded });
      }
    }

    // Fallback: text search without geo
    const fallbackJobs = await Job.find(textFilter).sort({ createdAt: -1 }).limit(20);
    res.json({
      jobs: fallbackJobs,
      radius: null,
      message: 'No providers found within 100 km. Showing all matching results.',
      expanded: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search providers (profiles) by skill with radius
app.post('/api/providers/smart-search', async (req, res) => {
  try {
    const { skill, lat, lng, serviceMode } = req.body;
    const RADIUS_STEPS = [10, 25, 50, 100];

    const baseFilter = { profileType: 'provider' };
    if (skill) baseFilter.skills = { $regex: skill, $options: 'i' };

    if (serviceMode === 'online' || !lat || !lng) {
      const providers = await Profile.find(baseFilter).sort({ ratingAverage: -1 });
      return res.json({ providers, radius: null, expanded: false });
    }

    for (const radius of RADIUS_STEPS) {
      const geoFilter = {
        ...baseFilter,
        location: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radius * 1000,
          },
        },
      };

      const providers = await Profile.find(geoFilter).limit(50);
      if (providers.length > 0) {
        const expanded = radius > RADIUS_STEPS[0];
        return res.json({
          providers,
          radius,
          expanded,
          message: expanded ? `Showing providers from ${radius} km away.` : null,
        });
      }
    }

    const fallback = await Profile.find(baseFilter).sort({ ratingAverage: -1 }).limit(20);
    res.json({ providers: fallback, radius: null, expanded: true, message: 'Showing all matching providers.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== HIGH EMERGENCY (SOS) ROUTES =====

// Create high emergency
app.post('/api/emergency/high', async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(400).json({ error: 'Profile required' });

    // Check ban/suspension
    if (profile.isBanned) return res.status(403).json({ error: 'Your account has been banned due to misuse.' });
    if (profile.suspendedUntil && new Date() < profile.suspendedUntil) {
      return res.status(403).json({ error: `Account suspended until ${profile.suspendedUntil.toLocaleDateString()}` });
    }

    const { category, description, lat, lng, disclaimerAccepted } = req.body;
    const allowedCategories = ['crime', 'medical', 'women_safety', 'other', 'personal_safety', 'vehicle_breakdown', 'civil_help'];
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    const normalizedDescription = (description || '').trim();

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid emergency category' });
    }
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      return res.status(400).json({ error: 'Valid location coordinates are required.' });
    }
    if (category === 'other' && normalizedDescription.length < 5) {
      return res.status(400).json({ error: 'Please add a short description for Other emergencies.' });
    }

    // Basic content moderation
    const bannedWords = ['fake', 'test', 'prank', 'joke', 'lol', 'fun'];
    const finalDescription = normalizedDescription || `Emergency category selected: ${String(category).replace('_', ' ')}`;
    const descLower = finalDescription.toLowerCase();
    if (bannedWords.some(w => descLower.includes(w))) {
      return res.status(400).json({ error: 'Your description contains inappropriate content. Emergency system is for real emergencies only.' });
    }

    const emergency = await EmergencyPost.create({
      userId,
      type: 'high',
      category,
      description: finalDescription,
      lat: parsedLat,
      lng: parsedLng,
      location: { type: 'Point', coordinates: [parsedLng, parsedLat] },
      status: 'OPEN',
      currentRadius: 20,
      disclaimerAccepted: disclaimerAccepted ?? true,
      broadcastHistory: [{ radius: 20, sentAt: new Date(), notifiedCount: 0 }],
    });

    // Find nearby verified volunteers
    const nearbyVolunteers = await Profile.find({
      isVolunteer: true,
      volunteerStatus: 'VERIFIED',
      volunteerAvailable: true,
      userId: { $ne: userId },
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parsedLng, parsedLat] },
          $maxDistance: 20000, // 20km
        },
      },
    });

    res.json({
      success: true,
      emergency,
      notifiedVolunteers: nearbyVolunteers.length,
      message: `Emergency sent! ${nearbyVolunteers.length} volunteers were notified nearby.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expand emergency radius (called by cron/timer or manually)
app.put('/api/emergency/:id/expand', async (req, res) => {
  try {
    const emergency = await EmergencyPost.findById(req.params.id);
    if (!emergency) return res.status(404).json({ error: 'Emergency not found' });
    if (emergency.status !== 'OPEN') return res.status(400).json({ error: 'Emergency is no longer open' });

    const EXPANSION_MAP = { 20: 40, 40: 70, 70: 70 }; // max 70km for high emergency
    const newRadius = EXPANSION_MAP[emergency.currentRadius] || 70;

    if (newRadius === emergency.currentRadius) {
      return res.json({ message: 'Maximum radius already reached', currentRadius: newRadius });
    }

    // Find newly reachable volunteers
    const volunteers = await Profile.find({
      isVolunteer: true,
      volunteerStatus: 'VERIFIED',
      volunteerAvailable: true,
      userId: { $ne: emergency.userId },
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: emergency.location.coordinates },
          $maxDistance: newRadius * 1000,
        },
      },
    });

    emergency.currentRadius = newRadius;
    emergency.broadcastHistory.push({ radius: newRadius, sentAt: new Date(), notifiedCount: volunteers.length });

    // Send reminder if applicable
    if (emergency.remindersSent < 3) {
      emergency.remindersSent += 1;
      emergency.lastReminderAt = new Date();
    }

    await emergency.save();

    res.json({
      success: true,
      emergency,
      newRadius,
      notifiedVolunteers: volunteers.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Volunteer accepts emergency
app.put('/api/emergency/:id/accept', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const emergency = await EmergencyPost.findById(req.params.id);

    if (!emergency) return res.status(404).json({ error: 'Emergency not found' });
    if (emergency.status !== 'OPEN') return res.status(400).json({ error: 'Emergency already assigned or resolved' });

    const volunteer = await Profile.findOne({ userId });
    if (!volunteer) return res.status(403).json({ error: 'Profile not found' });

    // Check volunteer status levels
    if (volunteer.volunteerStatus === 'VERIFIED' && volunteer.verificationLevel === 'FULL') {
      // Full access — proceed
    } else if (volunteer.volunteerStatus === 'TEMP_VERIFIED' && volunteer.verificationLevel === 'TEMP') {
      // Check temp limits
      if (volunteer.tempEmergencyCount >= 2) {
        return res.status(403).json({
          error: 'Temp verified limit reached. Complete full verification to unlock unlimited access.',
          requireFullVerification: true,
        });
      }
      // Check temp expiry (7 days)
      if (volunteer.tempVerifiedAt && (Date.now() - new Date(volunteer.tempVerifiedAt).getTime()) > 7 * 24 * 60 * 60 * 1000) {
        volunteer.volunteerStatus = 'NOT_APPLIED';
        volunteer.verificationLevel = 'NONE';
        await volunteer.save();
        return res.status(403).json({
          error: 'Temp verification expired. Please complete full verification.',
          requireFullVerification: true,
        });
      }
      // Increment temp count
      volunteer.tempEmergencyCount += 1;
      await volunteer.save();
    } else if (volunteer.volunteerStatus === 'NOT_APPLIED') {
      // Show instant verification needed
      return res.status(403).json({
        error: 'Volunteer verification required to accept emergencies.',
        requireInstantVerification: true,
        volunteerStatus: 'NOT_APPLIED',
      });
    } else {
      return res.status(403).json({
        error: 'Your volunteer status does not allow emergency acceptance.',
        volunteerStatus: volunteer.volunteerStatus,
      });
    }

    emergency.status = 'IN_PROGRESS';
    emergency.acceptedBy = userId;
    emergency.acceptedAt = new Date();
    await emergency.save();

    // Return exact location after acceptance
    res.json({
      success: true,
      emergency,
      exactLocation: { lat: emergency.lat, lng: emergency.lng },
      message: 'You have accepted this emergency. Exact location revealed.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Volunteer cancels accepted emergency
app.put('/api/emergency/:id/cancel-volunteer', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const emergency = await EmergencyPost.findById(req.params.id);

    if (!emergency) return res.status(404).json({ error: 'Emergency not found' });
    if (emergency.acceptedBy !== userId) return res.status(403).json({ error: 'Not your assignment' });

    emergency.status = 'OPEN';
    emergency.acceptedBy = null;
    emergency.acceptedAt = null;
    await emergency.save();

    res.json({ success: true, message: 'Emergency reopened for other volunteers.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve emergency
app.put('/api/emergency/:id/resolve', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const emergency = await EmergencyPost.findById(req.params.id);

    if (!emergency) return res.status(404).json({ error: 'Emergency not found' });
    if (emergency.userId !== userId && emergency.acceptedBy !== userId) {
      return res.status(403).json({ error: 'Only poster or volunteer can resolve' });
    }

    emergency.status = 'RESOLVED';
    emergency.resolvedAt = new Date();
    await emergency.save();

    res.json({ success: true, emergency, message: 'Emergency marked as resolved.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report emergency as fake
app.put('/api/emergency/:id/report-fake', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const emergency = await EmergencyPost.findById(req.params.id);

    if (!emergency) return res.status(404).json({ error: 'Emergency not found' });
    if (emergency.reportedBy.includes(userId)) {
      return res.status(400).json({ error: 'You already reported this emergency' });
    }

    emergency.reportedBy.push(userId);
    emergency.fakeReportCount += 1;
    await emergency.save();

    // Auto-action if 3+ reports
    if (emergency.fakeReportCount >= 3) {
      emergency.status = 'EXPIRED';
      await emergency.save();

      const poster = await Profile.findOne({ userId: emergency.userId });
      if (poster) {
        poster.fakeReportCount += 1;
        if (poster.fakeReportCount >= 3) {
          poster.isBanned = true;
        } else {
          poster.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }
        await poster.save();
      }
    }

    res.json({ success: true, message: 'Report submitted. Thank you for keeping the community safe.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get emergencies (active ones near user)
app.get('/api/emergencies', async (req, res) => {
  try {
    const { lat, lng, type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    let emergencies;
    if (lat && lng) {
      filter.location = {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 100000, // 100km
        },
      };
      emergencies = await EmergencyPost.find(filter).limit(50);
    } else {
      emergencies = await EmergencyPost.find(filter).sort({ createdAt: -1 }).limit(50);
    }

    // Hide exact location for non-accepted emergencies
    const userId = req.headers['x-user-id'];
    const result = emergencies.map(e => {
      const obj = e.toObject();
      if (e.status === 'OPEN' && e.acceptedBy !== userId) {
        // Approximate location: offset by ~1km randomly
        obj.lat = e.lat + (Math.random() - 0.5) * 0.018;
        obj.lng = e.lng + (Math.random() - 0.5) * 0.018;
        obj.isApproximate = true;
      }
      return obj;
    });

    res.json({ emergencies: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my emergencies
app.get('/api/emergencies/my', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const emergencies = await EmergencyPost.find({
      $or: [{ userId }, { acceptedBy: userId }]
    }).sort({ createdAt: -1 });
    res.json({ emergencies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single emergency
app.get('/api/emergency/:id', async (req, res) => {
  try {
    const emergency = await EmergencyPost.findById(req.params.id);
    if (!emergency) return res.status(404).json({ error: 'Emergency not found' });
    res.json({ emergency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== LIGHT EMERGENCY (PRIORITY SERVICE) ROUTES =====

app.post('/api/emergency/light', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(400).json({ error: 'Profile required' });

    const { category, description, lat, lng, urgencyLevel } = req.body;

    if (!category || !description) {
      return res.status(400).json({ error: 'Category and description are required.' });
    }

    const emergency = await EmergencyPost.create({
      userId,
      type: 'light',
      category,
      description,
      lat: lat || 0,
      lng: lng || 0,
      location: { type: 'Point', coordinates: [lng || 0, lat || 0] },
      status: 'OPEN',
      urgencyLevel: urgencyLevel || 'normal',
      currentRadius: 50,
    });

    res.json({ success: true, emergency, message: 'Priority service request posted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== VOLUNTEER SYSTEM ROUTES =====

// Skip volunteer registration (user clicked "Skip for now")
app.post('/api/volunteer/skip', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(400).json({ error: 'Profile required' });

    profile.volunteerStatus = 'NOT_APPLIED';
    profile.volunteerSkippedAt = new Date();
    profile.reminderCount = 0;
    await profile.save();

    res.json({ success: true, message: 'You can always become a volunteer later.', volunteerStatus: 'NOT_APPLIED' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if volunteer reminder should be shown
app.get('/api/volunteer/reminder-check', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.json({ showReminder: false });

    // Only show reminder for NOT_APPLIED users who have skipped
    if (profile.volunteerStatus !== 'NOT_APPLIED' || !profile.volunteerSkippedAt) {
      return res.json({ showReminder: false });
    }

    // Max 3 reminders
    if (profile.reminderCount >= 3) {
      return res.json({ showReminder: false });
    }

    const now = Date.now();
    const skippedAt = new Date(profile.volunteerSkippedAt).getTime();
    const lastReminder = profile.lastReminderAt ? new Date(profile.lastReminderAt).getTime() : 0;
    const dismissed = profile.reminderDismissedAt ? new Date(profile.reminderDismissedAt).getTime() : 0;

    let shouldShow = false;

    if (profile.reminderCount === 0) {
      // First reminder: 48-72 hours after skip
      shouldShow = (now - skippedAt) >= 48 * 60 * 60 * 1000;
    } else {
      // Subsequent reminders: 15 days after last dismissal
      const ref = Math.max(lastReminder, dismissed);
      shouldShow = (now - ref) >= 15 * 24 * 60 * 60 * 1000;
    }

    res.json({
      showReminder: shouldShow,
      reminderCount: profile.reminderCount,
      message: shouldShow
        ? 'Be a Hero in Your Community – Become a Verified Emergency Volunteer Today.'
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dismiss volunteer reminder
app.post('/api/volunteer/dismiss-reminder', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(400).json({ error: 'Profile required' });

    profile.reminderCount += 1;
    profile.reminderDismissedAt = new Date();
    profile.lastReminderAt = new Date();
    await profile.save();

    res.json({ success: true, reminderCount: profile.reminderCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Instant (temp) volunteer verification — for emergency near user who skipped
app.post('/api/volunteer/instant-verify', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(400).json({ error: 'Profile required' });

    if (profile.volunteerStatus === 'VERIFIED') {
      return res.status(400).json({ error: 'Already fully verified' });
    }

    const { selfieUrl, mobileOtp, emailOtp, aadhaarNumber, phone, email } = req.body;

    // Validate Aadhaar format (12 digits)
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ error: 'Valid 12-digit Aadhaar number required' });
    }

    // Verify mobile OTP
    const storedMobileOtp = otpStore.get(phone);
    if (!storedMobileOtp || storedMobileOtp.otp !== mobileOtp) {
      return res.status(400).json({ error: 'Invalid mobile OTP' });
    }

    // Verify email OTP (if email provided)
    if (email) {
      const storedEmailOtp = otpStore.get(email);
      if (!storedEmailOtp || storedEmailOtp.otp !== emailOtp) {
        return res.status(400).json({ error: 'Invalid email OTP' });
      }
    }

    // Check selfie captured
    if (!selfieUrl) {
      return res.status(400).json({ error: 'Live selfie capture is required' });
    }

    // Check if Aadhaar already used
    const existingAadhaar = await VolunteerVerification.findOne({
      aadhaarNumber: aadhaarNumber.slice(-4),
      userId: { $ne: userId },
      verificationStatus: { $in: ['verified', 'temp_verified'] },
    });
    if (existingAadhaar) {
      return res.status(400).json({ error: 'This Aadhaar is already registered with another account' });
    }

    // Create or update verification record
    await VolunteerVerification.findOneAndUpdate(
      { userId },
      {
        userId,
        aadhaarNumber: aadhaarNumber.slice(-4),
        selfieUrl,
        mobileVerified: true,
        emailVerified: !!email,
        aadhaarVerified: true,
        faceVerified: true,
        faceMatchScore: 80,
        verificationType: 'TEMP',
        verificationStatus: 'temp_verified',
        tempVerifiedAt: new Date(),
        tempExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      { upsert: true, new: true }
    );

    // Update profile
    profile.volunteerStatus = 'TEMP_VERIFIED';
    profile.verificationLevel = 'TEMP';
    profile.isVolunteer = true;
    profile.tempVerifiedAt = new Date();
    profile.tempEmergencyCount = 0;
    await profile.save();

    // Clear OTPs
    otpStore.delete(phone);
    if (email) otpStore.delete(email);

    res.json({
      success: true,
      volunteerStatus: 'TEMP_VERIFIED',
      message: 'Instant verification complete! You can accept up to 2 emergencies. Complete full KYC within 7 days for unlimited access.',
      limits: { maxEmergencies: 2, expiresInDays: 7 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send OTP for instant verification (mobile or email)
app.post('/api/volunteer/send-verification-otp', async (req, res) => {
  try {
    const { target, type } = req.body; // type = 'phone' | 'email'
    if (!target) return res.status(400).json({ error: 'Target (phone/email) required' });

    const otp = generateOTP();
    otpStore.set(target, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.info(`📱 Verification OTP for ${target}: ${otp}`);

    res.json({
      success: true,
      message: `OTP sent to ${type === 'email' ? target.replace(/(.{2})(.*)(@.*)/, '$1***$3') : target.slice(0, 2) + '****' + target.slice(-4)}`,
      otp /* remove in production */,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start volunteer registration (full verification — "YES, I'M IN")
app.post('/api/volunteer/register', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    if (!profile) return res.status(400).json({ error: 'Profile required' });
    if (profile.volunteerStatus === 'VERIFIED') {
      return res.status(400).json({ error: 'Already a verified volunteer' });
    }

    const { termsAccepted, codeOfConductAccepted, riskAcknowledged } = req.body;

    if (!termsAccepted || !codeOfConductAccepted || !riskAcknowledged) {
      return res.status(400).json({ error: 'Must accept all terms, code of conduct, and risk acknowledgment' });
    }

    // Create or update verification record
    const verification = await VolunteerVerification.findOneAndUpdate(
      { userId },
      {
        userId,
        termsAccepted,
        codeOfConductAccepted,
        riskAcknowledged,
        verificationType: 'FULL',
        verificationStatus: 'in_progress',
        mobileVerified: !!profile.phone,
      },
      { upsert: true, new: true }
    );

    // Update profile
    profile.volunteerStatus = 'PENDING_VERIFICATION';
    profile.volunteerAppliedAt = new Date();
    await profile.save();

    res.json({ success: true, verification, message: 'Volunteer registration started. Please complete verification.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit documents for full verification
app.post('/api/volunteer/submit-documents', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const {
      aadhaarNumber, aadhaarFrontUrl, aadhaarBackUrl,
      panNumber, panUrl, selfieUrl,
      nameOnAadhaar, nameOnPan,
      address, addressLat, addressLng, addressSource,
      declarationAccepted, digilockerVerified,
    } = req.body;

    // Validate Aadhaar format (12 digits)
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ error: 'Valid 12-digit Aadhaar number required' });
    }

    // Validate PAN format (ABCDE1234F)
    if (!panNumber || !/^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber.toUpperCase())) {
      return res.status(400).json({ error: 'Valid PAN number required (format: ABCDE1234F)' });
    }

    if (!selfieUrl) {
      return res.status(400).json({ error: 'Live selfie is required for face verification' });
    }

    if (!declarationAccepted) {
      return res.status(400).json({ error: 'You must confirm all details are genuine' });
    }

    // Name matching (basic)
    const profile = await Profile.findOne({ userId });
    let nameMatchScore = 0;
    if (nameOnAadhaar && nameOnPan) {
      const a = nameOnAadhaar.toLowerCase().trim();
      const p = nameOnPan.toLowerCase().trim();
      if (a === p) nameMatchScore = 100;
      else if (a.includes(p) || p.includes(a)) nameMatchScore = 80;
      else nameMatchScore = 30;
    }

    // Also compare with registration name
    let regNameMatch = 0;
    if (profile && nameOnAadhaar) {
      const regName = profile.name.toLowerCase().trim();
      const aadhaarName = nameOnAadhaar.toLowerCase().trim();
      if (regName === aadhaarName) regNameMatch = 100;
      else if (regName.includes(aadhaarName) || aadhaarName.includes(regName)) regNameMatch = 80;
      else regNameMatch = 30;
    }

    // Fraud detection
    const fraudFlags = [];
    if (nameMatchScore < 50) fraudFlags.push('name_mismatch_aadhaar_pan');
    if (regNameMatch < 50) fraudFlags.push('name_mismatch_registration');

    // Check if Aadhaar already used by another user
    const existingAadhaar = await VolunteerVerification.findOne({
      aadhaarNumber: aadhaarNumber.slice(-4),
      userId: { $ne: userId },
      verificationStatus: { $in: ['verified', 'temp_verified'] },
    });
    if (existingAadhaar) fraudFlags.push('aadhaar_already_used');

    const verification = await VolunteerVerification.findOneAndUpdate(
      { userId },
      {
        aadhaarNumber: aadhaarNumber.slice(-4), // Store only last 4 digits
        aadhaarFrontUrl,
        aadhaarBackUrl,
        panNumber: panNumber.slice(0, 2) + 'XXXX' + panNumber.slice(6), // Mask PAN
        panUrl,
        selfieUrl,
        nameOnAadhaar,
        nameOnPan,
        nameMatchScore,
        fraudFlags,
        aadhaarVerified: true,
        panVerified: true,
        faceVerified: true, // In production, use face match API
        faceMatchScore: 85, // Mock score
        address: address || '',
        addressLat: addressLat || 0,
        addressLng: addressLng || 0,
        addressSource: addressSource || 'manual',
        declarationAccepted,
        digilockerVerified: digilockerVerified || false,
        verificationType: 'FULL',
        documentStatus: fraudFlags.length > 0 ? 'pending_review' : 'verified',
        verificationStatus: fraudFlags.length > 0 ? 'in_progress' : 'verified',
        submittedAt: new Date(),
        verifiedAt: fraudFlags.length === 0 ? new Date() : undefined,
      },
      { new: true }
    );

    // Auto-verify if no fraud flags → VERIFIED (FULL)
    if (fraudFlags.length === 0) {
      if (profile) {
        profile.isVerified = true;
        profile.isVolunteer = true;
        profile.volunteerStatus = 'VERIFIED';
        profile.verificationLevel = 'FULL';
        profile.volunteerAvailable = true;
        profile.fullVerifiedAt = new Date();
        await profile.save();
      }
    } else {
      // Set to UNDER_REVIEW for admin
      if (profile) {
        profile.volunteerStatus = 'UNDER_REVIEW';
        await profile.save();
      }
    }

    res.json({
      success: true,
      verification,
      autoVerified: fraudFlags.length === 0,
      fraudFlags,
      message: fraudFlags.length === 0
        ? 'Documents verified! You are now a verified volunteer.'
        : 'Documents submitted for manual review. We will notify you within 24-48 hours.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get volunteer verification status
app.get('/api/volunteer/status', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const profile = await Profile.findOne({ userId });
    const verification = await VolunteerVerification.findOne({ userId });

    // Check temp expiry
    let volunteerStatus = profile?.volunteerStatus || 'NOT_APPLIED';
    if (volunteerStatus === 'TEMP_VERIFIED' && profile?.tempVerifiedAt) {
      const daysSinceTemp = (Date.now() - new Date(profile.tempVerifiedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceTemp > 7) {
        volunteerStatus = 'NOT_APPLIED';
        profile.volunteerStatus = 'NOT_APPLIED';
        profile.verificationLevel = 'NONE';
        await profile.save();
      }
    }

    res.json({
      isVolunteer: profile?.isVolunteer || false,
      isVerified: profile?.isVerified || false,
      volunteerStatus,
      verificationLevel: profile?.verificationLevel || 'NONE',
      volunteerAvailable: profile?.volunteerAvailable || false,
      verification: verification || null,
      trustScore: profile?.trustScore || 0,
      badgeLevel: profile?.badgeLevel || 'none',
      emergencyUsageCount: profile?.emergencyUsageCount || 0,
      tempEmergencyCount: profile?.tempEmergencyCount || 0,
      tempVerifiedAt: profile?.tempVerifiedAt || null,
      fullVerifiedAt: profile?.fullVerifiedAt || null,
      reminderCount: profile?.reminderCount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle volunteer availability
app.put('/api/volunteer/toggle-availability', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const profile = await Profile.findOne({ userId });

    if (!profile || !profile.isVolunteer) {
      return res.status(403).json({ error: 'Must be a verified volunteer' });
    }

    profile.volunteerAvailable = !profile.volunteerAvailable;
    await profile.save();

    res.json({
      success: true,
      volunteerAvailable: profile.volunteerAvailable,
      message: profile.volunteerAvailable ? 'You will now receive emergency alerts.' : 'Emergency alerts paused.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== RATING SYSTEM ROUTES =====

// Submit rating after emergency
app.post('/api/ratings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { toUser, emergencyId, type, helpfulness, behavior, safety, responseTime, reviewText } = req.body;

    if (!toUser || !emergencyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify emergency is resolved
    const emergency = await EmergencyPost.findById(emergencyId);
    if (!emergency || emergency.status !== 'RESOLVED') {
      return res.status(400).json({ error: 'Can only rate after emergency is resolved' });
    }

    // Verify rater is involved
    if (emergency.userId !== userId && emergency.acceptedBy !== userId) {
      return res.status(403).json({ error: 'Only involved parties can rate' });
    }

    const rating = await Rating.create({
      fromUser: userId,
      toUser,
      emergencyId,
      type: type || 'emergency',
      helpfulness: helpfulness || 3,
      behavior: behavior || 3,
      safety: safety || 3,
      responseTime: responseTime || 3,
      reviewText: reviewText || '',
    });

    // Update target user's trust score and rating
    const allRatings = await Rating.find({ toUser });
    const avgScore = allRatings.reduce((sum, r) => sum + r.overallScore, 0) / allRatings.length;
    const trustScore = Math.min(100, allRatings.length * 5 + avgScore * 10);

    let badgeLevel = 'none';
    if (trustScore >= 80) badgeLevel = 'gold';
    else if (trustScore >= 50) badgeLevel = 'silver';
    else if (trustScore >= 20) badgeLevel = 'bronze';

    await Profile.findOneAndUpdate({ userId: toUser }, {
      ratingAverage: Math.round(avgScore * 10) / 10,
      ratingCount: allRatings.length,
      trustScore: Math.round(trustScore),
      badgeLevel,
    });

    res.json({ success: true, rating, message: 'Rating submitted successfully!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already rated this emergency' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get ratings for a user
app.get('/api/ratings/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ toUser: req.params.userId }).sort({ createdAt: -1 });
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== UPDATE PROFILE LOCATION =====
app.put('/api/profile/location', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { lat, lng } = req.body;

    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        lat,
        lng,
        location: { type: 'Point', coordinates: [lng, lat] },
      },
      { new: true }
    );

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== FEEDBACK ROUTES =====

// Submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { type, rating, title, message, category, toUser, jobId } = req.body;

    if (!rating || !message) {
      return res.status(400).json({ error: 'Rating and message are required' });
    }

    const feedback = await Feedback.create({
      fromUser: userId,
      toUser: toUser || null,
      jobId: jobId || null,
      type: type || 'app',
      rating,
      title: title || '',
      message,
      category: category || 'general',
    });

    res.json({ success: true, feedback, message: 'Feedback submitted! Thank you.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my feedback
app.get('/api/feedback/my', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const feedbacks = await Feedback.find({ fromUser: userId }).sort({ createdAt: -1 });
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback (for admin / public reviews)
app.get('/api/feedback', async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback for a specific user
app.get('/api/feedback/user/:userId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ toUser: req.params.userId }).sort({ createdAt: -1 });
    const fromProfiles = await Profile.find({
      userId: { $in: feedbacks.map(f => f.fromUser) }
    });
    const profileMap = {};
    fromProfiles.forEach(p => { profileMap[p.userId] = { name: p.name, area: p.area, profileType: p.profileType }; });
    const enriched = feedbacks.map(f => ({
      ...f.toObject(),
      fromProfile: profileMap[f.fromUser] || null,
    }));
    res.json({ feedbacks: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== ENHANCED JOB DETAIL (with poster info) =====
app.get('/api/jobs/:id/detail', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const poster = await Profile.findOne({ userId: job.postedBy });
    const applicationCount = await Application.countDocuments({ jobId: job._id });

    // Get feedback/reviews for this job
    const reviews = await Feedback.find({ jobId: job._id, type: 'job' }).sort({ createdAt: -1 }).limit(10);
    const reviewProfiles = await Profile.find({
      userId: { $in: reviews.map(r => r.fromUser) }
    });
    const profileMap = {};
    reviewProfiles.forEach(p => { profileMap[p.userId] = { name: p.name, area: p.area }; });

    res.json({
      job,
      poster: poster ? {
        name: poster.name,
        area: poster.area,
        phone: poster.phone ? poster.phone.slice(0, 2) + '****' + poster.phone.slice(-4) : null,
        email: poster.email ? poster.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
        profileType: poster.profileType,
        ratingAverage: poster.ratingAverage,
        ratingCount: poster.ratingCount,
        badgeLevel: poster.badgeLevel,
        isVerified: poster.isVerified,
        userId: poster.userId,
      } : null,
      applicationCount,
      reviews: reviews.map(r => ({
        ...r.toObject(),
        fromProfile: profileMap[r.fromUser] || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GET PROFILE WITH FEEDBACK =====
app.get('/api/profile/:principal/full', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.principal });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const feedbacks = await Feedback.find({ toUser: req.params.principal }).sort({ createdAt: -1 }).limit(20);
    const fromProfiles = await Profile.find({
      userId: { $in: feedbacks.map(f => f.fromUser) }
    });
    const profileMap = {};
    fromProfiles.forEach(p => { profileMap[p.userId] = { name: p.name, area: p.area }; });

    const jobsPosted = await Job.countDocuments({ postedBy: req.params.principal });
    const applicationsReceived = profile.profileType === 'provider'
      ? await Application.countDocuments({ jobId: { $in: (await Job.find({ postedBy: req.params.principal }).select('_id')).map(j => j._id) } })
      : 0;

    res.json({
      profile: {
        userId: profile.userId,
        name: profile.name,
        area: profile.area,
        profileType: profile.profileType,
        phone: profile.phone ? profile.phone.slice(0, 2) + '****' + profile.phone.slice(-4) : null,
        email: profile.email ? profile.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
        ratingAverage: profile.ratingAverage,
        ratingCount: profile.ratingCount,
        trustScore: profile.trustScore,
        badgeLevel: profile.badgeLevel,
        isVerified: profile.isVerified,
        isVolunteer: profile.isVolunteer,
        skills: profile.skills,
        createdAt: profile.createdAt,
      },
      stats: { jobsPosted, applicationsReceived },
      feedbacks: feedbacks.map(f => ({
        ...f.toObject(),
        fromProfile: profileMap[f.fromUser] || null,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Towntask Backend API',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      profiles: '/api/profile',
      jobs: '/api/jobs',
      applications: '/api/applications',
      chat: '/api/chat',
      emergencies: '/api/emergencies',
      volunteer: '/api/volunteer',
      ratings: '/api/ratings',
      smartSearch: '/api/jobs/smart-search',
    },
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ===== CONNECT TO MONGODB & START SERVER =====
const startServer = async () => {
  try {
    console.info(`🔌 Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.info('✅ MongoDB connected successfully!');

    const net = require('net');
    const tester = net.createServer();
    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try: taskkill /F /IM node.exe`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
    tester.once('listening', () => {
      tester.close(() => {
        server.listen(PORT, '0.0.0.0', () => {
          console.info(`✅ Server running on port ${PORT}`);
          console.info(`📍 API: http://localhost:${PORT}`);
          console.info(`🌐 LAN: http://0.0.0.0:${PORT} (accessible from phone)`);
          console.info(`🗄️  DB:  ${MONGO_URI}`);
        });
      });
    });
    tester.listen(PORT);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('💡 Make sure MongoDB is running on your machine (mongod)');
    process.exit(1);
  }
};

// Serve frontend for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

startServer();

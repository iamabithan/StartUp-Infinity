import { mongoose } from './db';
import { z } from 'zod';

// User Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['entrepreneur', 'investor', 'admin'], required: true },
  bio: String,
  location: String,
  profileImage: String,
  interests: [String],
  expertise: [String],
  createdAt: { type: Date, default: Date.now }
});

// Startup Model
const startupSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  name: { type: String, required: true },
  tagline: String,
  description: String,
  industry: String,
  fundingNeeded: Number,
  fundingStage: String,
  location: String,
  website: String,
  pitchDeck: String,
  pitchVideo: String,
  logo: String,
  coverImage: String,
  tags: [String],
  teamMembers: [{
    name: String,
    role: String,
    bio: String
  }],
  createdAt: { type: Date, default: Date.now }
});

// Interest Model
const interestSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  notes: String,
  feedback: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Event Model
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  eventDate: { type: Date, required: true },
  duration: Number,
  meetingLink: String,
  createdAt: { type: Date, default: Date.now }
});

// AI Feedback Model
const aiFeedbackSchema = new mongoose.Schema({
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  clarity: Number,
  marketNeed: Number,
  teamStrength: Number,
  suggestion: String,
  swotAnalysis: {
    strengths: [String],
    weaknesses: [String],
    opportunities: [String],
    threats: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

// Notification Model
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: String,
  type: String,
  read: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now }
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const Startup = mongoose.model('Startup', startupSchema);
export const Interest = mongoose.model('Interest', interestSchema);
export const Event = mongoose.model('Event', eventSchema);
export const AiFeedback = mongoose.model('AiFeedback', aiFeedbackSchema);
export const Notification = mongoose.model('Notification', notificationSchema);

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['entrepreneur', 'investor', 'admin']),
  bio: z.string().optional(),
  location: z.string().optional(),
  profileImage: z.string().optional(),
  interests: z.array(z.string()).optional(),
  expertise: z.array(z.string()).optional()
});

export const insertStartupSchema = z.object({
  userId: z.string(),
  name: z.string().min(2),
  tagline: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  fundingNeeded: z.number().optional(),
  fundingStage: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  pitchDeck: z.string().optional(),
  pitchVideo: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  teamMembers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string().optional()
  })).optional()
});

export const insertInterestSchema = z.object({
  investorId: z.string(),
  startupId: z.string(),
  notes: z.string().optional(),
  feedback: z.string().optional()
});

export const insertEventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  eventDate: z.string().datetime(),
  duration: z.number().optional(),
  meetingLink: z.string().optional()
});

export const insertAiFeedbackSchema = z.object({
  startupId: z.string(),
  clarity: z.number().min(0).max(100),
  marketNeed: z.number().min(0).max(100),
  teamStrength: z.number().min(0).max(100),
  suggestion: z.string().optional(),
  swotAnalysis: z.object({
    strengths: z.array(z.string()).optional(),
    weaknesses: z.array(z.string()).optional(),
    opportunities: z.array(z.string()).optional(),
    threats: z.array(z.string()).optional()
  }).optional()
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(2),
  message: z.string().optional(),
  type: z.string().optional(),
  read: z.boolean().optional(),
  link: z.string().optional()
});

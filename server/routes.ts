import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./mongoStorage";
import { 
  insertUserSchema, 
  insertStartupSchema, 
  insertInterestSchema, 
  insertEventSchema,
  insertAiFeedbackSchema,
  insertNotificationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication endpoints
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create user
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required",
          field: !username ? "username" : "password"
        });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log(`Login failed: User not found for username: ${username}`);
        return res.status(401).json({ 
          message: "Invalid username or password",
          code: "USER_NOT_FOUND"
        });
      }
      
      // Compare hashed passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        console.log(`Login failed: Password mismatch for user: ${username}`);
        return res.status(401).json({ 
          message: "Invalid username or password",
          code: "INVALID_PASSWORD"
        });
      }
      
      // Convert Mongoose document to plain object and remove password
      const userObj = user.toObject();
      const { password: _, ...userWithoutPassword } = userObj;
      
      console.log(`Successful login for user: ${username}`);
      res.status(200).json(userWithoutPassword);
    } catch (error: unknown) {
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Error during login",
        error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      });
    }
  });

  // User endpoints
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId.toString());
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      // Don't allow password updates via this endpoint
      if (userData.password) {
        delete userData.password;
      }
      
      const updatedUser = await storage.updateUser(userId.toString(), userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Startup endpoints
  app.get("/api/startups", async (req: Request, res: Response) => {
    try {
      const filters = req.query;
      let startups;
      
      if (Object.keys(filters).length > 0) {
        startups = await storage.getStartupsByFilter(filters);
      } else {
        startups = await storage.getAllStartups();
      }
      
      res.status(200).json(startups);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving startups" });
    }
  });

  app.get("/api/startups/:id", async (req: Request, res: Response) => {
    try {
      const startupId = req.params.id;
      const startup = await storage.getStartup(startupId.toString());
      
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }
      
      res.status(200).json(startup);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving startup" });
    }
  });

  app.get("/api/users/:userId/startups", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const startups = await storage.getStartupsByUser(userId);
      
      res.status(200).json(startups);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving startups" });
    }
  });

  app.post("/api/startups", async (req: Request, res: Response) => {
    try {
      // Ensure userId is a string (convert from number if needed)
      req.body.userId = req.body.userId.toString();
      
      const startupData = insertStartupSchema.parse(req.body);
      const startup = await storage.createStartup(startupData);
      
      res.status(201).json(startup);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating startup" });
    }
  });

  app.patch("/api/startups/:id", async (req: Request, res: Response) => {
    try {
      const startupId = req.params.id;
      const startupData = req.body;
      
      const updatedStartup = await storage.updateStartup(startupId.toString(), startupData);
      
      if (!updatedStartup) {
        return res.status(404).json({ message: "Startup not found" });
      }
      
      res.status(200).json(updatedStartup);
    } catch (error) {
      res.status(500).json({ message: "Error updating startup" });
    }
  });

  app.delete("/api/startups/:id", async (req: Request, res: Response) => {
    try {
      const startupId = req.params.id;
      const success = await storage.deleteStartup(startupId.toString());
      
      if (!success) {
        return res.status(404).json({ message: "Startup not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting startup" });
    }
  });

  // Interest endpoints
  app.get("/api/investors/:investorId/interests", async (req: Request, res: Response) => {
    try {
      const investorId = req.params.investorId;
      const interests = await storage.getInterestsByInvestor(investorId.toString());
      
      res.status(200).json(interests);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving interests" });
    }
  });

  app.get("/api/startups/:startupId/interests", async (req: Request, res: Response) => {
    try {
      const startupId = req.params.startupId;
      const interests = await storage.getInterestsByStartup(startupId.toString());
      
      res.status(200).json(interests);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving interests" });
    }
  });

  app.post("/api/interests", async (req: Request, res: Response) => {
    try {
      const interestData = insertInterestSchema.parse(req.body);
      const interest = await storage.createInterest(interestData);
      
      // Create notification for the startup owner
      const startup = await storage.getStartup(interestData.startupId.toString());
      if (startup) {
        const investor = await storage.getUser(interestData.investorId.toString());
        if (investor) {
          await storage.createNotification({
            userId: startup.userId,
            title: "New Interest in Your Startup",
            message: `${investor.fullName} has shown interest in your startup "${startup.name}"`,
            type: "interest",
            read: false,
            link: `/startup/${startup._id.toString()}`
          });
        }
      }
      
      res.status(201).json(interest);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating interest" });
    }
  });

  app.patch("/api/interests/:id", async (req: Request, res: Response) => {
    try {
      const interestId = req.params.id;
      const interestData = req.body;
      
      const updatedInterest = await storage.updateInterest(interestId.toString(), interestData);
      
      if (!updatedInterest) {
        return res.status(404).json({ message: "Interest not found" });
      }
      
      res.status(200).json(updatedInterest);
    } catch (error) {
      res.status(500).json({ message: "Error updating interest" });
    }
  });

  app.delete("/api/interests/:id", async (req: Request, res: Response) => {
    try {
      const interestId = req.params.id;
      const success = await storage.deleteInterest(interestId.toString());
      
      if (!success) {
        return res.status(404).json({ message: "Interest not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting interest" });
    }
  });

  // Event endpoints
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const upcoming = req.query.upcoming === 'true';
      
      let events;
      if (upcoming) {
        events = await storage.getUpcomingEvents();
      } else {
        events = await storage.getAllEvents();
      }
      
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving events" });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const eventId = req.params.id;
      const event = await storage.getEvent(eventId.toString());
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving event" });
    }
  });

  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      
      res.status(201).json(event);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating event" });
    }
  });

  // AI Feedback endpoints
  app.get("/api/startups/:startupId/ai-feedback", async (req: Request, res: Response) => {
    try {
      const startupId = req.params.startupId;
      const feedback = await storage.getAiFeedbackByStartup(startupId.toString());
      
      if (!feedback) {
        return res.status(404).json({ message: "AI feedback not found for this startup" });
      }
      
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving AI feedback" });
    }
  });

  app.post("/api/ai-feedback", async (req: Request, res: Response) => {
    try {
      const feedbackData = insertAiFeedbackSchema.parse(req.body);
      const feedback = await storage.createAiFeedback(feedbackData);
      
      // Create notification for the startup owner
      const startup = await storage.getStartup(feedbackData.startupId.toString());
      if (startup) {
        await storage.createNotification({
          userId: startup.userId,
          title: "New AI Analysis Complete",
          message: `Gemini AI has analyzed your "${startup.name}" pitch and generated feedback.`,
          type: "ai-feedback",
          read: false,
          link: `/startup/${startup._id.toString()}/ai-feedback`
        });
      }
      
      res.status(201).json(feedback);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating AI feedback" });
    }
  });

  // Notification endpoints
  app.get("/api/users/:userId/notifications", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const notifications = await storage.getNotificationsByUser(userId);
      
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const notificationId = req.params.id;
      const updatedNotification = await storage.markNotificationAsRead(notificationId.toString());
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(200).json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Error updating notification" });
    }
  });

  // Gemini AI endpoints for SWOT analysis
  app.post("/api/ai/swot", async (req: Request, res: Response) => {
    try {
      const { startupId } = req.body;
      
      if (!startupId) {
        return res.status(400).json({ message: "Startup ID is required" });
      }
      
      const startup = await storage.getStartup(startupId.toString());
      
      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }
      
      // For demo purposes, this is a mock response
      // In a real application, this would call the Gemini AI API
      const swotAnalysis = {
        strengths: [
          "Strong founding team with relevant experience",
          "Unique value proposition in the market",
          "Scalable business model"
        ],
        weaknesses: [
          "Limited initial funding",
          "Early stage with unproven market traction",
          "Potential regulatory challenges"
        ],
        opportunities: [
          "Growing market demand in this sector",
          "Potential for strategic partnerships",
          "International expansion possibilities"
        ],
        threats: [
          "Established competitors",
          "Changing economic conditions",
          "Rapidly evolving technology landscape"
        ]
      };
      
      // Update the AI feedback with SWOT analysis
      const aiFeedback = await storage.getAiFeedbackByStartup(startupId.toString());
      
      if (aiFeedback) {
        await storage.updateAiFeedback(aiFeedback._id.toString(), { swotAnalysis });
      }
      
      res.status(200).json({ swotAnalysis });
    } catch (error) {
      res.status(500).json({ message: "Error generating SWOT analysis" });
    }
  });

  // Initialize with some sample data
  await initializeSampleData();

  return httpServer;
}

async function initializeSampleData(): Promise<void> {
  try {
    // Check if sample data already exists
    const existingEntrepreneur = await storage.getUserByUsername("entrepreneur");
    const existingInvestor = await storage.getUserByUsername("investor");
    
    if (existingEntrepreneur && existingInvestor) {
      return; // Sample data already exists
    }
    
    // Create sample users
    const entrepreneur = await storage.createUser({
      username: "entrepreneur",
      password: "password",
      fullName: "John Entrepreneur",
      email: "john@example.com",
      role: "entrepreneur",
      bio: "Serial entrepreneur with passion for sustainability",
      location: "San Francisco",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      interests: ["Technology", "Environment", "Education"],
      expertise: ["Product Development", "Marketing", "Fundraising"]
    });

    const investor = await storage.createUser({
      username: "investor",
      password: "password",
      fullName: "Sarah Investor",
      email: "sarah@example.com",
      role: "investor",
      bio: "Angel investor focused on early-stage startups",
      location: "New York",
      profileImage: "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      interests: ["FinTech", "HealthTech", "CleanTech"],
      expertise: ["Finance", "Strategy", "ScaleUp"]
    });

    // Ensure users are created before proceeding
    if (!entrepreneur?._id || !investor?._id) {
      throw new Error("Failed to create sample users");
    }
    

    // Create sample startups
  const ecoTrack = await storage.createStartup({
    userId: entrepreneur._id.toString(),
    name: "EcoTrack",
    tagline: "Carbon footprint tracking for eco-conscious consumers",
    description: "EcoTrack is an innovative platform that helps individuals and businesses track and reduce their carbon footprint through data-driven insights and personalized recommendations.",
    industry: "Sustainability",
    fundingNeeded: 500000,
    fundingStage: "Seed",
    location: "San Francisco",
    website: "https://ecotrack.example.com",
    pitchDeck: "https://example.com/ecotrack-deck.pdf",
    pitchVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    logo: "https://via.placeholder.com/150",
    coverImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&h=300&q=80",
    tags: ["CleanTech", "Mobile App", "B2B2C"],
    teamMembers: [
      { name: "John Entrepreneur", role: "CEO", bio: "Serial entrepreneur" },
      { name: "Alice Chen", role: "CTO", bio: "Former Google engineer" },
      { name: "Mark Wilson", role: "CMO", bio: "Marketing expert" }
    ]
  });

  const mediConnect = await storage.createStartup({
    userId: entrepreneur._id.toString(),
    name: "MediConnect",
    tagline: "AI-powered healthcare provider matching",
    description: "MediConnect uses artificial intelligence to match patients with the most suitable healthcare providers based on their specific needs, medical history, and preferences.",
    industry: "HealthTech",
    fundingNeeded: 750000,
    fundingStage: "Series A",
    location: "Boston",
    website: "https://mediconnect.example.com",
    pitchDeck: "https://example.com/mediconnect-deck.pdf",
    pitchVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    logo: "https://via.placeholder.com/150",
    coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&h=300&q=80",
    tags: ["AI", "Healthcare", "SaaS"],
    teamMembers: [
      { name: "John Entrepreneur", role: "CEO", bio: "Serial entrepreneur" },
      { name: "Dr. Sarah Johnson", role: "Medical Director", bio: "Former hospital director" },
      { name: "James Lee", role: "CTO", bio: "AI specialist" }
    ]
  });

  // Create sample interests
  await storage.createInterest({
    investorId: investor._id.toString(),
    startupId: ecoTrack._id.toString(),
    notes: "Interesting approach to sustainability, would like to know more about the tech stack",
    feedback: "Strong concept but needs more market validation"
  });

  // Create sample events
  await storage.createEvent({
    title: "FinTech Innovation Pitch Night",
    description: "Join us for an evening of exciting pitches from the most innovative FinTech startups",
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    duration: 120,
    meetingLink: "https://zoom.us/j/123456789"
  });

  await storage.createEvent({
    title: "HealthTech Investor Showcase",
    description: "Connecting healthcare startups with potential investors",
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    duration: 180,
    meetingLink: "https://zoom.us/j/987654321"
  });

  // Create sample AI feedback
  await storage.createAiFeedback({
    startupId: ecoTrack._id.toString(),
    clarity: 85,
    marketNeed: 70,
    teamStrength: 90,
    suggestion: "Based on your pitch content, consider strengthening your market need section by including more specific data on your target market size and growth potential.",
    swotAnalysis: {
      strengths: [
        "Strong founding team with relevant experience",
        "Unique value proposition in the market",
        "Scalable business model"
      ],
      weaknesses: [
        "Limited initial funding",
        "Early stage with unproven market traction",
        "Potential regulatory challenges"
      ],
      opportunities: [
        "Growing market demand in this sector",
        "Potential for strategic partnerships",
        "International expansion possibilities"
      ],
      threats: [
        "Established competitors",
        "Changing economic conditions",
        "Rapidly evolving technology landscape"
      ]
    }
  });

  // Create sample notifications
  if (entrepreneur?._id && ecoTrack?._id && investor?._id) {
    await storage.createNotification({
      userId: entrepreneur._id.toString(),
      title: "New Interest in Your Startup",
      message: "Sarah Investor is interested in EcoTrack and left feedback.",
      type: "interest",
      read: false,
      link: `/startup/${ecoTrack._id.toString()}`
    });

    await storage.createNotification({
      userId: entrepreneur._id.toString(),
      title: "AI Analysis Complete",
      message: "Gemini AI has analyzed your pitch and generated feedback.",
      type: "ai-feedback",
      read: false,
      link: `/startup/${ecoTrack._id.toString()}/ai-feedback`
    });

    await storage.createNotification({
      userId: entrepreneur._id.toString(),
      title: "Live Pitch Event Scheduled",
      message: "Your pitch is scheduled for a live event on June 15.",
      type: "event",
      read: false,
      link: "/live-events"
    });

    await storage.createNotification({
      userId: investor._id.toString(),
      title: "New Startups Available",
      message: "14 new startups have been added that match your interests.",
      type: "recommendation",
      read: false,
      link: "/startups"
    });
  }
}
  catch (error) {
  console.error("Error creating sample users:", error);
  }
}

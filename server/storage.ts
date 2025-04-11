import { 
  users, 
  startups, 
  interests, 
  events, 
  aiFeedback, 
  notifications,
  type User, 
  type InsertUser, 
  type Startup, 
  type InsertStartup, 
  type Interest, 
  type InsertInterest, 
  type Event, 
  type InsertEvent, 
  type AiFeedback, 
  type InsertAiFeedback, 
  type Notification, 
  type InsertNotification 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Startup operations
  getStartup(id: number): Promise<Startup | undefined>;
  getStartupsByUser(userId: number): Promise<Startup[]>;
  getAllStartups(): Promise<Startup[]>;
  getStartupsByFilter(filters: Record<string, any>): Promise<Startup[]>;
  createStartup(startup: InsertStartup): Promise<Startup>;
  updateStartup(id: number, startup: Partial<Startup>): Promise<Startup | undefined>;
  deleteStartup(id: number): Promise<boolean>;
  
  // Interest operations
  getInterest(id: number): Promise<Interest | undefined>;
  getInterestsByInvestor(investorId: number): Promise<Interest[]>;
  getInterestsByStartup(startupId: number): Promise<Interest[]>;
  createInterest(interest: InsertInterest): Promise<Interest>;
  updateInterest(id: number, interest: Partial<Interest>): Promise<Interest | undefined>;
  deleteInterest(id: number): Promise<boolean>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // AI Feedback operations
  getAiFeedback(id: number): Promise<AiFeedback | undefined>;
  getAiFeedbackByStartup(startupId: number): Promise<AiFeedback | undefined>;
  createAiFeedback(feedback: InsertAiFeedback): Promise<AiFeedback>;
  updateAiFeedback(id: number, feedback: Partial<AiFeedback>): Promise<AiFeedback | undefined>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private startups: Map<number, Startup>;
  private interests: Map<number, Interest>;
  private events: Map<number, Event>;
  private aiFeedbacks: Map<number, AiFeedback>;
  private notifications: Map<number, Notification>;
  
  private currentUserId: number;
  private currentStartupId: number;
  private currentInterestId: number;
  private currentEventId: number;
  private currentAiFeedbackId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.startups = new Map();
    this.interests = new Map();
    this.events = new Map();
    this.aiFeedbacks = new Map();
    this.notifications = new Map();
    
    this.currentUserId = 1;
    this.currentStartupId = 1;
    this.currentInterestId = 1;
    this.currentEventId = 1;
    this.currentAiFeedbackId = 1;
    this.currentNotificationId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Startup operations
  async getStartup(id: number): Promise<Startup | undefined> {
    return this.startups.get(id);
  }

  async getStartupsByUser(userId: number): Promise<Startup[]> {
    return Array.from(this.startups.values()).filter(
      (startup) => startup.userId === userId
    );
  }

  async getAllStartups(): Promise<Startup[]> {
    return Array.from(this.startups.values());
  }

  async getStartupsByFilter(filters: Record<string, any>): Promise<Startup[]> {
    let filteredStartups = Array.from(this.startups.values());
    
    for (const [key, value] of Object.entries(filters)) {
      if (value && value !== '') {
        filteredStartups = filteredStartups.filter(startup => {
          if (key === 'fundingNeeded') {
            const ranges = {
              '0-500k': { min: 0, max: 500000 },
              '500k-1m': { min: 500000, max: 1000000 },
              '1m-5m': { min: 1000000, max: 5000000 },
              '5m+': { min: 5000000, max: Infinity }
            };
            
            const range = ranges[value as keyof typeof ranges];
            if (range) {
              return startup.fundingNeeded >= range.min && startup.fundingNeeded <= range.max;
            }
          }
          
          return startup[key as keyof Startup] === value;
        });
      }
    }
    
    return filteredStartups;
  }

  async createStartup(insertStartup: InsertStartup): Promise<Startup> {
    const id = this.currentStartupId++;
    const createdAt = new Date();
    const startup: Startup = { ...insertStartup, id, createdAt, updatedAt: createdAt };
    this.startups.set(id, startup);
    return startup;
  }

  async updateStartup(id: number, startupUpdate: Partial<Startup>): Promise<Startup | undefined> {
    const startup = this.startups.get(id);
    if (!startup) return undefined;
    
    const updatedStartup = { ...startup, ...startupUpdate, updatedAt: new Date() };
    this.startups.set(id, updatedStartup);
    return updatedStartup;
  }

  async deleteStartup(id: number): Promise<boolean> {
    return this.startups.delete(id);
  }

  // Interest operations
  async getInterest(id: number): Promise<Interest | undefined> {
    return this.interests.get(id);
  }

  async getInterestsByInvestor(investorId: number): Promise<Interest[]> {
    return Array.from(this.interests.values()).filter(
      (interest) => interest.investorId === investorId
    );
  }

  async getInterestsByStartup(startupId: number): Promise<Interest[]> {
    return Array.from(this.interests.values()).filter(
      (interest) => interest.startupId === startupId
    );
  }

  async createInterest(insertInterest: InsertInterest): Promise<Interest> {
    const id = this.currentInterestId++;
    const createdAt = new Date();
    const interest: Interest = { ...insertInterest, id, createdAt };
    this.interests.set(id, interest);
    return interest;
  }

  async updateInterest(id: number, interestUpdate: Partial<Interest>): Promise<Interest | undefined> {
    const interest = this.interests.get(id);
    if (!interest) return undefined;
    
    const updatedInterest = { ...interest, ...interestUpdate };
    this.interests.set(id, updatedInterest);
    return updatedInterest;
  }

  async deleteInterest(id: number): Promise<boolean> {
    return this.interests.delete(id);
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values()).filter(
      (event) => new Date(event.eventDate) > now
    ).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const createdAt = new Date();
    const event: Event = { ...insertEvent, id, createdAt };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // AI Feedback operations
  async getAiFeedback(id: number): Promise<AiFeedback | undefined> {
    return this.aiFeedbacks.get(id);
  }

  async getAiFeedbackByStartup(startupId: number): Promise<AiFeedback | undefined> {
    return Array.from(this.aiFeedbacks.values()).find(
      (feedback) => feedback.startupId === startupId
    );
  }

  async createAiFeedback(insertFeedback: InsertAiFeedback): Promise<AiFeedback> {
    const id = this.currentAiFeedbackId++;
    const createdAt = new Date();
    const feedback: AiFeedback = { ...insertFeedback, id, createdAt };
    this.aiFeedbacks.set(id, feedback);
    return feedback;
  }

  async updateAiFeedback(id: number, feedbackUpdate: Partial<AiFeedback>): Promise<AiFeedback | undefined> {
    const feedback = this.aiFeedbacks.get(id);
    if (!feedback) return undefined;
    
    const updatedFeedback = { ...feedback, ...feedbackUpdate };
    this.aiFeedbacks.set(id, updatedFeedback);
    return updatedFeedback;
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const createdAt = new Date();
    const notification: Notification = { ...insertNotification, id, createdAt };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
}

export const storage = new MemStorage();

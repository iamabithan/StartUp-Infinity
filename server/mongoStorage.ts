import {
  User,
  Startup,
  Interest,
  Event,
  AiFeedback,
  Notification,
  insertUserSchema,
  insertStartupSchema,
  insertInterestSchema,
  insertEventSchema,
  insertAiFeedbackSchema,
  insertNotificationSchema
} from './models';

export const storage = {
  // User operations
  async createUser(userData: any) {
    const validated = insertUserSchema.parse(userData);
    return await User.create(validated);
  },

  async getUser(userId: string) {
    return await User.findById(userId).select('-password');
  },

  async getUserByUsername(username: string) {
    return await User.findOne({ username });
  },

  async getUserByEmail(email: string) {
    return await User.findOne({ email });
  },

  async updateUser(userId: string, userData: any) {
    if (userData.password) {
      delete userData.password;
    }
    return await User.findByIdAndUpdate(userId, userData, { new: true }).select('-password');
  },

  // Startup operations
  async createStartup(startupData: any) {
    const validated = insertStartupSchema.parse(startupData);
    return await Startup.create(validated);
  },

  async getStartup(startupId: string) {
    return await Startup.findById(startupId);
  },

  async getAllStartups() {
    return await Startup.find().sort({ createdAt: -1 });
  },

  async getStartupsByUser(userId: string) {
    return await Startup.find({ userId }).sort({ createdAt: -1 });
  },

  async getStartupsByFilter(filters: any) {
    const query: any = {};
    if (filters.industry) query.industry = filters.industry;
    if (filters.fundingStage) query.fundingStage = filters.fundingStage;
    if (filters.location) query.location = filters.location;
    if (filters.tags) query.tags = { $in: filters.tags.split(',') };
    return await Startup.find(query).sort({ createdAt: -1 });
  },

  async updateStartup(startupId: string, startupData: any) {
    return await Startup.findByIdAndUpdate(startupId, startupData, { new: true });
  },

  async deleteStartup(startupId: string) {
    await Startup.findByIdAndDelete(startupId);
    return true;
  },

  // Interest operations
  async createInterest(interestData: any) {
    const validated = insertInterestSchema.parse(interestData);
    return await Interest.create(validated);
  },

  async getInterestsByInvestor(investorId: string) {
    return await Interest.find({ investorId })
      .populate('startupId')
      .sort({ createdAt: -1 });
  },

  async getInterestsByStartup(startupId: string) {
    return await Interest.find({ startupId })
      .populate('investorId')
      .sort({ createdAt: -1 });
  },

  async updateInterest(interestId: string, interestData: any) {
    return await Interest.findByIdAndUpdate(interestId, interestData, { new: true });
  },

  async deleteInterest(interestId: string) {
    await Interest.findByIdAndDelete(interestId);
    return true;
  },

  // Event operations
  async createEvent(eventData: any) {
    const validated = insertEventSchema.parse(eventData);
    return await Event.create(validated);
  },

  async getEvent(eventId: string) {
    return await Event.findById(eventId);
  },

  async getAllEvents() {
    return await Event.find().sort({ eventDate: 1 });
  },

  async getUpcomingEvents() {
    return await Event.find({ eventDate: { $gte: new Date() } }).sort({ eventDate: 1 });
  },

  // AI Feedback operations
  async createAiFeedback(feedbackData: any) {
    const validated = insertAiFeedbackSchema.parse(feedbackData);
    return await AiFeedback.create(validated);
  },

  async getAiFeedbackByStartup(startupId: string) {
    return await AiFeedback.findOne({ startupId });
  },

  async updateAiFeedback(feedbackId: string, feedbackData: any) {
    return await AiFeedback.findByIdAndUpdate(feedbackId, feedbackData, { new: true });
  },

  // Notification operations
  async createNotification(notificationData: any) {
    const validated = insertNotificationSchema.parse(notificationData);
    return await Notification.create(validated);
  },

  async getNotificationsByUser(userId: string) {
    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
  },

  async markNotificationAsRead(notificationId: string) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  }
};

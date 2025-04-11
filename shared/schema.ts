import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["entrepreneur", "investor"] }).notNull(),
  bio: text("bio"),
  location: text("location"),
  profileImage: text("profile_image"),
  interests: text("interests").array(),
  expertise: text("expertise").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Startup pitch model
export const startups = pgTable("startups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(),
  fundingNeeded: integer("funding_needed").notNull(),
  fundingStage: text("funding_stage").notNull(),
  location: text("location"),
  website: text("website"),
  pitchDeck: text("pitch_deck"),
  pitchVideo: text("pitch_video"),
  logo: text("logo"),
  coverImage: text("cover_image"),
  tags: text("tags").array(),
  teamMembers: jsonb("team_members"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// Investor interest model
export const interests = pgTable("interests", {
  id: serial("id").primaryKey(),
  investorId: integer("investor_id").notNull().references(() => users.id),
  startupId: integer("startup_id").notNull().references(() => startups.id),
  notes: text("notes"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Live pitch events model
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  meetingLink: text("meeting_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI feedback model
export const aiFeedback = pgTable("ai_feedback", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull().references(() => startups.id),
  clarity: integer("clarity").notNull(),
  marketNeed: integer("market_need").notNull(),
  teamStrength: integer("team_strength").notNull(),
  suggestion: text("suggestion").notNull(),
  swotAnalysis: jsonb("swot_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications model
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define insert schemas using Zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStartupSchema = createInsertSchema(startups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterestSchema = createInsertSchema(interests).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertAiFeedbackSchema = createInsertSchema(aiFeedback).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

// Define TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Startup = typeof startups.$inferSelect;
export type InsertStartup = z.infer<typeof insertStartupSchema>;
export type Interest = typeof interests.$inferSelect;
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type AiFeedback = typeof aiFeedback.$inferSelect;
export type InsertAiFeedback = z.infer<typeof insertAiFeedbackSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

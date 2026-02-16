import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === Site Content ===
// Stores content for fixed sections on pages
export const site_sections = pgTable("site_sections", {
  id: serial("id").primaryKey(),
  pageSlug: text("page_slug").notNull(), // home, about, contact, etc.
  sectionKey: text("section_key").notNull(), // hero, schedule, featured_cards, etc.
  content: jsonb("content").notNull(), // Structured content for that section
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSectionSchema = createInsertSchema(site_sections).omit({ id: true, updatedAt: true });
export type Section = typeof site_sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;

// === Events (Manual) ===
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  time: text("time"), // e.g. "10:00 AM"
  location: text("location"),
  imageUrl: text("image_url"),
  tags: text("tags").array(), // For filtering
  isPlanningCenter: boolean("is_planning_center").default(false),
  pcoId: text("pco_id"), // If linked to PCO
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// === Media Library ===
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertMediaSchema = createInsertSchema(media).omit({ id: true, uploadedAt: true });
export type MediaItem = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

// === Global Settings ===
// Stores theme colors, logos, contact info, etc.
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // primary_color, header_logo, etc.
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

// === API Types ===

// Generic content update
export type UpdateSectionRequest = {
  content: Record<string, any>;
};

// Settings update (bulk)
export type UpdateSettingsRequest = Record<string, any>;

// PCO Config (mock for now, or stored in settings)
export type PcoConfig = {
  clientId: string;
  clientSecret: string;
  organizationId: string;
};

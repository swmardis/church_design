import { site_sections, events, media, settings, dashboard_shortcuts, type Section, type InsertSection, type Event, type InsertEvent, type MediaItem, type InsertMedia, type Setting, type InsertSetting, type DashboardShortcut, type InsertDashboardShortcut } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Content
  getSection(pageSlug: string, sectionKey: string): Promise<Section | undefined>;
  getSectionsByPage(pageSlug: string): Promise<Section[]>;
  updateSection(pageSlug: string, sectionKey: string, content: any): Promise<Section>;
  updateSectionSafe(pageSlug: string, sectionKey: string, content: any): Promise<Section>;

  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Media
  getMedia(): Promise<MediaItem[]>;
  getMediaItem(id: number): Promise<MediaItem | undefined>;
  createMedia(media: InsertMedia): Promise<MediaItem>;
  deleteMedia(id: number): Promise<void>;

  // Settings
  getSettings(): Promise<Setting[]>;
  updateSettings(settings: { key: string; value: any }[]): Promise<Setting[]>;

  // Dashboard Shortcuts
  getShortcuts(): Promise<DashboardShortcut[]>;
  createShortcut(shortcut: InsertDashboardShortcut): Promise<DashboardShortcut>;
  deleteShortcut(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Content
  async getSection(pageSlug: string, sectionKey: string): Promise<Section | undefined> {
    const [section] = await db
      .select()
      .from(site_sections)
      .where(and(eq(site_sections.pageSlug, pageSlug), eq(site_sections.sectionKey, sectionKey)));
    return section;
  }

  async getSectionsByPage(pageSlug: string): Promise<Section[]> {
    return await db.select().from(site_sections).where(eq(site_sections.pageSlug, pageSlug));
  }

  async updateSection(pageSlug: string, sectionKey: string, content: any): Promise<Section> {
      // This is the same logic as updateSectionSafe really, but kept for interface compatibility
      return this.updateSectionSafe(pageSlug, sectionKey, content);
  }
  
  async updateSectionSafe(pageSlug: string, sectionKey: string, content: any): Promise<Section> {
      const existing = await this.getSection(pageSlug, sectionKey);
      if (existing) {
          const [updated] = await db.update(site_sections)
              .set({ content, updatedAt: new Date() })
              .where(eq(site_sections.id, existing.id))
              .returning();
          return updated;
      } else {
          const [created] = await db.insert(site_sections)
              .values({ pageSlug, sectionKey, content })
              .returning();
          return created;
      }
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.date);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Media
  async getMedia(): Promise<MediaItem[]> {
    return await db.select().from(media).orderBy(media.uploadedAt);
  }

  async getMediaItem(id: number): Promise<MediaItem | undefined> {
    const [item] = await db.select().from(media).where(eq(media.id, id));
    return item;
  }

  async createMedia(item: InsertMedia): Promise<MediaItem> {
    const [newItem] = await db.insert(media).values(item).returning();
    return newItem;
  }

  async deleteMedia(id: number): Promise<void> {
    await db.delete(media).where(eq(media.id, id));
  }

  // Settings
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSettings(newSettings: { key: string; value: any }[]): Promise<Setting[]> {
    const updatedSettings: Setting[] = [];
    for (const setting of newSettings) {
      // Check if exists first to handle unique constraint safely
      const [existing] = await db.select().from(settings).where(eq(settings.key, setting.key));
      
      if (existing) {
        const [updated] = await db
          .update(settings)
          .set({ value: setting.value, updatedAt: new Date() })
          .where(eq(settings.id, existing.id))
          .returning();
        updatedSettings.push(updated);
      } else {
        const [created] = await db
          .insert(settings)
          .values(setting)
          .returning();
        updatedSettings.push(created);
      }
    }
    return updatedSettings;
  }

  // Dashboard Shortcuts
  async getShortcuts(): Promise<DashboardShortcut[]> {
    return await db.select().from(dashboard_shortcuts).orderBy(dashboard_shortcuts.order);
  }

  async createShortcut(shortcut: InsertDashboardShortcut): Promise<DashboardShortcut> {
    const [newShortcut] = await db.insert(dashboard_shortcuts).values(shortcut).returning();
    return newShortcut;
  }

  async deleteShortcut(id: number): Promise<void> {
    await db.delete(dashboard_shortcuts).where(eq(dashboard_shortcuts.id, id));
  }
}

export const storage = new DatabaseStorage();

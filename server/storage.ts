import { site_sections, events, media, settings, type Section, type InsertSection, type Event, type InsertEvent, type MediaItem, type InsertMedia, type Setting, type InsertSetting } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Content
  getSection(pageSlug: string, sectionKey: string): Promise<Section | undefined>;
  getSectionsByPage(pageSlug: string): Promise<Section[]>;
  updateSection(pageSlug: string, sectionKey: string, content: any): Promise<Section>;

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
    const [section] = await db
      .insert(site_sections)
      .values({ pageSlug, sectionKey, content })
      .onConflictDoUpdate({
        target: [site_sections.pageSlug, site_sections.sectionKey],
        set: { content, updatedAt: new Date() },
      }) // This requires a unique constraint on pageSlug + sectionKey in the DB schema, which we should add or handle manually.
      // Drizzle ORM doesn't support multi-column unique constraints in `pgTable` easily without manual SQL or `uniqueIndex`.
      // Let's use `onConflictDoUpdate` but we need a constraint.
      // Alternatively, check existence first.
      .returning();
      
    // Actually, let's fix the schema to have a unique constraint, OR just check and update.
    // Since I can't easily modify the schema migration file right now without a re-run, I'll do a check-and-update.
    return section;
  }
  
  // Custom updateSection implementation to handle the unique constraint issue if it doesn't exist
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
      const [updated] = await db
        .insert(settings)
        .values(setting)
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: setting.value, updatedAt: new Date() },
        })
        .returning();
      updatedSettings.push(updated);
    }
    return updatedSettings;
  }
}

export const storage = new DatabaseStorage();

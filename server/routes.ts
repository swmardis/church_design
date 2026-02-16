import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // === Content Routes ===
  app.get(api.content.getPage.path, async (req, res) => {
    const { page } = req.params;
    const sections = await storage.getSectionsByPage(page);
    res.json(sections);
  });

  app.post(api.content.updateSection.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const { page, sectionKey } = req.params;
    const { content } = req.body;
    
    // Using the safe update method since unique constraints might be tricky in lite build
    const section = await storage.updateSectionSafe(page, sectionKey, content);
    res.json(section);
  });

  // === Event Routes ===
  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const input = api.events.create.input.parse(req.body);
      const event = await storage.createEvent(input);
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.events.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const input = api.events.update.input.parse(req.body);
      const event = await storage.updateEvent(Number(req.params.id), input);
      if (!event) return res.status(404).json({ message: "Event not found" });
      res.json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.events.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    await storage.deleteEvent(Number(req.params.id));
    res.status(204).send();
  });

  // === Media Routes ===
  app.get(api.media.list.path, async (req, res) => {
    const items = await storage.getMedia();
    res.json(items);
  });

  app.post(api.media.upload.path, upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const item = await storage.createMedia({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
    });
    
    res.status(201).json(item);
  });

  app.delete(api.media.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const id = Number(req.params.id);
    const item = await storage.getMediaItem(id);
    if (!item) return res.status(404).json({ message: "Media not found" });

    // Try to delete file from disk
    const filePath = path.join(uploadDir, path.basename(item.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await storage.deleteMedia(id);
    res.status(204).send();
  });

  // === Settings Routes ===
  app.get(api.settings.list.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post(api.settings.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const input = api.settings.update.input.parse(req.body);
    const settings = await storage.updateSettings(input);
    res.json(settings);
  });
  
  // === PCO Integration (Mock for now) ===
  app.post("/api/pco/sync", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    // In a real implementation, this would fetch from PCO API
    // For now, let's just return a success message
    res.json({ message: "Synced successfully (Mock)", count: 0 });
  });

  // === Seed Data (Init) ===
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const sections = await storage.getSectionsByPage("home");
  if (sections.length === 0) {
    // Seed Home Page
    await storage.updateSectionSafe("home", "hero", {
      title: "Welcome to Our Church",
      subtitle: "A place to call home",
      primaryButtonText: "Join Us",
      primaryButtonUrl: "/next-steps",
      secondaryButtonText: "Watch Online",
      secondaryButtonUrl: "/events",
      backgroundImage: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80"
    });
    
    await storage.updateSectionSafe("home", "schedule", {
      title: "Weekly Schedule",
      description: "Join us every Sunday at 9:00 AM and 11:00 AM. We also have youth groups on Wednesdays.",
      image: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&q=80",
      times: [
        { label: "Classic Service", time: "9:00 AM" },
        { label: "Modern Service", time: "11:00 AM" }
      ]
    });
    
    await storage.updateSectionSafe("home", "featured", {
      cards: [
        { title: "New Here?", body: "Plan your visit and see what we're about.", buttonText: "Learn More", buttonUrl: "/about", image: "https://images.unsplash.com/photo-1507643179173-617d699f8696?auto=format&fit=crop&q=80" },
        { title: "Get Involved", body: "Find a group or serve with us.", buttonText: "Next Steps", buttonUrl: "/next-steps", image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80" },
        { title: "Events", body: "See what's coming up next.", buttonText: "View Calendar", buttonUrl: "/events", image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80" }
      ]
    });
  }

  // Seed About Page
  const aboutSections = await storage.getSectionsByPage("about");
  if (aboutSections.length === 0) {
    await storage.updateSectionSafe("about", "intro", {
      title: "Who We Are",
      body: "We are a community of believers passionate about sharing the love of Christ. Our mission is to love God, love people, and make disciples.",
      imageUrl: "https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&q=80"
    });
    
    await storage.updateSectionSafe("about", "values", {
      title: "What to Expect",
      body: "Join us for a time of worship, teaching, and fellowship. Come as you are! We have programs for kids, youth, and adults.",
      imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80"
    });
    
    await storage.updateSectionSafe("about", "team", {
      leaders: [
        { name: "Pastor John Doe", role: "Lead Pastor", imageUrl: "" },
        { name: "Jane Smith", role: "Worship Leader", imageUrl: "" }
      ]
    });
  }

  // Seed Next Steps Page
  const nextStepsSections = await storage.getSectionsByPage("next-steps");
  if (nextStepsSections.length === 0) {
    await storage.updateSectionSafe("next-steps", "steps", {
      list: [
        { title: "Attend a Service", description: "Join us this Sunday at 9AM or 11AM.", buttonText: "Plan Your Visit", buttonUrl: "/", imageUrl: "" },
        { title: "Join a Group", description: "Find community and grow together in a small group.", buttonText: "Find a Group", buttonUrl: "/events", imageUrl: "" },
        { title: "Start Serving", description: "Make a difference by joining a volunteer team.", buttonText: "Join a Team", buttonUrl: "/contact", imageUrl: "" }
      ]
    });
  }

  // Seed Contact Page
  const contactSections = await storage.getSectionsByPage("contact");
  if (contactSections.length === 0) {
    await storage.updateSectionSafe("contact", "info", {
      address: "123 Main St, Anytown, USA",
      email: "info@church.com",
      phone: "(555) 123-4567",
      serviceTimes: "Sundays at 9:00 AM & 11:00 AM"
    });
  }
  
  const settings = await storage.getSettings();
  if (settings.length === 0) {
    await storage.updateSettings([
      { key: "site_name", value: "Grace Community Church" },
      { key: "primary_color", value: "hsl(222.2 47.4% 11.2%)" },
      { key: "secondary_color", value: "hsl(210 40% 96.1%)" },
      { key: "contact_email", value: "info@church.com" },
      { key: "contact_phone", value: "(555) 123-4567" },
      { key: "contact_address", value: "123 Main St, Anytown, USA" }
    ]);
  }
  
  const events = await storage.getEvents();
  if (events.length === 0) {
    await storage.createEvent({
      title: "Sunday Service",
      date: new Date(Date.now() + 86400000 * 3), // 3 days from now
      time: "10:00 AM",
      location: "Main Sanctuary",
      description: "Join us for worship and a message.",
      imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80",
      tags: ["service", "worship"],
      isPlanningCenter: false
    });
    
    await storage.createEvent({
      title: "Youth Group",
      date: new Date(Date.now() + 86400000 * 5), // 5 days from now
      time: "6:30 PM",
      location: "Youth Hall",
      description: "Fun, games, and fellowship for grades 6-12.",
      imageUrl: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80",
      tags: ["youth"],
      isPlanningCenter: false
    });
  }
}

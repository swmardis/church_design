import type { Express, RequestHandler } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";
import { z } from "zod";

export const isAdminLeader: RequestHandler = async (req: any, res, next) => {
  if (!req.isAuthenticated() || !req.user?.claims?.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await authStorage.getUser(req.user.claims.sub);
  if (!user || user.role !== "admin_leader") {
    return res.status(403).json({ message: "Access denied. Admin leader role required." });
  }
  next();
};

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdminLeader, async (_req, res) => {
    try {
      const users = await authStorage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, isAdminLeader, async (req, res) => {
    try {
      const { id } = req.params;
      const schema = z.object({ role: z.enum(["pending", "approved", "admin_leader", "denied"]) });
      const { role } = schema.parse(req.body);
      const user = await authStorage.updateUserRole(id as string, role);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.post("/api/admin/users", isAuthenticated, isAdminLeader, async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        role: z.enum(["approved", "admin_leader"]),
      });
      const data = schema.parse(req.body);
      const user = await authStorage.createUserManually(data);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, isAdminLeader, async (req: any, res) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user.claims.sub;
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot remove yourself" });
      }
      await authStorage.updateUserRole(id, "denied");
      res.status(200).json({ message: "User access removed" });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ message: "Failed to remove user" });
    }
  });
}

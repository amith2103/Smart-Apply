import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Applications CRUD
  app.get(api.applications.list.path, async (req, res) => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      sponsorshipStatus: req.query.sponsorshipStatus as string,
      sort: req.query.sort as string,
    };
    const apps = await storage.getApplications(filters);
    res.json(apps);
  });

  app.get(api.applications.get.path, async (req, res) => {
    const appItem = await storage.getApplication(Number(req.params.id));
    if (!appItem) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(appItem);
  });

  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const appItem = await storage.createApplication(input);
      res.status(201).json(appItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.applications.update.path, async (req, res) => {
    try {
      const input = api.applications.update.input.parse(req.body);
      const appItem = await storage.updateApplication(Number(req.params.id), input);
      res.json(appItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.applications.delete.path, async (req, res) => {
    await storage.deleteApplication(Number(req.params.id));
    res.status(204).send();
  });

  // Analytics
  app.get(api.analytics.dashboard.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getApplications();
  if (existing.length === 0) {
    const now = new Date();
    
    // Sample 1: Tech Corp - Interviewing
    await storage.createApplication({
      companyName: "Tech Corp",
      jobTitle: "Senior Frontend Engineer",
      location: "San Francisco, CA",
      dateApplied: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      status: "Interviewing",
      priority: "High",
      sponsorshipStatus: "Offered",
      workAuthorization: "H1B",
      salaryRange: "$160k - $200k",
      notes: "First round went well. Waiting for system design round."
    });

    // Sample 2: Startup Inc - Applied
    await storage.createApplication({
      companyName: "Startup Inc",
      jobTitle: "Full Stack Developer",
      location: "Remote",
      dateApplied: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "Applied",
      priority: "Medium",
      sponsorshipStatus: "Not offered",
      workAuthorization: "Green Card",
      notes: "Applied via LinkedIn."
    });

    // Sample 3: Big Data Co - Rejected
    await storage.createApplication({
      companyName: "Big Data Co",
      jobTitle: "Data Engineer",
      location: "New York, NY",
      dateApplied: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      status: "Rejected",
      priority: "Low",
      sponsorshipStatus: "Required",
      workAuthorization: "H1B",
      notes: "Automated rejection email."
    });

    // Sample 4: Cloud Systems - Offer
    await storage.createApplication({
      companyName: "Cloud Systems",
      jobTitle: "DevOps Engineer",
      location: "Austin, TX",
      dateApplied: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      status: "Offer",
      priority: "High",
      sponsorshipStatus: "Offered",
      workAuthorization: "H1B",
      salaryRange: "$150k",
      notes: "Offer received! Deadline next Friday."
    });

    // Sample 5: Future AI - Applied, Overdue Follow-up
    await storage.createApplication({
      companyName: "Future AI",
      jobTitle: "ML Ops Engineer",
      location: "Seattle, WA",
      dateApplied: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      status: "Applied",
      priority: "High",
      sponsorshipStatus: "Unknown",
      workAuthorization: "F1",
      followUpDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (OVERDUE)
      followUpDone: false,
      notes: "Reach out to recruiter if no response by Monday."
    });
  }
}

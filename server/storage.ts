import { db } from "./db";
import {
  applications,
  type Application,
  type InsertApplication,
  type UpdateApplicationRequest,
  type DashboardStats
} from "@shared/schema";
import { eq, desc, asc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getApplications(filters?: {
    search?: string;
    status?: string;
    sponsorshipStatus?: string;
    sort?: string;
  }): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: UpdateApplicationRequest): Promise<Application>;
  deleteApplication(id: number): Promise<void>;
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  async getApplications(filters?: {
    search?: string;
    status?: string;
    sponsorshipStatus?: string;
    sort?: string;
  }): Promise<Application[]> {
    let query = db.select().from(applications);
    const conditions = [];

    if (filters?.search) {
      conditions.push(
        sql`(${applications.companyName} ILIKE ${`%${filters.search}%`} OR ${applications.jobTitle} ILIKE ${`%${filters.search}%`})`
      );
    }
    
    if (filters?.status) {
      conditions.push(eq(applications.status, filters.status));
    }
    
    if (filters?.sponsorshipStatus) {
      conditions.push(eq(applications.sponsorshipStatus, filters.sponsorshipStatus));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (filters?.sort === 'newest') {
      query = query.orderBy(desc(applications.dateApplied)) as any;
    } else if (filters?.sort === 'followUp') {
      query = query.orderBy(asc(applications.followUpDate)) as any; // nulls last by default in PG usually, but might need handling
    } else if (filters?.sort === 'priority') {
      // Simple sort, real implementation might need case mapping for High>Medium>Low
      query = query.orderBy(desc(applications.priority)) as any;
    } else {
      query = query.orderBy(desc(applications.dateApplied)) as any;
    }

    return await query;
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app;
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async updateApplication(id: number, updates: UpdateApplicationRequest): Promise<Application> {
    const [updated] = await db.update(applications)
      .set(updates)
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const allApps = await db.select().from(applications);

    const counts = {
      totalApplications: allApps.length,
      interviewsCount: allApps.filter(a => a.status === 'Interviewing').length,
      offersCount: allApps.filter(a => a.status === 'Offer').length,
      rejectionsCount: allApps.filter(a => a.status === 'Rejected').length,
      sponsorshipOfferedCount: allApps.filter(a => a.sponsorshipStatus === 'Offered').length,
      overdueFollowUpsCount: allApps.filter(a => {
        return a.followUpDate && new Date(a.followUpDate) < new Date() && !a.followUpDone;
      }).length
    };

    // Calculate Charts Data
    const statusMap = new Map<string, number>();
    const sponsorMap = new Map<string, number>();
    
    allApps.forEach(app => {
      statusMap.set(app.status, (statusMap.get(app.status) || 0) + 1);
      sponsorMap.set(app.sponsorshipStatus, (sponsorMap.get(app.sponsorshipStatus) || 0) + 1);
    });

    const statusBreakdown = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
    const sponsorshipBreakdown = Array.from(sponsorMap.entries()).map(([name, value]) => ({ name, value }));

    // Mock trend for now or aggregation (simple weekly aggregation based on dateApplied)
    // For MVP efficiency, grouping by last 8 weeks roughly
    const applicationsTrend = [];
    // (Implementation of trend aggregation skipped for brevity in this simple storage class, 
    // but in a real app would use SQL grouping)
    // Let's do a simple JS aggregation
    const weeks = new Map<string, number>();
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const label = `Week ${8-i}`; // Simplified label
        weeks.set(label, 0); // Initialize
    }
    
    // Naive bucket fill
    allApps.forEach(app => {
        // very rough bucket logic for MVP
        const weekDiff = Math.floor((now.getTime() - new Date(app.dateApplied).getTime()) / (1000 * 60 * 60 * 24 * 7));
        if (weekDiff < 8 && weekDiff >= 0) {
            const label = `Week ${8-weekDiff}`;
            weeks.set(label, (weeks.get(label) || 0) + 1);
        }
    });
    
    for (const [periodLabel, count] of weeks.entries()) {
        applicationsTrend.push({ periodLabel, count });
    }

    return {
      counts,
      chartData: {
        statusBreakdown,
        sponsorshipBreakdown,
        applicationsTrend
      }
    };
  }
}

export const storage = new DatabaseStorage();

import { pgTable, text, serial, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  jobTitle: text("job_title").notNull(),
  location: text("location"),
  jobLink: text("job_link"),
  dateApplied: timestamp("date_applied").defaultNow().notNull(),
  status: text("status", { enum: ["Applied", "Interviewing", "Offer", "Rejected"] }).notNull().default("Applied"),
  priority: text("priority", { enum: ["Low", "Medium", "High"] }).default("Medium"),
  salaryRange: text("salary_range"),
  notes: text("notes"),
  
  // Visa Sponsorship Tracking
  sponsorshipStatus: text("sponsorship_status", { 
    enum: ["Not needed", "Required", "Offered", "Not offered", "Unknown"] 
  }).notNull().default("Unknown"),
  workAuthorization: text("work_authorization", { 
    enum: ["H1B", "OPT", "CPT", "F1", "Green Card", "Citizen", "Other"] 
  }).notNull().default("F1"),
  sponsorshipNotes: text("sponsorship_notes"),

  // Follow-up Tracking
  followUpDate: timestamp("follow_up_date"),
  followUpDone: boolean("follow_up_done").default(false),
});

export const insertApplicationSchema = createInsertSchema(applications, {
  dateApplied: z.coerce.date().default(() => new Date()),
  followUpDate: z.coerce.date().optional().nullable(),
}).omit({ 
  id: true,
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type CreateApplicationRequest = InsertApplication;
export type UpdateApplicationRequest = Partial<InsertApplication>;

export type DashboardStats = {
  counts: {
    totalApplications: number;
    interviewsCount: number;
    offersCount: number;
    rejectionsCount: number;
    sponsorshipOfferedCount: number;
    overdueFollowUpsCount: number;
  };
  chartData: {
    statusBreakdown: { name: string; value: number }[];
    sponsorshipBreakdown: { name: string; value: number }[];
    applicationsTrend: { periodLabel: string; count: number }[]; // Weekly trend
  };
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertApplication } from "@shared/schema";

export function useApplications(filters?: { 
  search?: string; 
  status?: "Applied" | "Interviewing" | "Offer" | "Rejected";
  sponsorshipStatus?: "Not needed" | "Required" | "Offered" | "Not offered" | "Unknown";
  sort?: "newest" | "followUp" | "priority";
}) {
  const queryKey = [api.applications.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Build query string manually or use URLSearchParams
      const url = new URL(window.location.origin + api.applications.list.path);
      if (filters?.search) url.searchParams.set("search", filters.search);
      if (filters?.status) url.searchParams.set("status", filters.status);
      if (filters?.sponsorshipStatus) url.searchParams.set("sponsorshipStatus", filters.sponsorshipStatus);
      if (filters?.sort) url.searchParams.set("sort", filters.sort);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      return api.applications.list.responses[200].parse(await res.json());
    },
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: [api.applications.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.applications.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch application");
      return api.applications.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertApplication) => {
      // Format dates properly before sending
      const payload = {
        ...data,
        dateApplied: data.dateApplied ? new Date(data.dateApplied) : new Date(),
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      };

      const res = await fetch(api.applications.create.path, {
        method: api.applications.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create application");
      }
      return api.applications.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.dashboard.path] });
    },
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertApplication>) => {
       // Format dates properly before sending
       const payload = {
        ...updates,
        dateApplied: updates.dateApplied ? new Date(updates.dateApplied) : undefined,
        followUpDate: updates.followUpDate ? new Date(updates.followUpDate) : undefined,
      };

      const url = buildUrl(api.applications.update.path, { id });
      const res = await fetch(url, {
        method: api.applications.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update application");
      return api.applications.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.dashboard.path] });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.applications.delete.path, { id });
      const res = await fetch(url, { 
        method: api.applications.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete application");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.analytics.dashboard.path] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.analytics.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.dashboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.analytics.dashboard.responses[200].parse(await res.json());
    },
  });
}

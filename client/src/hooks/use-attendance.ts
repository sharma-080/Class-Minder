import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useAttendance(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [api.attendance.list.path, startDate, endDate],
    queryFn: async () => {
      // Construct URL with query params
      const url = new URL(api.attendance.list.path, window.location.origin);
      if (startDate) url.searchParams.set("startDate", startDate);
      if (endDate) url.searchParams.set("endDate", endDate);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "scheduled" | "present" | "absent" | "cancelled" }) => {
      const validated = api.attendance.update.input.parse({ status });
      const url = buildUrl(api.attendance.update.path, { id });
      const res = await fetch(url, {
        method: api.attendance.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update attendance");
      return api.attendance.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.attendance.stats.path] });
    },
  });
}

export function useAttendanceStats() {
  return useQuery({
    queryKey: [api.attendance.stats.path],
    queryFn: async () => {
      const res = await fetch(api.attendance.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.attendance.stats.responses[200].parse(await res.json());
    },
  });
}

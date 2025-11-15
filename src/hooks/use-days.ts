import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Day } from "@/types";
import { DEMO_USER_ID } from "@/lib/constants";

// TODO: Replace with actual user ID from auth
const TEMP_USER_ID = DEMO_USER_ID;

// Query keys
export const daysKeys = {
  all: ["days"] as const,
  lists: () => [...daysKeys.all, "list"] as const,
  list: (userId: string) => [...daysKeys.lists(), userId] as const,
  details: () => [...daysKeys.all, "detail"] as const,
  detail: (id: string) => [...daysKeys.details(), id] as const,
};

// Fetch all days
export function useDays() {
  return useQuery({
    queryKey: daysKeys.list(TEMP_USER_ID),
    queryFn: async () => {
      const res = await fetch("/api/days");
      if (!res.ok) throw new Error("Failed to fetch days");
      const data = await res.json();
      return data.data as Day[];
    },
  });
}

// Fetch single day
export function useDay(id: string | null) {
  return useQuery({
    queryKey: daysKeys.detail(id!),
    queryFn: async () => {
      const res = await fetch(`/api/days/${id}`);
      if (!res.ok) throw new Error("Failed to fetch day");
      const data = await res.json();
      return data.data as Day;
    },
    enabled: !!id,
  });
}

// Create day
export function useCreateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { date: Date; title?: string }) => {
      const res = await fetch("/api/days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: TEMP_USER_ID,
        }),
      });
      if (!res.ok) throw new Error("Failed to create day");
      const result = await res.json();
      return result.data as Day;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: daysKeys.lists() });
    },
  });
}

// Update day
export function useUpdateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/days/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to update day");
      const result = await res.json();
      return result.data as Day;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: daysKeys.lists() });
      queryClient.invalidateQueries({ queryKey: daysKeys.detail(variables.id) });
    },
  });
}

// Delete day
export function useDeleteDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/days/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete day");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: daysKeys.lists() });
    },
  });
}

// Pin/Unpin day
export function usePinDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const res = await fetch(`/api/days/${id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      if (!res.ok) throw new Error("Failed to pin/unpin day");
      const result = await res.json();
      return result.data as Day;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: daysKeys.lists() });
    },
  });
}

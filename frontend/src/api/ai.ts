import { api } from "./axios";

export const aiApi = {
  categorize: (title: string, description?: string) =>
    api.post("/ai/categorize", { title, description }).then((r) => r.data),
  tripSummary: (tripId: string) => api.get(`/ai/trips/${tripId}/summary`).then((r) => r.data),
  costOptimization: (tripId: string) => api.get(`/ai/trips/${tripId}/cost-optimization`).then((r) => r.data),
  ask: (tripId: string, question: string) =>
    api.post(`/ai/trips/${tripId}/ask`, { question }).then((r) => r.data),
  budgetPlanner: (data: { destination: string; people: number; days: number; totalBudget: number }) =>
    api.post("/ai/budget-planner", data).then((r) => r.data),
  voiceExpense: (transcript: string) => api.post("/ai/voice-expense", { transcript }).then((r) => r.data),
  tripPlanner: (data: {
    destination?: string;
    people: number;
    days: number;
    motive: string;
    budget?: number;
    departureFrom?: string;
    transportMode?: string;
  }) => api.post("/ai/trip-planner", data).then((r) => r.data),
};

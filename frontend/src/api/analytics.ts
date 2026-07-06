import { api } from "./axios";

export const analyticsApi = {
  dashboard: () => api.get("/analytics/dashboard").then((r) => r.data),
  tripAnalytics: (tripId: string) => api.get(`/analytics/trips/${tripId}`).then((r) => r.data),
};

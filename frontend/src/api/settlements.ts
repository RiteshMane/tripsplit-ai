import { api } from "./axios";

export const settlementsApi = {
  list: (tripId: string) => api.get(`/trips/${tripId}/settlements`).then((r) => r.data),
  generate: (tripId: string) => api.post(`/trips/${tripId}/settlements/generate`).then((r) => r.data),
  markPaid: (tripId: string, id: string) =>
    api.patch(`/trips/${tripId}/settlements/${id}/pay`).then((r) => r.data),
  clearHistory: (tripId: string) => api.delete(`/trips/${tripId}/settlements/history`).then((r) => r.data),
};

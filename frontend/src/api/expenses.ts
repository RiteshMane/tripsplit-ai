import { api } from "./axios";

export const expensesApi = {
  list: (tripId: string, params?: { category?: string; search?: string }) =>
    api.get(`/trips/${tripId}/expenses`, { params }).then((r) => r.data),
  create: (tripId: string, data: any) => api.post(`/trips/${tripId}/expenses`, data).then((r) => r.data),
  update: (tripId: string, id: string, data: any) =>
    api.put(`/trips/${tripId}/expenses/${id}`, data).then((r) => r.data),
  remove: (tripId: string, id: string) => api.delete(`/trips/${tripId}/expenses/${id}`).then((r) => r.data),
};

import { api } from "./axios";

export const tripsApi = {
  list: () => api.get("/trips").then((r) => r.data),
  get: (id: string) => api.get(`/trips/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/trips", data).then((r) => r.data),
  update: (id: string, data: any) => api.put(`/trips/${id}`, data).then((r) => r.data),
  remove: (id: string) => api.delete(`/trips/${id}`).then((r) => r.data),
  addMember: (id: string, email: string) => api.post(`/trips/${id}/members`, { email }).then((r) => r.data),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/trips/${id}/members/${memberId}`).then((r) => r.data),
};

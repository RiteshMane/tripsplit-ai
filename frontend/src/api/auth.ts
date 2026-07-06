import { api } from "./axios";

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  updateProfile: (data: { name?: string; avatar?: string; darkMode?: boolean }) =>
    api.put("/auth/me", data).then((r) => r.data),
};

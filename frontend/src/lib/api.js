import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("ngca_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }).then(r => r.data),
  me: () => api.get("/auth/me").then(r => r.data),
};

export const contentApi = {
  get: () => api.get("/content").then(r => r.data),
  update: (body) => api.put("/content", body).then(r => r.data),
};

export const coursesApi = {
  list: () => api.get("/courses").then(r => r.data),
  create: (b) => api.post("/courses", b).then(r => r.data),
  update: (id, b) => api.put(`/courses/${id}`, b).then(r => r.data),
  remove: (id) => api.delete(`/courses/${id}`).then(r => r.data),
};

export const admissionsApi = {
  submit: (formData) => axios.post(`${API}/admissions`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data),
  list: () => api.get("/admissions").then(r => r.data),
  remove: (id) => api.delete(`/admissions/${id}`).then(r => r.data),
  photoUrl: (id) => {
    const t = localStorage.getItem("ngca_token");
    return `${API}/admissions/${id}/photo?auth=${encodeURIComponent(t || "")}`;
  },
};

export const galleryApi = {
  list: () => api.get("/gallery").then(r => r.data),
  upload: (file, caption) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("caption", caption || "");
    return api.post("/gallery", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
  },
  remove: (id) => api.delete(`/gallery/${id}`).then(r => r.data),
  imageUrl: (id) => `${API}/gallery/${id}/image`,
};

export async function streamChat({ sessionId, message, lang, onChunk }) {
  const resp = await fetch(`${API}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message, lang }),
  });
  if (!resp.ok || !resp.body) throw new Error("Chat request failed");
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

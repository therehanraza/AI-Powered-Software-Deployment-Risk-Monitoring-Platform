import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 20000
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adrm_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const unwrap = <T>(response: { data: { data: T } }) => response.data.data;

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return "Something went wrong";
}

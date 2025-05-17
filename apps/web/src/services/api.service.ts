// src/services/api.service.ts
const API_URL = process.env.API_URL || "http://localhost:3001";

export const ApiService = {
  async get(url: string) {
    const token = localStorage.getItem("jwtToken");

    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    return await response.json();
  },

  async post(url: string, data: any) {
    const token = localStorage.getItem("jwtToken");

    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    return await response.json();
  },

  async put(url: string, data: any) {
    // const router = useRouter();
    const token = localStorage.getItem("jwtToken");

    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    return await response.json();
  },

  // Similar implementations for post, put, delete, etc.
};

// src/services/auth.service.ts
const API_URL = process.env.API_URL || "http://localhost:3001";

export const AuthService = {
  async register(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return await response.json();
  },

  async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("jwtToken", data.token);
    return data;
  },

  async verifyToken(token: string) {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Invalid token");
    }

    return await response.json();
  },

  logout() {
    localStorage.removeItem("jwtToken");
  },

  getCurrentToken() {
    return localStorage.getItem("jwtToken");
  },
};

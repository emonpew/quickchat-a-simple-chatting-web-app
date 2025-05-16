// src/config.ts
export const JWT_SECRET =
  process.env.JWT_SECRET || "your-very-secure-secret-key";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // 7 days

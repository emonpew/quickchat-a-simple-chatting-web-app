// src/utils/prisma.ts
import { PrismaClient } from "../generated/prisma";

// Create a type for the PrismaClient singleton
type PrismaClientSingleton = ReturnType<typeof prismaClientExtension>;

// Function to create and configure the PrismaClient
const prismaClientExtension = () => {
  return new PrismaClient({
    log: [
      { level: "warn", emit: "event" },
      { level: "error", emit: "event" },
      // { level: 'query', emit: 'event' }, // Uncomment for query logging
    ],
  });
};

// Create the singleton instance
const prisma = prismaClientExtension();

// Add event listeners for logging
prisma.$on("warn", (e) => {
  console.warn("Prisma Warning:", e);
});

prisma.$on("error", (e) => {
  console.error("Prisma Error:", e);
});

// Optional: Add shutdown hook for graceful termination
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Export the singleton instance
export default prisma as PrismaClientSingleton;

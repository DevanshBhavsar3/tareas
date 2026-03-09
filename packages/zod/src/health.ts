import { z } from "zod";

export const HealthStatus = z.enum(["healthy", "unhealthy"]);

export const HealthCheck = z.object({
  status: HealthStatus,
  response_time: z.string(),
  error: z.string().optional(),
});

export const HealthResponse = z.object({
  status: HealthStatus,
  timestamp: z.iso.datetime(),
  environment: z.string(),
  checks: z.object({
    database: HealthCheck,
    redis: HealthCheck.optional(),
  }),
});

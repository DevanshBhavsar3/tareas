import { HealthResponse } from "@tareas/zod";
import type { ZodOpenApiOperationObject } from "zod-openapi";

export const getHealthOperation: ZodOpenApiOperationObject = {
  description: "Get health status",
  summary: "Get health",
  tags: ["Health"],
  parameters: [],
  operationId: "getHealth",
  responses: {
    "200": {
      description: "200",
      content: {
        "application/json": { schema: HealthResponse },
      },
    },
  },
};

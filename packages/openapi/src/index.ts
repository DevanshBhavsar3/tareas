import { createDocument } from "zod-openapi";
import { getHealthOperation } from "./health";

export const document = createDocument({
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "Tareas REST API - Documentation",
    description: "Tareas REST API - Documentation",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Local Server",
    },
  ],
  paths: {
    "/status": {
      get: getHealthOperation,
    },
  },
});

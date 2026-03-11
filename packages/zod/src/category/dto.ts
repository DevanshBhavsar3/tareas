import z from "zod";
import { TodoCategory } from "./category";

export const CreateCategoryPayload = TodoCategory.pick({
  name: true,
  color: true,
  description: true,
}).partial({
  description: true,
});

export const UpdateCategoryPayload = TodoCategory.pick({
  name: true,
  color: true,
  description: true,
}).partial();

export const GetCategoriesPayload = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sort: z.enum(["created_at", "updated_at", "name"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().min(1).optional(),
});

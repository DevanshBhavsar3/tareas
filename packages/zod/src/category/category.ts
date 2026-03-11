import z from "zod";

export const TodoCategory = z.object({
  id: z.uuid(),
  userId: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

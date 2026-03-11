import z from "zod";

export const TodoComment = z.object({
  id: z.uuid(),
  userId: z.string(),
  todoId: z.uuid(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

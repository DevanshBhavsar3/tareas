import z from "zod";
import { Todo, TodoPriority, TodoStatus } from "./todo";

export const GetTodosPayload = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sort: z
    .enum([
      "created_at",
      "updated_at",
      "title",
      "priority",
      "due_date",
      "status",
    ])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  search: z.string().min(1).optional(),
  status: TodoStatus.optional(),
  priority: TodoPriority.optional(),
  categoryId: z.uuid().optional(),
  parentTodoId: z.uuid().optional(),
  dueFrom: z.iso.datetime().optional(),
  dueTo: z.iso.datetime().optional(),
  overdue: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export const CreateTodoPayload = Todo.pick({
  title: true,
  description: true,
  priority: true,
  dueDate: true,
  parentTodoId: true,
  categoryId: true,
  metadata: true,
})
  .partial()
  .required({
    title: true,
  });

export const UpdateTodoPayload = Todo.pick({
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  parentTodoId: true,
  categoryId: true,
  metadata: true,
}).partial();

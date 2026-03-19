import z from "zod";
import { TodoCategory } from "../category";
import { TodoComment } from "../comment";

export const TodoStatus = z.enum(["draft", "active", "completed", "archived"]);

export const TodoPriority = z.enum(["low", "medium", "high"]);

export const TodoMetadata = z.object({
  tags: z.array(z.string()).optional(),
  reminder: z.string().optional(),
  color: z.string().optional(),
  difficulty: z.number().optional(),
});

export const Todo = z.object({
  id: z.uuid(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TodoStatus,
  priority: TodoPriority,
  dueDate: z.string().nullable(),
  completedAt: z.string().nullable(),
  parentTodoId: z.uuid().nullable(),
  categoryId: z.uuid().nullable(),
  metadata: TodoMetadata.nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PopulatedTodo = Todo.extend({
  category: TodoCategory.nullable(),
  children: z.array(Todo),
  comments: z.array(TodoComment),
});

export const TodoStats = z.object({
  total: z.number(),
  draft: z.number(),
  active: z.number(),
  completed: z.number(),
  archived: z.number(),
  overdue: z.number(),
});

import { TodoComment } from "./comment";

export const AddCommentPayload = TodoComment.pick({
  content: true,
});

export const UpdateCommentPayload = TodoComment.pick({
  content: true,
});

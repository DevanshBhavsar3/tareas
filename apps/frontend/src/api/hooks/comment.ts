import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../index'
import { QUERY_KEYS } from '../query-keys'
import type {
  AddCommentPayload,
  TodoComment,
  UpdateCommentPayload,
} from '@tareas/zod'
import z from 'zod'
import { showApiErrorToast } from '../utils'

type TGetCommentsByTodoIdResponse = z.infer<typeof TodoComment>[]

type TAddCommentPayload = z.infer<typeof AddCommentPayload>
type TAddCommentResponse = z.infer<typeof TodoComment>

type TUpdateCommentPayload = z.infer<typeof UpdateCommentPayload>
type TUpdateCommentResponse = z.infer<typeof TodoComment>

export function useGetCommentsByTodoId({
  todoId,
  enabled = true,
}: {
  todoId: string
  enabled?: boolean
}) {
  const api = useApiClient()

  return useQuery({
    queryKey: [QUERY_KEYS.COMMENTS.GET_COMMENTS_BY_TODO_ID, todoId],
    queryFn: async () => {
      const res = await api.get(`/todos/${todoId}/comments`)

      return res.data as TGetCommentsByTodoIdResponse
    },
    enabled: enabled && !!todoId,
    placeholderData: [],
  })
}

export function useAddComment() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      todoId,
      body,
    }: {
      todoId: string
      body: TAddCommentPayload
    }) => {
      const res = await api.post(`/todos/${todoId}/comments`, body)

      return res.data as TAddCommentResponse
    },
    onSuccess: (_, { todoId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COMMENTS.GET_COMMENTS_BY_TODO_ID, todoId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.GET_TODO_BY_ID, todoId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.ALL_TODOS],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to add comment')
    },
  })
}

export function useUpdateComment() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      commentId,
      body,
    }: {
      commentId: string
      body: TUpdateCommentPayload
    }) => {
      const res = await api.patch(`/comments/${commentId}`, body)

      return res.data as TUpdateCommentResponse
    },
    onSuccess: (updatedComment) => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.COMMENTS.GET_COMMENTS_BY_TODO_ID,
          updatedComment.todoId,
        ],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.GET_TODO_BY_ID, updatedComment.todoId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.ALL_TODOS],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to update comment')
    },
  })
}

export function useDeleteComment() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ commentId }: { commentId: string }) => {
      await api.delete(`/comments/${commentId}`)
    },
    onMutate: async ({ commentId }) => {
      // We need to find which todo this comment belongs to
      // This is a bit tricky without the todoId, but we can get it from the cache
      const queryCache = queryClient.getQueryCache()
      const commentQueries = queryCache.findAll({
        queryKey: [QUERY_KEYS.COMMENTS.GET_COMMENTS_BY_TODO_ID],
      })

      let todoId: string | null = null
      for (const query of commentQueries) {
        const comments = query.state.data as
          | TGetCommentsByTodoIdResponse
          | undefined
        if (comments && Array.isArray(comments)) {
          const comment = comments.find((c) => c.id === commentId)
          if (comment) {
            todoId = comment.todoId
            break
          }
        }
      }

      return { todoId }
    },
    onSuccess: (_, __, context) => {
      if (context?.todoId) {
        queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEYS.COMMENTS.GET_COMMENTS_BY_TODO_ID,
            context.todoId,
          ],
        })
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.TODOS.GET_TODO_BY_ID, context.todoId],
        })
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.ALL_TODOS],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to delete comment')
    },
  })
}

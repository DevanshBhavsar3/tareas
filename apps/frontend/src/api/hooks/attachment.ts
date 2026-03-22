import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../index'
import { QUERY_KEYS } from '../query-keys'
import { GetTodoAttachmentURLResponse, TodoAttachment } from '@tareas/zod'
import type z from 'zod'
import { showApiErrorToast } from '../utils'

type TUploadTodoAttachmentResponse = z.infer<typeof TodoAttachment>

type TGetTodoAttachmentURLResponse = z.infer<
  typeof GetTodoAttachmentURLResponse
>

export function useUploadTodoAttachment() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ todoId, file }: { todoId: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)

      const res = await api.post(`/todos/${todoId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return res.data as TUploadTodoAttachmentResponse
    },
    onSuccess: (_, { todoId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.GET_TODO_BY_ID, todoId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.TODO_ATTACHMENTS, todoId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.ALL_TODOS],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to upload attachment')
    },
  })
}

export function useDeleteTodoAttachment() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      todoId,
      attachmentId,
    }: {
      todoId: string
      attachmentId: string
    }) => {
      await api.delete(`/todos/${todoId}/attachments/${attachmentId}`)
    },
    onSuccess: (_, { todoId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.GET_TODO_BY_ID, todoId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.TODO_ATTACHMENTS, todoId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.ALL_TODOS],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to delete attachment')
    },
  })
}

export function useGetTodoAttachmentURL() {
  const api = useApiClient()

  return useMutation({
    mutationFn: async ({
      todoId,
      attachmentId,
    }: {
      todoId: string
      attachmentId: string
    }) => {
      const res = await api.get(
        `/todos/${todoId}/attachments/${attachmentId}/download`,
      )

      return res.data as TGetTodoAttachmentURLResponse
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to get download link')
    },
  })
}

import type {
  CreateCategoryPayload,
  GetCategoriesPayload,
  PaginatedResponse,
  TodoCategory,
  UpdateCategoryPayload,
} from '@tareas/zod'
import type z from 'zod'
import { useApiClient } from '../index'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '../query-keys'
import { showApiErrorToast } from '../utils'

type TGetAllCategoriesPayload = z.infer<typeof GetCategoriesPayload>
type TGetAllCategoriesResponse = PaginatedResponse<typeof TodoCategory>

type TGetCategoryByIdResponse = z.infer<typeof TodoCategory>

export type TCreateCategoryPayload = z.infer<typeof CreateCategoryPayload>
type TCreateCategoryResponse = z.infer<typeof TodoCategory>

export type TUpdateCategoryPayload = z.infer<typeof UpdateCategoryPayload>
type TUpdateCategoryResponse = z.infer<typeof TodoCategory>

export function useGetAllCategories({
  query,
}: {
  query?: TGetAllCategoriesPayload
}) {
  const api = useApiClient()

  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES.ALL_CATEGORIES, query],
    queryFn: async () => {
      const res = await api.get('/categories', {
        params: query,
      })

      return res.data as TGetAllCategoriesResponse
    },
    placeholderData: {
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 0,
    },
  })
}

export function useGetCategoryById({
  id,
  enabled = true,
}: {
  id: string
  enabled?: boolean
}) {
  const api = useApiClient()
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES.GET_CATEGORY_BY_ID, id],
    queryFn: async () => {
      const res = await api.get(`/categories/${id}`)

      return res.data as TGetCategoryByIdResponse
    },
    enabled: enabled && !!id,
  })
}

export function useCreateCategory() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ body }: { body: TCreateCategoryPayload }) => {
      const res = await api.post('/categories', body)

      return res.data as TCreateCategoryResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CATEGORIES.ALL_CATEGORIES],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to create category')
    },
  })
}

export function useUpdateCategory() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      categoryId,
      body,
    }: {
      categoryId: string
      body: TUpdateCategoryPayload
    }) => {
      const res = await api.patch(`/categories/${categoryId}`, body)

      return res.data as TUpdateCategoryResponse
    },
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CATEGORIES.ALL_CATEGORIES],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CATEGORIES.GET_CATEGORY_BY_ID, categoryId],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.ALL_TODOS],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to update category')
    },
  })
}

export function useDeleteCategory() {
  const api = useApiClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ categoryId }: { categoryId: string }) => {
      await api.delete(`/categories/${categoryId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CATEGORIES.ALL_CATEGORIES],
      })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TODOS.ALL_TODOS],
      })
    },
    onError: (err) => {
      showApiErrorToast(err, 'Failed to delete category')
    },
  })
}

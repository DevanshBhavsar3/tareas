import Button from '#/components/Button'
import { EmptyState, Spinner } from '#/components/ui'
import {
  TodoItem,
  TodoForm,
  TodoFilters,
  StatsCard,
  TodoDetail,
} from '#/components/todos'
import { CategoryForm, CategoryBadge } from '#/components/categories'
import {
  useGetAllTodos,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useGetTodoStats,
} from '#/api/hooks/todo'
import {
  useGetAllCategories,
  useCreateCategory,
  useDeleteCategory,
} from '#/api/hooks/category'
import { createFileRoute } from '@tanstack/react-router'
import {
  Plus,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderPlus,
  Inbox,
  Trash2,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useUser } from '@clerk/clerk-react'
import type {
  PopulatedTodo,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '@tareas/zod'
import type z from 'zod'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/todos/')({
  component: Dashboard,
})

type Todo = z.infer<typeof PopulatedTodo>
type CreatePayload = z.infer<typeof CreateTodoPayload>
type UpdatePayload = z.infer<typeof UpdateTodoPayload>

type Filters = {
  status?: string
  priority?: string
  categoryId?: string
  search?: string
}

function Dashboard() {
  const { user } = useUser()

  // State
  const [filters, setFilters] = useState<Filters>({})
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)

  // API hooks
  const { data: todosData, isLoading: todosLoading } = useGetAllTodos({
    query: {
      status: filters.status as any,
      priority: filters.priority as any,
      categoryId: filters.categoryId,
      search: filters.search,
      limit: 50,
    },
  })
  const { data: stats, isLoading: statsLoading } = useGetTodoStats()
  const { data: categoriesData } = useGetAllCategories({})

  const createTodo = useCreateTodo()
  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const createCategory = useCreateCategory()
  const deleteCategory = useDeleteCategory()

  const todos = (todosData?.data ?? []) as unknown as Todo[]
  const categories = (categoriesData?.data ?? []) as unknown as Array<{
    id: string
    name: string
    color: string
  }>

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Handlers
  const handleCreateTodo = (data: CreatePayload | UpdatePayload) => {
    createTodo.mutate(
      { body: data as CreatePayload },
      {
        onSuccess: () => {
          setShowTodoForm(false)
          toast.success('Task created successfully')
        },
      },
    )
  }

  const handleUpdateTodo = (data: CreatePayload | UpdatePayload) => {
    if (!editingTodo) return
    updateTodo.mutate(
      { todoId: editingTodo.id, body: data as UpdatePayload },
      {
        onSuccess: () => {
          setEditingTodo(null)
          toast.success('Task updated successfully')
        },
      },
    )
  }

  const handleToggleComplete = (todoId: string, completed: boolean) => {
    updateTodo.mutate({
      todoId,
      body: { status: completed ? 'completed' : 'active' },
    })
  }

  const handleDeleteTodo = (todoId: string) => {
    deleteTodo.mutate(
      { todoId },
      {
        onSuccess: () => toast.success('Task deleted'),
      },
    )
  }

  const handleCreateCategory = (data: any) => {
    createCategory.mutate(
      { body: data },
      {
        onSuccess: () => {
          setShowCategoryForm(false)
          toast.success('Category created')
        },
      },
    )
  }

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory.mutate(
      { categoryId },
      {
        onSuccess: () => toast.success('Category deleted'),
      },
    )
  }

  const pendingCount = (stats?.active ?? 0) + (stats?.draft ?? 0)

  return (
    <div className="min-h-screen bg-(--bg-primary)">
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            {greeting}, {user?.firstName ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            {pendingCount > 0
              ? `You have ${pendingCount} task${pendingCount === 1 ? '' : 's'} pending`
              : 'All caught up! Time to relax.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl border border-(--border-color) bg-(--bg-tertiary)"
              />
            ))
          ) : (
            <>
              <StatsCard
                label="Total"
                value={stats?.total ?? 0}
                icon={ListTodo}
              />
              <StatsCard
                label="Completed"
                value={stats?.completed ?? 0}
                icon={CheckCircle2}
                color="text-(--success)"
              />
              <StatsCard
                label="Pending"
                value={pendingCount}
                icon={Clock}
                color="text-(--info)"
              />
              <StatsCard
                label="Overdue"
                value={stats?.overdue ?? 0}
                icon={AlertTriangle}
                color="text-(--danger)"
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Task List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-(--border-color) bg-(--bg-primary)">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-(--border-color) px-5 py-4">
                <h2 className="font-medium text-(--text-primary)">My Tasks</h2>
                <Button size="sm" onClick={() => setShowTodoForm(true)}>
                  <Plus size={16} />
                  Add Task
                </Button>
              </div>

              {/* Filters */}
              <div className="border-b border-(--border-color) px-5 py-3">
                <TodoFilters filters={filters} onFiltersChange={setFilters} />
              </div>

              {/* Task Items */}
              {todosLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size={24} />
                </div>
              ) : todos.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No tasks found"
                  description={
                    filters.search ||
                    filters.status ||
                    filters.priority ||
                    filters.categoryId
                      ? 'Try adjusting your filters'
                      : 'Create your first task to get started'
                  }
                  action={
                    !filters.search &&
                    !filters.status &&
                    !filters.priority &&
                    !filters.categoryId ? (
                      <Button size="sm" onClick={() => setShowTodoForm(true)}>
                        <Plus size={16} />
                        Add Task
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="divide-y divide-(--border-color)">
                  {todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={handleToggleComplete}
                      onEdit={(t) => setEditingTodo(t)}
                      onDelete={handleDeleteTodo}
                      onClick={(t) => setSelectedTodo(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Categories */}
            <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-(--text-primary)">
                  Categories
                </h3>
                <Button
                  size="sm"
                  variant="icon"
                  onClick={() => setShowCategoryForm(true)}
                >
                  <FolderPlus size={16} />
                </Button>
              </div>

              {categories.length === 0 ? (
                <p className="text-sm text-(--text-muted) text-center py-4">
                  No categories yet
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="group relative">
                      <CategoryBadge
                        name={cat.name}
                        color={cat.color}
                        onClick={() =>
                          setFilters((f) =>
                            f.categoryId === cat.id
                              ? { ...f, categoryId: undefined }
                              : { ...f, categoryId: cat.id },
                          )
                        }
                      />
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="absolute -right-1 -top-1 size-4 rounded-full bg-(--danger) text-white opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick filters */}
            <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-4">
              <h3 className="text-sm font-medium text-(--text-primary) mb-3">
                Quick Filters
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setFilters({})}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    !filters.status
                      ? 'bg-(--bg-tertiary) text-(--text-primary)'
                      : 'text-(--text-muted) hover:bg-(--bg-hover)'
                  }`}
                >
                  <Inbox size={16} />
                  All Tasks
                </button>
                <button
                  onClick={() => setFilters({ status: 'active' })}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    filters.status === 'active'
                      ? 'bg-(--bg-tertiary) text-(--text-primary)'
                      : 'text-(--text-muted) hover:bg-(--bg-hover)'
                  }`}
                >
                  <Clock size={16} />
                  Active
                </button>
                <button
                  onClick={() => setFilters({ status: 'completed' })}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    filters.status === 'completed'
                      ? 'bg-(--bg-tertiary) text-(--text-primary)'
                      : 'text-(--text-muted) hover:bg-(--bg-hover)'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  Completed
                </button>
                <button
                  onClick={() => setFilters({ priority: 'high' })}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    filters.priority === 'high'
                      ? 'bg-(--bg-tertiary) text-(--text-primary)'
                      : 'text-(--text-muted) hover:bg-(--bg-hover)'
                  }`}
                >
                  <AlertTriangle size={16} />
                  High Priority
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <TodoForm
        isOpen={showTodoForm}
        onClose={() => setShowTodoForm(false)}
        onSubmit={handleCreateTodo}
        isLoading={createTodo.isPending}
      />

      <TodoForm
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        onSubmit={handleUpdateTodo}
        todo={editingTodo}
        isLoading={updateTodo.isPending}
      />

      <TodoDetail
        todo={selectedTodo}
        isOpen={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
      />

      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        onSubmit={handleCreateCategory}
        isLoading={createCategory.isPending}
      />
    </div>
  )
}

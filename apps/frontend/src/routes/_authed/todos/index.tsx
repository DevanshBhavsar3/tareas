import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { Badge } from '#/components/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '#/components/ui/context-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import {
  TodoItem,
  TodoForm,
  TodoFilters,
  StatsCard,
  TodoDetail,
  CreateTaskWizard,
} from '#/components/todos'
import { CategoryForm } from '#/components/categories'
import {
  useGetAllTodos,
  useUpdateTodo,
  useDeleteTodo,
  useGetTodoStats,
  type TUpdateTodoPayload,
} from '#/api/hooks/todo'
import {
  useGetAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type TCreateCategoryPayload,
  type TUpdateCategoryPayload,
} from '#/api/hooks/category'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  ListTodo,
  CheckmarkCircle02Icon,
  Clock01Icon,
  AlertCircleIcon,
  FolderAddIcon,
  InboxIcon,
  Delete01Icon,
  Edit01Icon,
  Archive01Icon,
  Flag01Icon,
  Settings01Icon,
  ArrowRight01Icon,
  FolderOpenIcon,
} from '@hugeicons/core-free-icons'
import { useState, useMemo, useCallback } from 'react'
import { useUser } from '@clerk/clerk-react'
import type { PopulatedTodo, TodoCategory } from '@tareas/zod'
import type z from 'zod'
import { toast } from 'sonner'
import { useDebounce } from '#/api/utils'
import { cn } from '#/lib/utils'

// Search params schema
type TodoSearchParams = {
  status?: string
  priority?: string
  categoryId?: string
  search?: string
}

export const Route = createFileRoute('/_authed/todos/')({
  component: Dashboard,
  validateSearch: (search: Record<string, unknown>): TodoSearchParams => {
    return {
      status: search.status as string | undefined,
      priority: search.priority as string | undefined,
      categoryId: search.categoryId as string | undefined,
      search: search.search as string | undefined,
    }
  },
})

type Todo = z.infer<typeof PopulatedTodo>
type Category = z.infer<typeof TodoCategory>

function Dashboard() {
  const { user } = useUser()
  const navigate = useNavigate()
  const searchParams = Route.useSearch()

  // State
  const [filters, setFilters] = useState<TodoSearchParams>({
    status: searchParams.status,
    priority: searchParams.priority,
    categoryId: searchParams.categoryId,
    search: searchParams.search,
  })
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  )
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null)

  const debouncedSearch = useDebounce(filters.search, 300)

  // Update URL when filters change
  const updateFilters = useCallback(
    (newFilters: TodoSearchParams) => {
      setFilters(newFilters)
      navigate({
        to: '/todos',
        search: {
          status: newFilters.status,
          priority: newFilters.priority,
          categoryId: newFilters.categoryId,
          search: newFilters.search,
        },
        replace: true,
      })
    },
    [navigate],
  )

  // API hooks
  const { data: todosData, isLoading: todosLoading } = useGetAllTodos({
    query: {
      status: filters.status as any,
      priority: filters.priority as any,
      categoryId: filters.categoryId,
      search: debouncedSearch,
      limit: 50,
    },
  })
  const { data: stats, isLoading: statsLoading } = useGetTodoStats()
  const { data: categoriesData } = useGetAllCategories({})

  const updateTodo = useUpdateTodo()
  const deleteTodo = useDeleteTodo()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const todos = (todosData?.data ?? []) as unknown as Todo[]
  const categories = (categoriesData?.data ?? []) as unknown as Category[]

  // Calculate category task counts
  const categoryTaskCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    todos.forEach((todo) => {
      if (todo.categoryId) {
        counts[todo.categoryId] = (counts[todo.categoryId] || 0) + 1
      }
    })
    return counts
  }, [todos])

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Handlers
  const handleUpdateTodo = (data: TUpdateTodoPayload) => {
    if (!editingTodo) return
    updateTodo.mutate(
      { todoId: editingTodo.id, body: data },
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

  const handleDeleteTodo = () => {
    if (!todoToDelete) return
    deleteTodo.mutate(
      { todoId: todoToDelete.id },
      {
        onSuccess: () => {
          setTodoToDelete(null)
          toast.success('Task deleted')
        },
      },
    )
  }

  const handleCreateCategory = (data: TCreateCategoryPayload) => {
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

  const handleUpdateCategory = (data: TUpdateCategoryPayload) => {
    if (!editingCategory) return
    updateCategory.mutate(
      { categoryId: editingCategory.id, body: data },
      {
        onSuccess: () => {
          setEditingCategory(null)
          toast.success('Category updated')
        },
      },
    )
  }

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return
    deleteCategory.mutate(
      { categoryId: categoryToDelete.id },
      {
        onSuccess: () => {
          setCategoryToDelete(null)
          if (filters.categoryId === categoryToDelete.id) {
            updateFilters({ ...filters, categoryId: undefined })
          }
          toast.success('Category deleted')
        },
      },
    )
  }

  const pendingCount = (stats?.active ?? 0) + (stats?.draft ?? 0)

  // Quick filters configuration
  const quickFilters: Array<{
    label: string
    icon: typeof InboxIcon
    filter: TodoSearchParams
    isActive: () => boolean
    count?: number
    color?: string
  }> = [
    {
      label: 'All Tasks',
      icon: InboxIcon,
      filter: {},
      isActive: () =>
        !filters.status && !filters.priority && !filters.categoryId,
      count: stats?.total,
    },
    {
      label: 'Active',
      icon: Clock01Icon,
      filter: { status: 'active' },
      isActive: () => filters.status === 'active',
      count: stats?.active,
      color: 'text-blue-500',
    },
    {
      label: 'Completed',
      icon: CheckmarkCircle02Icon,
      filter: { status: 'completed' },
      isActive: () => filters.status === 'completed',
      count: stats?.completed,
      color: 'text-green-500',
    },
    {
      label: 'High Priority',
      icon: Flag01Icon,
      filter: { priority: 'high' },
      isActive: () => filters.priority === 'high',
      color: 'text-red-500',
    },
    {
      label: 'Overdue',
      icon: AlertCircleIcon,
      filter: {}, // We'll filter client-side or add API support
      isActive: () => false, // Placeholder
      count: stats?.overdue,
      color: 'text-destructive',
    },
    {
      label: 'Archived',
      icon: Archive01Icon,
      filter: { status: 'archived' },
      isActive: () => filters.status === 'archived',
      count: stats?.archived,
    },
  ]

  return (
    <div className="min-h-screen bg-background px-6">
      <main className="mx-auto max-w-5xl py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {greeting}, {user?.firstName ?? 'there'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pendingCount > 0
                ? `You have ${pendingCount} task${pendingCount === 1 ? '' : 's'} pending`
                : 'All caught up! Time to relax.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/categories">
              <Button variant="outline" size="default">
                <HugeiconsIcon icon={FolderOpenIcon} size={18} />
                Categories
              </Button>
            </Link>
            <Button onClick={() => setShowCreateWizard(true)} size="default">
              <HugeiconsIcon icon={Add01Icon} size={18} />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
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
                icon={CheckmarkCircle02Icon}
                color="text-green-500"
              />
              <StatsCard
                label="Pending"
                value={pendingCount}
                icon={Clock01Icon}
                color="text-blue-500"
              />
              <StatsCard
                label="Overdue"
                value={stats?.overdue ?? 0}
                icon={AlertCircleIcon}
                color="text-destructive"
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Quick filters */}
            <div className="rounded-xl border bg-card">
              <div className="border-b px-4 py-3">
                <h3 className="text-sm font-medium">Filters</h3>
              </div>
              <div className="p-2">
                {quickFilters.map((qf) => {
                  const active = qf.isActive()
                  return (
                    <button
                      key={qf.label}
                      onClick={() =>
                        updateFilters({ ...qf.filter, search: filters.search })
                      }
                      className={cn(
                        'w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                        active
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <HugeiconsIcon
                          icon={qf.icon}
                          size={16}
                          className={cn(!active && qf.color)}
                        />
                        {qf.label}
                      </span>
                      {qf.count !== undefined && (
                        <Badge
                          variant={active ? 'default' : 'secondary'}
                          className="h-5 min-w-[20px] justify-center px-1.5 text-xs"
                        >
                          {qf.count}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-xl border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-sm font-medium">Categories</h3>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setShowCategoryForm(true)}
                      >
                        <HugeiconsIcon icon={FolderAddIcon} size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add category</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Link to="/categories">
                        <Button size="icon-sm" variant="ghost">
                          <HugeiconsIcon icon={Settings01Icon} size={16} />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Manage categories</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No categories yet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCategoryForm(true)}
                  >
                    <HugeiconsIcon icon={Add01Icon} size={14} />
                    Create Category
                  </Button>
                </div>
              ) : (
                <div className="p-2">
                  {categories.map((cat) => {
                    const isActive = filters.categoryId === cat.id
                    const taskCount = categoryTaskCounts[cat.id] || 0

                    return (
                      <ContextMenu key={cat.id}>
                        <ContextMenuTrigger>
                          <button
                            onClick={() =>
                              updateFilters({
                                ...filters,
                                categoryId: isActive ? undefined : cat.id,
                              })
                            }
                            className={cn(
                              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                              isActive
                                ? 'bg-primary/10 font-medium'
                                : 'hover:bg-muted',
                            )}
                          >
                            <span
                              className="size-3 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span
                              className={cn(
                                'flex-1 truncate',
                                isActive ? 'text-primary' : 'text-foreground',
                              )}
                            >
                              {cat.name}
                            </span>
                            {taskCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-5 min-w-[20px] justify-center px-1.5 text-xs"
                              >
                                {taskCount}
                              </Badge>
                            )}
                            <HugeiconsIcon
                              icon={ArrowRight01Icon}
                              size={14}
                              className={cn(
                                'text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity',
                                isActive && 'opacity-100',
                              )}
                            />
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            onClick={() => setEditingCategory(cat)}
                          >
                            <HugeiconsIcon icon={Edit01Icon} size={14} />
                            Edit
                          </ContextMenuItem>
                          <ContextMenuItem
                            variant="destructive"
                            onClick={() => setCategoryToDelete(cat)}
                          >
                            <HugeiconsIcon icon={Delete01Icon} size={14} />
                            Delete
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Task List */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border bg-card">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="font-medium">Tasks</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {todos.length} task{todos.length !== 1 ? 's' : ''}
                    {filters.status || filters.priority || filters.categoryId
                      ? ' (filtered)'
                      : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateWizard(true)}
                >
                  <HugeiconsIcon icon={Add01Icon} size={16} />
                  Add Task
                </Button>
              </div>

              {/* Filters */}
              <div className="border-b px-5 py-3">
                <TodoFilters
                  filters={filters}
                  onFiltersChange={(newFilters) =>
                    updateFilters({ ...filters, ...newFilters })
                  }
                />
              </div>

              {/* Task Items */}
              {todosLoading ? (
                <div className="space-y-2 p-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : todos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <HugeiconsIcon
                      icon={InboxIcon}
                      className="h-8 w-8 text-muted-foreground"
                    />
                  </div>
                  <h3 className="text-base font-medium mb-1">No tasks found</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    {filters.search ||
                    filters.status ||
                    filters.priority ||
                    filters.categoryId
                      ? 'Try adjusting your filters or search query'
                      : 'Create your first task to get started with your productivity journey'}
                  </p>
                  {!filters.search &&
                    !filters.status &&
                    !filters.priority &&
                    !filters.categoryId && (
                      <Button onClick={() => setShowCreateWizard(true)}>
                        <HugeiconsIcon icon={Add01Icon} size={16} />
                        Create Your First Task
                      </Button>
                    )}
                  {(filters.search ||
                    filters.status ||
                    filters.priority ||
                    filters.categoryId) && (
                    <Button variant="outline" onClick={() => updateFilters({})}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div>
                  {todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={handleToggleComplete}
                      onEdit={(t) => setEditingTodo(t)}
                      onDelete={(todoId) => {
                        const todoToDelete = todos.find((t) => t.id === todoId)
                        if (todoToDelete) setTodoToDelete(todoToDelete)
                      }}
                      onClick={(t) => setSelectedTodo(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateTaskWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
      />

      {/* Edit Todo Modal - hide when delete dialog is open to prevent stacking */}
      <TodoForm
        isOpen={!!editingTodo && !todoToDelete}
        onClose={() => setEditingTodo(null)}
        onSubmit={handleUpdateTodo}
        todo={editingTodo}
        isLoading={updateTodo.isPending}
      />

      {/* Todo Detail Modal - hide when delete dialog is open */}
      <TodoDetail
        todo={selectedTodo}
        isOpen={!!selectedTodo && !todoToDelete}
        onClose={() => setSelectedTodo(null)}
      />

      {/* Create Category Modal - hide when delete dialog is open */}
      <CategoryForm
        isOpen={showCategoryForm && !categoryToDelete}
        onClose={() => setShowCategoryForm(false)}
        onSubmit={handleCreateCategory}
        isLoading={createCategory.isPending}
      />

      {/* Edit Category Modal - hide when delete dialog is open */}
      <CategoryForm
        isOpen={!!editingCategory && !categoryToDelete}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
        category={editingCategory}
        isLoading={updateCategory.isPending}
      />

      {/* Delete Todo Confirmation */}
      <AlertDialog
        open={!!todoToDelete}
        onOpenChange={(open) => !open && setTodoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{todoToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTodo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

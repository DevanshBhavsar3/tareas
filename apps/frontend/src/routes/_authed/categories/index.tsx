import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { Input } from '#/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { CategoryForm } from '#/components/categories'
import {
  useGetAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type TCreateCategoryPayload,
  type TUpdateCategoryPayload,
} from '#/api/hooks/category'
import { createFileRoute, Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Add01Icon,
  FolderOpenIcon,
  MoreHorizontalIcon,
  Edit01Icon,
  Delete01Icon,
  Search01Icon,
  Tag01Icon,
  ChevronRight,
} from '@hugeicons/core-free-icons'
import { useState } from 'react'
import type { TodoCategory } from '@tareas/zod'
import type z from 'zod'
import { toast } from 'sonner'
import { useDebounce } from '#/api/utils'

export const Route = createFileRoute('/_authed/categories/')({
  component: CategoriesPage,
})

type Category = z.infer<typeof TodoCategory>

function CategoriesPage() {
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  )
  const [searchQuery, setSearchQuery] = useState('')

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: categoriesData, isLoading } = useGetAllCategories({
    query: {
      search: debouncedSearch || undefined,
      limit: 100,
    },
  })

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const categories = (categoriesData?.data ?? []) as unknown as Category[]

  const handleCreateCategory = (data: TCreateCategoryPayload) => {
    createCategory.mutate(
      { body: data },
      {
        onSuccess: () => {
          setShowCategoryForm(false)
          toast.success('Category created successfully')
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
          toast.success('Category updated successfully')
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
          toast.success('Category deleted')
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 ">
      <main className="mx-auto max-w-5xl py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize your tasks with custom categories
            </p>
          </div>
          <Button onClick={() => setShowCategoryForm(true)}>
            <HugeiconsIcon icon={Add01Icon} size={16} />
            New Category
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <HugeiconsIcon
                  icon={FolderOpenIcon}
                  className="h-8 w-8 text-muted-foreground"
                />
              </div>
              <h3 className="text-lg font-medium mb-1">No categories yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {searchQuery
                  ? 'No categories match your search. Try a different query.'
                  : 'Create your first category to start organizing your tasks.'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowCategoryForm(true)}>
                  <HugeiconsIcon icon={Add01Icon} size={16} />
                  Create Category
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${category.color}20`,
                          color: category.color,
                        }}
                      >
                        <HugeiconsIcon icon={Tag01Icon} size={20} />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {category.name}
                        </CardTitle>
                      </div>
                    </div>

                    {/* Actions menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        }
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingCategory(category)}
                        >
                          <HugeiconsIcon icon={Edit01Icon} size={14} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setCategoryToDelete(category)}
                        >
                          <HugeiconsIcon icon={Delete01Icon} size={14} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {category.description ? (
                    <CardDescription className="line-clamp-2">
                      {category.description}
                    </CardDescription>
                  ) : (
                    <CardDescription className="italic">
                      No description
                    </CardDescription>
                  )}

                  <Link
                    to="/todos"
                    search={{ categoryId: category.id }}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Related tasks
                    <HugeiconsIcon icon={ChevronRight} size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Category Modal */}
      <CategoryForm
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        onSubmit={handleCreateCategory}
        isLoading={createCategory.isPending}
      />

      {/* Edit Category Modal */}
      <CategoryForm
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSubmit={handleUpdateCategory}
        category={editingCategory}
        isLoading={updateCategory.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? Tasks
              in this category will not be deleted, but they will no longer be
              associated with this category.
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

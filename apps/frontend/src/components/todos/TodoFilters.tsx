import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { useGetAllCategories } from '#/api/hooks/category'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  Cancel01Icon,
  Flag01Icon,
  CircleIcon,
} from '@hugeicons/core-free-icons'
import { useMemo } from 'react'

type Filters = {
  status?: string
  priority?: string
  categoryId?: string
  search?: string
}

type TodoFiltersProps = {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
] as const

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
] as const

export default function TodoFilters({
  filters,
  onFiltersChange,
}: TodoFiltersProps) {
  const { data: categoriesData } = useGetAllCategories({})
  const categories = (categoriesData?.data ?? []) as unknown as Array<{
    id: string
    name: string
    color: string
  }>

  const hasActiveFilters =
    filters.status || filters.priority || filters.categoryId || filters.search

  const clearFilters = () => {
    onFiltersChange({})
  }

  // Memoized lookups for display values
  const selectedStatusLabel = useMemo(
    () => statusOptions.find((opt) => opt.value === filters.status)?.label,
    [filters.status],
  )

  const selectedPriority = useMemo(
    () => priorityOptions.find((opt) => opt.value === filters.priority),
    [filters.priority],
  )

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === filters.categoryId),
    [categories, filters.categoryId],
  )

  return (
    <div className="flex flex-col flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 w-full">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={filters.search ?? ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
          className="w-full pl-9"
        />
      </div>

      <div className="grid grid-cols-4 gap-3 w-full">
        {/* Status Filter */}
        <Select
          value={filters.status ?? ''}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              status: v || undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status">
              {filters.status ? (
                <span className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CircleIcon}
                    size={12}
                    className="fill-current"
                  />
                  {selectedStatusLabel}
                </span>
              ) : (
                'All Statuses'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CircleIcon}
                    size={12}
                    className="fill-current"
                  />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority ?? ''}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              priority: v || undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Priority">
              {selectedPriority ? (
                <span className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Flag01Icon}
                    size={12}
                    className={selectedPriority.color}
                  />
                  {selectedPriority.label}
                </span>
              ) : (
                'All Priorities'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            {priorityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Flag01Icon}
                    size={12}
                    className={opt.color}
                  />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.categoryId ?? ''}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              categoryId: v || undefined,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category">
              {selectedCategory ? (
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: selectedCategory.color }}
                  />
                  {selectedCategory.name}
                </span>
              ) : (
                'All Categories'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={14} />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}

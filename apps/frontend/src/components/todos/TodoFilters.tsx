import { Select } from '#/components/ui'
import { useGetAllCategories } from '#/api/hooks/category'
import { Search, X } from 'lucide-react'

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
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export default function TodoFilters({
  filters,
  onFiltersChange,
}: TodoFiltersProps) {
  const { data: categoriesData } = useGetAllCategories({})
  const categories = (categoriesData?.data ?? []) as unknown as Array<{
    id: string
    name: string
  }>

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  const hasActiveFilters =
    filters.status || filters.priority || filters.categoryId || filters.search

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)"
        />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search ?? ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value || undefined })
          }
          className="w-full rounded-lg border border-(--border-color) bg-(--bg-primary) pl-9 pr-3 py-2 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) transition-colors focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
        />
      </div>

      {/* Status Filter */}
      <div className="w-36">
        <Select
          options={statusOptions}
          value={filters.status ?? ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value || undefined })
          }
        />
      </div>

      {/* Priority Filter */}
      <div className="w-36">
        <Select
          options={priorityOptions}
          value={filters.priority ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              priority: e.target.value || undefined,
            })
          }
        />
      </div>

      {/* Category Filter */}
      <div className="w-40">
        <Select
          options={categoryOptions}
          value={filters.categoryId ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              categoryId: e.target.value || undefined,
            })
          }
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-(--text-muted) transition-colors hover:bg-(--bg-hover) hover:text-(--text-primary)"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  )
}

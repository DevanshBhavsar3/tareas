import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { useGetAllCategories } from '#/api/hooks/category'
import type {
  PopulatedTodo,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '@tareas/zod'
import { useState, useEffect, useMemo } from 'react'
import type z from 'zod'
import { CalendarIcon, Flag, Circle } from 'lucide-react'
import { cn } from '#/lib/utils'
import { formatPPP } from '#/lib/dayjs'

type Todo = z.infer<typeof PopulatedTodo>
type CreatePayload = z.infer<typeof CreateTodoPayload>
type UpdatePayload = z.infer<typeof UpdateTodoPayload>

type TodoFormBaseProps = {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

type CreateTodoFormProps = TodoFormBaseProps & {
  todo?: null
  onSubmit: (data: CreatePayload) => void
}

type EditTodoFormProps = TodoFormBaseProps & {
  todo: Todo
  onSubmit: (data: UpdatePayload) => void
}

type TodoFormProps = CreateTodoFormProps | EditTodoFormProps

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
] as const

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
] as const

export default function TodoForm({
  isOpen,
  onClose,
  onSubmit,
  todo,
  isLoading,
}: TodoFormProps) {
  const { data: categoriesData } = useGetAllCategories({})
  const categories = (categoriesData?.data ?? []) as unknown as Array<{
    id: string
    name: string
    color: string
  }>

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [status, setStatus] = useState<
    'draft' | 'active' | 'completed' | 'archived'
  >('active')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [categoryId, setCategoryId] = useState('')

  const isEditing = !!todo

  // Memoized lookups for display values
  const selectedPriorityLabel = useMemo(
    () =>
      priorityOptions.find((opt) => opt.value === priority)?.label ??
      'Select priority',
    [priority],
  )

  const selectedStatusLabel = useMemo(
    () =>
      statusOptions.find((opt) => opt.value === status)?.label ??
      'Select status',
    [status],
  )

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === categoryId),
    [categories, categoryId],
  )

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setDescription(todo.description ?? '')
      setPriority(todo.priority)
      setStatus(todo.status)
      setDueDate(todo.dueDate ? new Date(todo.dueDate) : undefined)
      setCategoryId(todo.categoryId ?? '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStatus('active')
      setDueDate(undefined)
      setCategoryId('')
    }
  }, [todo, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    if (isEditing) {
      const data: UpdatePayload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        status,
        dueDate: dueDate ? dueDate.toISOString() : null,
        categoryId: categoryId || null,
      }
      onSubmit(data)
    } else {
      const data: CreatePayload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
        categoryId: categoryId || null,
      }
      onSubmit(data)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => v && setPriority(v as typeof priority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority">
                    <span className="flex items-center gap-2">
                      <Flag
                        size={14}
                        className={
                          priorityOptions.find((p) => p.value === priority)
                            ?.color
                        }
                      />
                      {selectedPriorityLabel}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <Flag size={14} className={opt.color} />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => v && setStatus(v as typeof status)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status">
                      <span className="flex items-center gap-2">
                        <Circle size={14} className="fill-current" />
                        {selectedStatusLabel}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <Circle size={14} className="fill-current" />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isEditing && (
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dueDate && 'text-muted-foreground',
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? formatPPP(dueDate) : 'Pick a date'}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground',
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? formatPPP(dueDate) : 'Pick a date'}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No category">
                  {selectedCategory ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: selectedCategory.color }}
                      />
                      {selectedCategory.name}
                    </span>
                  ) : (
                    'No category'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
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
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

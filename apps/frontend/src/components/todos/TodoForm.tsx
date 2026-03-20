import { Input, Modal, Select, Textarea } from '#/components/ui'
import Button from '#/components/Button'
import { useGetAllCategories } from '#/api/hooks/category'
import type {
  PopulatedTodo,
  CreateTodoPayload,
  UpdateTodoPayload,
} from '@tareas/zod'
import { useState, useEffect } from 'react'
import type z from 'zod'

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
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

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
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const isEditing = !!todo

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setDescription(todo.description ?? '')
      setPriority(todo.priority)
      setStatus(todo.status)
      setDueDate(todo.dueDate ? todo.dueDate.split('T')[0] : '')
      setCategoryId(todo.categoryId ?? '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setStatus('active')
      setDueDate('')
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
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        categoryId: categoryId || null,
      }
      onSubmit(data)
    } else {
      const data: CreatePayload = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        categoryId: categoryId || null,
      }
      onSubmit(data)
    }
  }

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'Create Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />

        <Textarea
          label="Description"
          placeholder="Add more details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
          />

          {isEditing && (
            <Select
              label="Status"
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            />
          )}

          {!isEditing && (
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          )}
        </div>

        {isEditing && (
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        )}

        <Select
          label="Category"
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !title.trim()}>
            {isLoading
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

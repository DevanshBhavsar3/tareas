import { Input, Modal, Textarea } from '#/components/ui'
import Button from '#/components/Button'
import { useState, useEffect } from 'react'
import type {
  TodoCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@tareas/zod'
import type z from 'zod'

type Category = z.infer<typeof TodoCategory>
type CreatePayload = z.infer<typeof CreateCategoryPayload>
type UpdatePayload = z.infer<typeof UpdateCategoryPayload>

type CategoryFormProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePayload | UpdatePayload) => void
  category?: Category | null
  isLoading?: boolean
}

const colorOptions = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
]

export default function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading,
}: CategoryFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(colorOptions[5])

  const isEditing = !!category

  useEffect(() => {
    if (category) {
      setName(category.name)
      setDescription(category.description ?? '')
      setColor(category.color)
    } else {
      setName('')
      setDescription('')
      setColor(colorOptions[5])
    }
  }, [category, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    const data = {
      name: name.trim(),
      color,
      description: description.trim() || null,
    }

    onSubmit(data)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create Category'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <Textarea
          label="Description"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-(--text-primary)">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`size-7 rounded-full transition-all ${
                  color === c
                    ? 'ring-2 ring-offset-2 ring-offset-(--bg-primary)'
                    : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: c,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading
              ? 'Saving...'
              : isEditing
                ? 'Save Changes'
                : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

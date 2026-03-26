import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '#/components/ui/dialog'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'
import { Button } from '#/components/ui/button'
import { useState, useEffect } from 'react'
import { cn } from '#/lib/utils'
import type {
  TodoCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '@tareas/zod'
import type z from 'zod'

type Category = z.infer<typeof TodoCategory>
type CreatePayload = z.infer<typeof CreateCategoryPayload>
type UpdatePayload = z.infer<typeof UpdateCategoryPayload>

type CategoryFormBaseProps = {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
}

type CreateCategoryFormProps = CategoryFormBaseProps & {
  category?: null
  onSubmit: (data: CreatePayload) => void
}

type EditCategoryFormProps = CategoryFormBaseProps & {
  category: Category
  onSubmit: (data: UpdatePayload) => void
}

type CategoryFormProps = CreateCategoryFormProps | EditCategoryFormProps

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

    // Type narrowing based on whether we're editing
    if (isEditing) {
      onSubmit(data as UpdatePayload)
    } else {
      onSubmit(data as CreatePayload)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-7 rounded-full transition-all',
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-background'
                      : 'hover:scale-110',
                  )}
                  style={{
                    backgroundColor: c,
                    ...(color === c && { ringColor: c }),
                  }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

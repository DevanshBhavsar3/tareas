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
  DialogDescription,
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
import { Progress } from '#/components/ui/progress'
import { useGetAllCategories } from '#/api/hooks/category'
import { useCreateTodo, type TCreateTodoPayload } from '#/api/hooks/todo'
import { AttachmentSection } from '#/components/todos'
import type { PopulatedTodo } from '@tareas/zod'
import { useState, useMemo, useCallback } from 'react'
import type z from 'zod'
import {
  CalendarIcon,
  Flag,
  ArrowRight,
  Check,
  Paperclip,
  Loader2,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { formatPPP } from '#/lib/dayjs'
import { toast } from 'sonner'

type Todo = z.infer<typeof PopulatedTodo>

type CreateTaskWizardProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (todo: Todo) => void
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
] as const

const steps = [
  {
    id: 1,
    title: 'Task Details',
    description: 'Basic information about your task',
  },
  {
    id: 2,
    title: 'Attachments',
    description: 'Add files to your task (optional)',
  },
] as const

export default function CreateTaskWizard({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskWizardProps) {
  const { data: categoriesData } = useGetAllCategories({})
  const categories = (categoriesData?.data ?? []) as unknown as Array<{
    id: string
    name: string
    color: string
  }>

  const createTodo = useCreateTodo()

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [categoryId, setCategoryId] = useState('')

  // Created task (after step 1 completion)
  const [createdTodo, setCreatedTodo] = useState<Todo | null>(null)

  // Memoized lookups for display values
  const selectedPriorityLabel = useMemo(
    () =>
      priorityOptions.find((opt) => opt.value === priority)?.label ??
      'Select priority',
    [priority],
  )

  const selectedCategory = useMemo(
    () => categories.find((cat) => cat.id === categoryId),
    [categories, categoryId],
  )

  const resetForm = useCallback(() => {
    setCurrentStep(1)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate(undefined)
    setCategoryId('')
    setCreatedTodo(null)
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const handleCreateTask = useCallback(() => {
    if (!title.trim()) return

    const data: TCreateTodoPayload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      categoryId: categoryId || null,
    }

    createTodo.mutate(
      { body: data },
      {
        onSuccess: (todo) => {
          setCreatedTodo(todo as unknown as Todo)
          setCurrentStep(2)
          toast.success('Task created! Now you can add attachments.')
        },
      },
    )
  }, [title, description, priority, dueDate, categoryId, createTodo])

  const handleFinish = useCallback(() => {
    if (createdTodo) {
      onSuccess?.(createdTodo)
    }
    handleClose()
    toast.success('Task created successfully!')
  }, [createdTodo, onSuccess, handleClose])

  const handleSkipAttachments = useCallback(() => {
    handleFinish()
  }, [handleFinish])

  const progressPercentage = (currentStep / steps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            {steps[currentStep - 1].description}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStep} of {steps.length}
            </span>
            <span>{steps[currentStep - 1].title}</span>
          </div>
          <Progress value={progressPercentage} className="h-1" />
        </div>

        {/* Step 1: Task Details */}
        {currentStep === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleCreateTask()
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
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
            </div>

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
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTodo.isPending || !title.trim()}
              >
                {createTodo.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* Step 2: Attachments */}
        {currentStep === 2 && createdTodo && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{createdTodo.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Task created successfully
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Paperclip size={16} className="text-muted-foreground" />
                <Label>Add Attachments</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload files related to this task. You can also add attachments
                later.
              </p>
            </div>

            <AttachmentSection todoId={createdTodo.id} />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipAttachments}
              >
                Skip
              </Button>
              <Button onClick={handleFinish}>
                <Check size={16} />
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

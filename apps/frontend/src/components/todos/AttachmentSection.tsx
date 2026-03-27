import {
  useUploadTodoAttachment,
  useDeleteTodoAttachment,
  useGetTodoAttachmentURL,
} from '#/api/hooks/attachment'
import { useApiClient } from '#/api/index'
import { QUERY_KEYS } from '#/api/query-keys'
import { Button } from '#/components/ui/button'
import { Progress } from '#/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
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
import { Skeleton } from '#/components/ui/skeleton'
import { cn } from '#/lib/utils'
import type { TodoAttachment, PopulatedTodo } from '@tareas/zod'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Upload01Icon,
  Delete01Icon,
  Download01Icon,
  FileTypeIcon,
  Image01Icon,
  FileArchiveIcon,
  File01Icon,
  Loading01Icon,
  AttachmentIcon,
} from '@hugeicons/core-free-icons'
import type z from 'zod'
import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

type Attachment = z.infer<typeof TodoAttachment>
type Todo = z.infer<typeof PopulatedTodo>

type AttachmentSectionProps = {
  todoId: string
  // Initial attachments are optional - component will fetch its own data
  initialAttachments?: Attachment[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const getFileIcon = (mimeType: string | null): IconSvgElement => {
  if (!mimeType) return File01Icon
  if (mimeType.startsWith('image/')) return Image01Icon
  if (mimeType.includes('pdf') || mimeType.includes('document'))
    return FileTypeIcon
  if (mimeType.includes('zip') || mimeType.includes('archive'))
    return FileArchiveIcon
  return File01Icon
}

const formatFileSize = (bytes: bigint | null): string => {
  if (bytes === null) return 'Unknown size'
  const num = Number(bytes)
  if (num === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(num) / Math.log(k))
  return `${parseFloat((num / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function AttachmentSection({
  todoId,
  initialAttachments,
}: AttachmentSectionProps) {
  const api = useApiClient()

  // Fetch todo data to get latest attachments - this ensures we always have fresh data
  const { data: todoData, isLoading: todoLoading } = useQuery({
    queryKey: [QUERY_KEYS.TODOS.GET_TODO_BY_ID, todoId],
    queryFn: async () => {
      const res = await api.get(`/todos/${todoId}`)
      return res.data as Todo
    },
    enabled: !!todoId,
    // Use initial attachments as placeholder while fetching
    placeholderData: initialAttachments
      ? ({ attachments: initialAttachments } as Todo)
      : undefined,
  })

  const attachments = todoData?.attachments ?? initialAttachments ?? []

  const uploadAttachment = useUploadTodoAttachment()
  const deleteAttachment = useDeleteTodoAttachment()
  const getAttachmentURL = useGetTodoAttachmentURL()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [attachmentToDelete, setAttachmentToDelete] =
    useState<Attachment | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  // Guard against double submission
  const isUploadingRef = useRef(false)

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      if (uploadAttachment.isPending || isUploadingRef.current) return

      const file = files[0]

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File too large', {
          description: 'Maximum file size is 10MB',
        })
        return
      }

      // Set guard immediately
      isUploadingRef.current = true
      setUploadProgress(0)

      // Clear file input immediately
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null || prev >= 90) return prev
          return prev + 10
        })
      }, 200)

      uploadAttachment.mutate(
        { todoId, file },
        {
          onSuccess: () => {
            setUploadProgress(100)
            setTimeout(() => setUploadProgress(null), 500)
            toast.success('File uploaded successfully')
          },
          onError: () => {
            setUploadProgress(null)
          },
          onSettled: () => {
            clearInterval(progressInterval)
            isUploadingRef.current = false
          },
        },
      )
    },
    [todoId, uploadAttachment],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDownload = useCallback(
    (attachment: Attachment) => {
      if (getAttachmentURL.isPending) return

      getAttachmentURL.mutate(
        { todoId, attachmentId: attachment.id },
        {
          onSuccess: (data) => {
            window.open(data.url, '_blank')
          },
        },
      )
    },
    [todoId, getAttachmentURL],
  )

  const handleDelete = useCallback(() => {
    if (!attachmentToDelete || deleteAttachment.isPending) return

    deleteAttachment.mutate(
      { todoId, attachmentId: attachmentToDelete.id },
      {
        onSuccess: () => {
          setAttachmentToDelete(null)
          toast.success('Attachment deleted')
        },
      },
    )
  }, [todoId, attachmentToDelete, deleteAttachment])

  if (todoLoading && !initialAttachments) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          uploadAttachment.isPending && 'pointer-events-none opacity-50',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploadAttachment.isPending}
        />
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          {uploadProgress !== null ? (
            <div className="w-full space-y-2">
              <HugeiconsIcon
                icon={Loading01Icon}
                className="h-8 w-8 animate-spin text-primary mx-auto"
              />
              <Progress
                value={uploadProgress}
                className="w-full max-w-xs mx-auto"
              />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <HugeiconsIcon
                icon={Upload01Icon}
                className="h-8 w-8 text-muted-foreground/50 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Max file size: 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const fileIcon = getFileIcon(attachment.mimeType)
            return (
              <div
                key={attachment.id}
                className="group flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <HugeiconsIcon
                    icon={fileIcon}
                    className="h-5 w-5 text-primary"
                  />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium truncate break-all max-w-xs">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDownload(attachment)}
                        disabled={getAttachmentURL.isPending}
                      >
                        {getAttachmentURL.isPending ? (
                          <HugeiconsIcon
                            icon={Loading01Icon}
                            className="h-4 w-4 animate-spin"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={Download01Icon}
                            className="h-4 w-4"
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setAttachmentToDelete(attachment)}
                      >
                        <HugeiconsIcon
                          icon={Delete01Icon}
                          className="h-4 w-4"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {attachments.length === 0 && uploadProgress === null && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <HugeiconsIcon
            icon={AttachmentIcon}
            className="h-8 w-8 text-muted-foreground/30 mb-2"
          />
          <p className="text-sm text-muted-foreground">No attachments yet</p>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!attachmentToDelete}
        onOpenChange={(open) => !open && setAttachmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attachment</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              Are you sure you want to delete "
              <span className="break-all">{attachmentToDelete?.name}</span>"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

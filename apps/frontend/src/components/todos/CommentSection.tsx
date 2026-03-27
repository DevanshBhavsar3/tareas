import {
  useGetCommentsByTodoId,
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from '#/api/hooks/comment'
import { Textarea } from '#/components/ui/textarea'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SentIcon,
  Delete01Icon,
  Edit01Icon,
  Cancel01Icon,
  Loading01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { useState, useRef, useCallback } from 'react'
import { formatRelativeTime } from '#/lib/dayjs'

type CommentSectionProps = {
  todoId: string
}

export default function CommentSection({ todoId }: CommentSectionProps) {
  const { data: comments, isLoading } = useGetCommentsByTodoId({ todoId })
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()
  const updateComment = useUpdateComment()

  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  // Guard against double submission
  const isSubmittingRef = useRef(false)

  const handleAddComment = useCallback(() => {
    const trimmedComment = newComment.trim()
    if (!trimmedComment || addComment.isPending || isSubmittingRef.current)
      return

    // Set guard immediately
    isSubmittingRef.current = true
    // Clear input immediately to prevent re-submission
    setNewComment('')

    addComment.mutate(
      {
        todoId,
        body: { content: trimmedComment },
      },
      {
        onSettled: () => {
          isSubmittingRef.current = false
        },
        onError: () => {
          // Restore comment on error
          setNewComment(trimmedComment)
        },
      },
    )
  }, [newComment, todoId, addComment])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  const handleStartEdit = (commentId: string, content: string) => {
    setEditingId(commentId)
    setEditContent(content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editContent.trim() || updateComment.isPending) return

    const trimmedContent = editContent.trim()

    updateComment.mutate(
      {
        commentId: editingId,
        body: { content: trimmedContent },
      },
      {
        onSuccess: () => {
          setEditingId(null)
          setEditContent('')
        },
      },
    )
  }, [editingId, editContent, updateComment])

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleDelete = useCallback(
    (commentId: string) => {
      if (deleteComment.isPending) return
      deleteComment.mutate({ commentId })
    },
    [deleteComment],
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={addComment.isPending}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || addComment.isPending}
          >
            {addComment.isPending ? (
              <HugeiconsIcon
                icon={Loading01Icon}
                size={14}
                className="animate-spin"
              />
            ) : (
              <HugeiconsIcon icon={SentIcon} size={14} />
            )}
            Add
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group rounded-lg border bg-muted/30 p-3"
            >
              {editingId === comment.id ? (
                /* Edit mode */
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    rows={2}
                    autoFocus
                    disabled={updateComment.isPending}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={updateComment.isPending}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={14} />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim() || updateComment.isPending}
                    >
                      {updateComment.isPending ? (
                        <HugeiconsIcon
                          icon={Loading01Icon}
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <HugeiconsIcon icon={Tick02Icon} size={14} />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap wrap-break-words min-w-0 flex-1">
                      {comment.content}
                    </p>
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          handleStartEdit(comment.id, comment.content)
                        }
                      >
                        <HugeiconsIcon icon={Edit01Icon} size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deleteComment.isPending}
                      >
                        <HugeiconsIcon icon={Delete01Icon} size={14} />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatRelativeTime(comment.createdAt)}
                    {comment.updatedAt !== comment.createdAt && ' (edited)'}
                  </p>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}

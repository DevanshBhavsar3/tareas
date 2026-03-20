import {
  useGetCommentsByTodoId,
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from '#/api/hooks/comment'
import { Textarea } from '#/components/ui'
import Button from '#/components/Button'
import { Spinner } from '#/components/ui'
import { Send, Trash2, Pencil, X, Check } from 'lucide-react'
import { useState } from 'react'

type CommentSectionProps = {
  todoId: string
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function CommentSection({ todoId }: CommentSectionProps) {
  const { data: comments, isLoading } = useGetCommentsByTodoId({ todoId })
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()
  const updateComment = useUpdateComment()

  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleAddComment = () => {
    if (!newComment.trim()) return

    addComment.mutate(
      {
        todoId,
        body: { content: newComment.trim() },
      },
      {
        onSuccess: () => setNewComment(''),
      },
    )
  }

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

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return

    updateComment.mutate(
      {
        commentId: editingId,
        body: { content: editContent.trim() },
      },
      {
        onSuccess: () => {
          setEditingId(null)
          setEditContent('')
        },
      },
    )
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size={20} />
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
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || addComment.isPending}
          >
            {addComment.isPending ? <Spinner size={14} /> : <Send size={14} />}
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
              className="group rounded-lg border border-(--border-color) bg-(--bg-muted) p-3"
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
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCancelEdit}
                    >
                      <X size={14} />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim() || updateComment.isPending}
                    >
                      {updateComment.isPending ? (
                        <Spinner size={14} />
                      ) : (
                        <Check size={14} />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-(--text-primary) whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() =>
                          handleStartEdit(comment.id, comment.content)
                        }
                        className="rounded p-1 text-(--text-muted) transition-all hover:bg-(--bg-hover) hover:text-(--text-primary)"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() =>
                          deleteComment.mutate({ commentId: comment.id })
                        }
                        className="rounded p-1 text-(--text-muted) transition-all hover:bg-(--bg-hover) hover:text-(--danger)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-(--text-muted)">
                    {formatDate(comment.createdAt)}
                    {comment.updatedAt !== comment.createdAt && ' (edited)'}
                  </p>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-(--text-muted) py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}

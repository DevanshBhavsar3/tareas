import {
  useGetCommentsByTodoId,
  useAddComment,
  useDeleteComment,
} from '#/api/hooks/comment'
import { Textarea } from '#/components/ui'
import Button from '#/components/Button'
import { Spinner } from '#/components/ui'
import { Send, Trash2 } from 'lucide-react'
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

  const [newComment, setNewComment] = useState('')

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
            Send
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
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-(--text-primary) whitespace-pre-wrap">
                  {comment.content}
                </p>
                <button
                  onClick={() =>
                    deleteComment.mutate({ commentId: comment.id })
                  }
                  className="shrink-0 rounded p-1 text-(--text-muted) opacity-0 transition-all hover:bg-(--bg-hover) hover:text-(--danger) group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="mt-2 text-xs text-(--text-muted)">
                {formatDate(comment.createdAt)}
              </p>
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

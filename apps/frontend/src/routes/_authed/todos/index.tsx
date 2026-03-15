import { useGetAllTodos } from '#/api/hooks/todo'
import { UserButton } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authed/todos/')({
  component: Dashboard,
})

function Dashboard() {
  const { data } = useGetAllTodos({
    query: {
      sort: 'created_at',
    },
  })

  return (
    <div className="min-h-screen">
      <div>DATA: {JSON.stringify(data)}</div>
    </div>
  )
}

import { useAuth } from '@clerk/clerk-react'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-3 justify-center items-center">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-sm">Loading</span>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

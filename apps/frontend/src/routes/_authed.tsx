import { useAuth } from '@clerk/clerk-react'
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  // Only redirect when we know for sure user is not signed in
  if (isLoaded && !isSignedIn) {
    return <Navigate to="/" replace />
  }

  // Render the page immediately - child components handle their own loading states
  // This prevents the entire page from being blocked by auth loading
  return <Outlet />
}

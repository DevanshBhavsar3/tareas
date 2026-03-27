import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { Button } from '#/components/ui/button'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from '@clerk/clerk-react'
import { CheckSquare } from 'lucide-react'

export default function Header() {
  const { isLoaded } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">Tareas</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!isLoaded ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          ) : (
            <>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8',
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton forceRedirectUrl="/todos">
                  <Button size="sm">Sign In</Button>
                </SignInButton>
              </SignedOut>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

import { Link, useMatchRoute } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import { Button } from '#/components/ui/button'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from '@clerk/clerk-react'
import { CheckSquare, LayoutDashboard, FolderOpen } from 'lucide-react'
import { cn } from '#/lib/utils'

const navItems = [
  { to: '/todos', label: 'Tasks', icon: LayoutDashboard },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
]

export default function Header() {
  const { isLoaded, isSignedIn } = useAuth()
  const matchRoute = useMatchRoute()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Tareas</span>
          </Link>

          {/* Navigation - only show when signed in */}
          {isLoaded && isSignedIn && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = matchRoute({ to: item.to, fuzzy: true })
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

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

      {/* Mobile Navigation - only show when signed in */}
      {isLoaded && isSignedIn && (
        <div className="md:hidden border-t border-border/40 px-6 py-2">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = matchRoute({ to: item.to, fuzzy: true })
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

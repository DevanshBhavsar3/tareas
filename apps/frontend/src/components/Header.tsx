import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useAuth,
  UserButton,
} from '@clerk/clerk-react'

export default function Header() {
  const { isLoaded } = useAuth()

  return (
    <header className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <span className="text-lg font-medium tracking-tight text-(--text-primary)">
          Tareas
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {!isLoaded ? (
          <SignInButton forceRedirectUrl={'/todos'}>
            <Button size="sm">Sign Up</Button>
          </SignInButton>
        ) : (
          <>
            <SignedIn>
              <UserButton />
              <a href="/todos">
                <Button size="sm">Dashboard</Button>
              </a>
            </SignedIn>
            <SignedOut>
              <SignInButton forceRedirectUrl={'/todos'}>
                <Button size="sm">Sign Up</Button>
              </SignInButton>
            </SignedOut>
          </>
        )}
      </div>
    </header>
  )
}

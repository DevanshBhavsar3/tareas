import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'
import Button from './Button'

export default function Header() {
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
        <Button size="sm">Sign Up</Button>
      </div>
    </header>
  )
}

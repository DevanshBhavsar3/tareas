import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { GithubIcon, NewTwitterIcon } from '@hugeicons/core-free-icons'
import { Button } from './ui/button'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col items-start justify-center gap-6">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight">
                Tareas
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The minimal todo app for focused work. Stay organized, stay
              productive.
            </p>
          </div>

          {/* Social */}
          <div className="flex gap-3">
            <a
              href="https://github.com/DevanshBhavsar3/tareas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Button variant={'ghost'} size="icon">
                <HugeiconsIcon icon={GithubIcon} size={16} />
              </Button>
            </a>
            <a
              href="https://x.com/CluxOP"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Button variant={'ghost'} size="icon">
                <HugeiconsIcon icon={NewTwitterIcon} size={16} />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

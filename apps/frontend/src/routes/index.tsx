import Button from '#/components/Button'
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Smartphone,
  Clock,
  Users,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: LandingPage })

type Feature = {
  icon: any
  title: string
  description: string
}
const features: Feature[] = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Built for speed. Add tasks instantly and never wait for the app to catch up with your thoughts.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your data stays yours. End-to-end encryption ensures your tasks remain private.',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description:
      'Access your tasks from any device. Native apps for iOS, Android, and web.',
  },
  {
    icon: Clock,
    title: 'Smart Reminders',
    description:
      'Never miss a deadline with intelligent reminders that adapt to your schedule.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Share lists and collaborate with your team. Perfect for projects big and small.',
  },
  {
    icon: CheckCircle2,
    title: 'Focus Mode',
    description:
      'Hide completed tasks and focus only on what needs to be done right now.',
  },
]

function LandingPage() {
  const { isLoaded } = useAuth()

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-lg px-6 pb-24 pt-20 text-center md:pb-32 md:pt-28">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--border-color) px-2.5 py-1">
            <span className="size-2 animate-pulse rounded-full bg-accent-500" />
            <span className="text-xs font-medium text-(--text-primary)/70">
              Tareas just launched!
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-(--text-primary) md:text-5xl">
            The minimal todo app for{' '}
            <span className="bg-linear-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              focused work
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-sm text-balance mt-6 text-sm leading-relaxed text-(--text-primary)/70 md:text-md md:max-w-full">
            Tareas helps you organize your tasks with simplicity. No clutter, no
            distractions. Just you and your todos.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {!isLoaded ? (
              <SignInButton forceRedirectUrl={'/todos'}>
                <Button size="md">
                  Start for free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </SignInButton>
            ) : (
              <>
                <SignedIn>
                  <a href="/todos">
                    <Button size="md">
                      Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </a>
                </SignedIn>
                <SignedOut>
                  <SignInButton forceRedirectUrl={'/todos'}>
                    <Button size="md">
                      Start for free
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="px-6 overflow-hidden flex justify-center">
        <img
          src="/demo.png"
          alt="Website Demo"
          loading="lazy"
          className="w-[85%] h-auto object-contain"
        />
      </section>

      {/* Features Section */}
      <section id="features" className="bg-(--bg-secondary) py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-medium tracking-tight text-(--text-secondary) md:text-4xl text-balance">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-md text-(--text-secondary)/70 text-balance">
              Tareas is designed to be simple yet powerful. Focus on your tasks,
              not on learning a complex tool.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group rounded-md border border-(--border-secondary) p-5 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex size-8 items-center justify-center rounded-sm bg-accent-500/10 text-accent-500 transition-colors group-hover:bg-accent-500 group-hover:text-white">
                  <feature.icon size={18} />
                </div>
                <h3 className="mb-2 text-lg font-medium text-(--text-secondary)">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-(--text-secondary)/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-medium tracking-tight text-(--text-primary) md:text-4xl">
            Ready to get organized?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-(--text-primary)/70 text-balance">
            Join thousands of people who use Tareas to stay on top of their
            tasks. Start your free account today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {!isLoaded ? (
              <SignInButton forceRedirectUrl={'/todos'}>
                <Button size="md">
                  Start for free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </SignInButton>
            ) : (
              <>
                <SignedIn>
                  <a href="/todos">
                    <Button size="md">
                      Dashboard
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </a>
                </SignedIn>
                <SignedOut>
                  <SignInButton forceRedirectUrl={'/todos'}>
                    <Button size="md">
                      Get started
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-(--text-primary)/50">
            No credit card required
          </p>
        </div>
      </section>
    </main>
  )
}

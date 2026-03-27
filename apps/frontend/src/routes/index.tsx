import { Button } from '#/components/ui/button'
import { SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  FlashIcon,
  ShieldKeyIcon,
  SmartPhone01Icon,
  Clock01Icon,
  UserGroup02Icon,
} from '@hugeicons/core-free-icons'

export const Route = createFileRoute('/')({ component: LandingPage })

type Feature = {
  icon: typeof FlashIcon
  title: string
  description: string
}
const features: Feature[] = [
  {
    icon: FlashIcon,
    title: 'Lightning Fast',
    description:
      'Built for speed. Add tasks instantly and never wait for the app to catch up with your thoughts.',
  },
  {
    icon: ShieldKeyIcon,
    title: 'Privacy First',
    description:
      'Your data stays yours. End-to-end encryption ensures your tasks remain private.',
  },
  {
    icon: SmartPhone01Icon,
    title: 'Works Everywhere',
    description:
      'Access your tasks from any device. Native apps for iOS, Android, and web.',
  },
  {
    icon: Clock01Icon,
    title: 'Smart Reminders',
    description:
      'Never miss a deadline with intelligent reminders that adapt to your schedule.',
  },
  {
    icon: UserGroup02Icon,
    title: 'Team Collaboration',
    description:
      'Share lists and collaborate with your team. Perfect for projects big and small.',
  },
  {
    icon: CheckmarkCircle02Icon,
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
        <div className="mx-auto max-w-xl px-6 pb-24 pt-20 text-center md:pb-32 md:pt-28">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1">
            <span className="size-2 animate-pulse rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-foreground/70">
              Tareas just launched!
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            The minimal todo app for{' '}
            <span className="bg-linear-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              focused work
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-sm text-balance mt-6 text-sm leading-relaxed text-foreground/70 md:text-md md:max-w-full">
            Tareas helps you organize your tasks with simplicity. No clutter, no
            distractions. Just you and your todos.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {!isLoaded ? (
              <SignInButton forceRedirectUrl={'/todos'}>
                <Button size="lg">
                  Start for free
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Button>
              </SignInButton>
            ) : (
              <>
                <SignedIn>
                  <a href="/todos">
                    <Button size="lg">
                      Dashboard
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </Button>
                  </a>
                </SignedIn>
                <SignedOut>
                  <SignInButton forceRedirectUrl={'/todos'}>
                    <Button size="lg">
                      Start for free
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      />
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
      <section id="features" className="bg-foreground py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-medium tracking-tight text-background md:text-4xl text-balance">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-md text-background/70 text-balance">
              Tareas is designed to be simple yet powerful. Focus on your tasks,
              not on learning a complex tool.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group rounded-md border border-background/20 p-5 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex size-8 items-center justify-center rounded-sm bg-background/10 text-background/80 transition-colors group-hover:bg-background group-hover:text-foreground">
                  <HugeiconsIcon icon={feature.icon} size={18} />
                </div>
                <h3 className="mb-2 text-lg font-medium text-background">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-background/60">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-2xl font-medium tracking-tight text-foreground md:text-4xl">
            Ready to get organized?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-foreground/70 text-balance">
            Join thousands of people who use Tareas to stay on top of their
            tasks. Start your free account today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {!isLoaded ? (
              <SignInButton forceRedirectUrl={'/todos'}>
                <Button size="lg">
                  Start for free
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  />
                </Button>
              </SignInButton>
            ) : (
              <>
                <SignedIn>
                  <a href="/todos">
                    <Button size="lg">
                      Dashboard
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </Button>
                  </a>
                </SignedIn>
                <SignedOut>
                  <SignInButton forceRedirectUrl={'/todos'}>
                    <Button size="lg">
                      Get started
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </Button>
                  </SignInButton>
                </SignedOut>
              </>
            )}
          </div>
          <p className="mt-4 text-xs text-foreground/50">
            No credit card required
          </p>
        </div>
      </section>
    </main>
  )
}

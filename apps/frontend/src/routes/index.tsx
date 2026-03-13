import Button from '#/components/Button'
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

function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-lg px-6 pb-24 pt-20 text-center md:pb-32 md:pt-28">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--border-color) px-2.5 py-1">
            <span className="size-2 animate-pulse rounded-full bg-accent-500" />
            <span className="text-xs font-medium text-(--text-muted)">
              Tareas just launched!
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-xl text-balance text-4xl font-semibold leading-tight tracking-tight text-(--text-primary) md:text-5xl">
            The minimal todo apps for{' '}
            <span className="bg-linear-to-r from-accent-500 to-accent-600 bg-clip-text text-transparent">
              focused work
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-sm text-balance mt-6 text-sm leading-relaxed text-(--text-muted) md:text-md md:max-w-full">
            Tareas helps you organize your tasks with simplicity. No clutter, no
            distractions. Just you and your todos.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="md">
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full border-2 border-[var(--bg-primary)] bg-gradient-to-br from-accent-400 to-accent-600"
                />
              ))}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                2,000+
              </span>{' '}
              people already using Tareas
            </p>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl shadow-black/5">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            {/* Mock app content */}
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Today
                </h3>
                <span className="text-sm text-[var(--text-tertiary)]">
                  3 tasks
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { text: 'Review project proposal', done: true },
                  { text: 'Send weekly report', done: false },
                  { text: 'Schedule team meeting', done: false },
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 transition-all hover:border-[var(--border-color-hover)]"
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        task.done
                          ? 'border-accent-500 bg-accent-500'
                          : 'border-[var(--border-color)]'
                      }`}
                    >
                      {task.done && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span
                      className={`text-[var(--text-primary)] ${task.done ? 'text-[var(--text-tertiary)] line-through' : ''}`}
                    >
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[var(--bg-secondary)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
              Tareas is designed to be simple yet powerful. Focus on your tasks,
              not on learning a complex tool.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
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
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 transition-all hover:border-[var(--border-color-hover)] hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500 transition-colors group-hover:bg-accent-500 group-hover:text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
              Start for free, upgrade when you need more.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Free Plan */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Free
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Perfect for getting started
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  $0
                </span>
                <span className="text-[var(--text-secondary)]">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  'Up to 50 tasks',
                  '1 project',
                  'Basic reminders',
                  'Mobile app access',
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <CheckCircle2 className="h-5 w-5 text-accent-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] py-3 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)]">
                Get started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-2xl border-2 border-accent-500 bg-[var(--bg-primary)] p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white">
                Most popular
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Pro
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                For power users
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  $9
                </span>
                <span className="text-[var(--text-secondary)]">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  'Unlimited tasks',
                  'Unlimited projects',
                  'Smart reminders',
                  'Priority support',
                  'Calendar sync',
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <CheckCircle2 className="h-5 w-5 text-accent-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full rounded-xl bg-accent-500 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25">
                Start free trial
              </button>
            </div>

            {/* Team Plan */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Team
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                For teams and businesses
              </p>
              <div className="mt-6">
                <span className="text-4xl font-bold text-[var(--text-primary)]">
                  $29
                </span>
                <span className="text-[var(--text-secondary)]">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {[
                  'Everything in Pro',
                  'Team collaboration',
                  'Admin dashboard',
                  'API access',
                  'SSO integration',
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                  >
                    <CheckCircle2 className="h-5 w-5 text-accent-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] py-3 text-sm font-semibold text-[var(--text-primary)] transition-all hover:bg-[var(--bg-secondary)]">
                Contact sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--bg-secondary)] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            Ready to get organized?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Join thousands of people who use Tareas to stay on top of their
            tasks. Start your free account today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="group flex items-center gap-2 rounded-xl bg-accent-500 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/25">
              Get started for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <p className="mt-4 text-sm text-[var(--text-tertiary)]">
            No credit card required
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            Built with simplicity in mind
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            Tareas was created out of frustration with overly complex task
            management tools. We believe that the best productivity tool is the
            one that gets out of your way and lets you focus on what matters
            most.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            Our name comes from the Spanish word for &quot;tasks&quot; -
            reflecting our commitment to helping you accomplish your todos with
            clarity and simplicity.
          </p>
        </div>
      </section>
    </main>
  )
}

import Button from '#/components/Button'
import { createFileRoute } from '@tanstack/react-router'
import {
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  ListTodo,
  Clock,
  Star,
  Inbox,
} from 'lucide-react'

export const Route = createFileRoute('/_authed/todos/')({
  component: Dashboard,
})

// Mock data for UI
const mockTodos = [
  {
    id: 1,
    title: 'Review project proposal',
    completed: false,
    priority: 'high',
    dueDate: 'Today',
  },
  {
    id: 2,
    title: 'Update documentation',
    completed: false,
    priority: 'medium',
    dueDate: 'Tomorrow',
  },
  {
    id: 3,
    title: 'Send weekly report',
    completed: true,
    priority: 'low',
    dueDate: 'Yesterday',
  },
  {
    id: 4,
    title: 'Schedule team meeting',
    completed: false,
    priority: 'medium',
    dueDate: 'Mar 20',
  },
  {
    id: 5,
    title: 'Fix navigation bug',
    completed: false,
    priority: 'high',
    dueDate: 'Today',
  },
]

const stats = [
  { label: 'Tasks', value: 12, icon: ListTodo },
  { label: 'Completed', value: 8, icon: CheckCircle2 },
  { label: 'Pending', value: 4, icon: Clock },
  { label: 'Important', value: 3, icon: Star },
]

const quickActions = [
  { label: 'Inbox', icon: Inbox, count: 3 },
  { label: 'Today', icon: Calendar },
  { label: 'Important', icon: Star },
  { label: 'Completed', icon: CheckCircle2 },
]

function Dashboard() {
  return (
    <div className="min-h-screen bg-(--bg-primary)">
      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            Good morning
          </h1>
          <p className="mt-1 text-sm text-(--text-primary)/60">
            You have 4 tasks pending today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-(--border-color) bg-(--bg-primary) p-5 transition-all hover:border-accent-500/30 hover:shadow-sm"
            >
              {/* Background Icon */}
              <div className="absolute -right-4 -top-4 text-accent-500/10 transition-all group-hover:text-accent-500/15 group-hover:scale-110">
                <stat.icon size={72} strokeWidth={1} />
              </div>

              {/* Content */}
              <div className="relative">
                <p className="mb-1 text-xs font-medium text-(--text-primary)/50 uppercase tracking-tight">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-(--text-primary)">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tasks Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Task List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-(--border-color) bg-(--bg-primary)">
              {/* Task List Header */}
              <div className="flex items-center justify-between border-b border-(--border-color) px-5 py-4">
                <h2 className="font-medium text-(--text-primary)">My Tasks</h2>
                <Button size="sm">
                  <Plus size={16} />
                  Add Task
                </Button>
              </div>

              {/* Task Items */}
              <div className="divide-y divide-(--border-color)">
                {mockTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-(--bg-tertiary)/50"
                  >
                    <button className="shrink-0 text-(--text-primary)/40 transition-colors hover:text-accent-500">
                      {todo.completed ? (
                        <CheckCircle2
                          size={20}
                          className="text-green-500 fill-green-500/20"
                        />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${todo.completed ? 'text-(--text-primary)/40 line-through' : 'text-(--text-primary)'}`}
                      >
                        {todo.title}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-(--text-primary)/40">
                          <Calendar size={12} />
                          {todo.dueDate}
                        </span>
                        {todo.priority === 'high' && (
                          <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-xs text-red-500">
                            High
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="shrink-0 text-(--text-primary)/30 opacity-0 transition-opacity hover:text-(--text-primary)/60 group-hover:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="rounded-xl border border-(--border-color) bg-(--bg-primary) p-3">
              <h3 className="mb-4 text-sm font-medium text-(--text-primary) m-2">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, i) => (
                  <Button
                    variant="secondary"
                    key={i}
                    className="border-none w-full gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-(--text-primary)/70 transition-colors hover:bg-(--bg-tertiary)"
                  >
                    <action.icon
                      size={16}
                      className="text-(--text-primary)/40"
                    />
                    <span className="flex-1">{action.label}</span>
                    {action.count && (
                      <span className="ml-auto rounded bg-accent-500/10 px-1.5 py-0.5 text-xs text-accent-500">
                        {action.count}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

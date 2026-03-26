# AGENTS.md

This file provides context for AI agents working with the Tareas codebase.

## Project Overview

**Tareas** is an open-source service for managing tasks. It allows users to create task, categorize them into custom categories, assign priorities & due dates and attach files to it.

- **Live Site**: https://tareas.devansh.engineer
- **Tech Stack**: Tanstack Start, React 19, TypeScript, Tailwind CSS, Shadcn UI, Golang, PostgreSQL, Redis
- **Package Manager**: bun
- **Node Version**: 24

## Project Structure

```
Tareas
├── apps
│   ├── backend
│   │   ├── cmd
│   │   │   ├── cron
│   │   │   └── tareas
│   │   ├── internal
│   │   │   ├── config
│   │   │   ├── cron
│   │   │   ├── database
│   │   │   │   └── migrations
│   │   │   ├── errs
│   │   │   ├── handler
│   │   │   ├── lib
│   │   │   │   ├── aws
│   │   │   │   ├── email
│   │   │   │   ├── job
│   │   │   │   └── utils
│   │   │   ├── logger
│   │   │   ├── middleware
│   │   │   ├── model
│   │   │   │   ├── category
│   │   │   │   ├── comment
│   │   │   │   └── todo
│   │   │   ├── repository
│   │   │   ├── router
│   │   │   │   └── v1
│   │   │   ├── server
│   │   │   ├── service
│   │   │   ├── sqlerr
│   │   │   ├── testing
│   │   │   └── validator
│   │   ├── static
│   │   └── templates
│   │       └── emails
│   └── frontend
│       ├── public
│       └── src
│           ├── api
│           │   └── hooks
│           ├── components
│           │   ├── categories
│           │   ├── todos
│           │   └── ui
│           ├── integrations
│           │   ├── clerk
│           │   └── tanstack-query
│           ├── lib
│           └── routes
│               └── _authed
│                   ├── categories
│                   └── todos
└── packages
    └── zod
        └── src
            ├── category
            ├── comment
            └── todo
```

## Key Commands

```bash
bun install              # Install dependencies
bun dev                  # Start development server
bun build                # Production build
bun lint                 # Run linter
bun format               # Run code formatter
```

## Development Guidelines

### Code Style
- **Linter/Formatter**: Prettier
- **Import Aliases**: Use `@/` for imports (e.g., `@/components/...`)
- **Styling**: Tailwind CSS with ShandCN UI components

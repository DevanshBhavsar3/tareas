package cron

import (
	"context"
	"time"

	"github.com/DevanshBhavsar3/tareas/internal/lib/job"
	"github.com/DevanshBhavsar3/tareas/internal/model/todo"
	"github.com/google/uuid"
)

//============================================================================

type DueReminderJob struct{}

func (j *DueReminderJob) Name() string {
	return "due-reminders"
}

func (j *DueReminderJob) Description() string {
	return "Enqueue email reminders for todos due soon"
}

func (j *DueReminderJob) Run(ctx context.Context, jobCtx *JobContext) error {
	todos, err := jobCtx.Repositories.Todo.GetTodosDueInHours(
		ctx,
		jobCtx.Server.Config.Cron.ReminderHours,
		jobCtx.Server.Config.Cron.BatchSize,
	)
	if err != nil {
		return err
	}

	jobCtx.Server.Logger.Info().
		Int("todo_count", len(todos)).
		Int("hours", jobCtx.Server.Config.Cron.ReminderHours).
		Msg("Found todos due soon")

	userTodos := make(map[string][]string)
	enqueuedCount := 0

	for _, todo := range todos {
		if len(userTodos[todo.UserID]) < jobCtx.Server.Config.Cron.MaxTodosPerUserNotification {
			userTodos[todo.UserID] = append(userTodos[todo.UserID], todo.Title)
		}

		reminderTask := &job.ReminderEmailPayload{
			UserID:    todo.UserID,
			TodoID:    todo.ID,
			TodoTitle: todo.Title,
			DueDate:   *todo.DueDate,
			TaskType:  "due_reminder",
		}

		err := job.EnqueueReminderEmail(jobCtx.JobClient, reminderTask)
		if err != nil {
			jobCtx.Server.Logger.Error().
				Err(err).
				Str("todo_id", todo.ID.String()).
				Str("user_id", todo.UserID).
				Msg("Failed to enqueue reminder email")

			continue
		}

		enqueuedCount++

		jobCtx.Server.Logger.Info().
			Str("todo_id", todo.ID.String()).
			Str("todo_title", todo.Title).
			Str("user_id", todo.UserID).
			Msg("Enqueued reminder for todo")
	}

	jobCtx.Server.Logger.Info().
		Int("enqueued_count", enqueuedCount).
		Int("total_todos", len(todos)).
		Msg("Due date reminder emails enqueued")

	for userID, titles := range userTodos {
		jobCtx.Server.Logger.Info().
			Str("user_id", userID).
			Int("reminder_count", len(titles)).
			Msg("User reminders enqueued")
	}

	return nil
}

//============================================================================

type OverdueReminderJob struct{}

func (j *OverdueReminderJob) Name() string {
	return "overdue-reminders"
}

func (j *OverdueReminderJob) Description() string {
	return "Enqueue email reminders for overdue todos"
}

func (j *OverdueReminderJob) Run(ctx context.Context, jobCtx *JobContext) error {
	todos, err := jobCtx.Repositories.Todo.GetOverdueTodos(ctx, jobCtx.Server.Config.Cron.BatchSize)
	if err != nil {
		return err
	}

	jobCtx.Server.Logger.Info().
		Int("todo_count", len(todos)).
		Msg("Found overdue todos")

	userTodos := make(map[string][]string)
	enqueuedCount := 0

	for _, todo := range todos {
		if len(userTodos[todo.UserID]) < jobCtx.Server.Config.Cron.MaxTodosPerUserNotification {
			userTodos[todo.UserID] = append(userTodos[todo.UserID], todo.Title)
		}

		overdueTask := &job.ReminderEmailPayload{
			UserID:    todo.UserID,
			TodoID:    todo.ID,
			TodoTitle: todo.Title,
			DueDate:   *todo.DueDate,
			TaskType:  "overdue_reminder",
		}

		err := job.EnqueueReminderEmail(jobCtx.JobClient, overdueTask)
		if err != nil {
			jobCtx.Server.Logger.Error().
				Err(err).
				Str("todo_id", todo.ID.String()).
				Str("user_id", todo.UserID).
				Msg("Failed to enqueue overdue notification")

			continue
		}

		enqueuedCount++

		jobCtx.Server.Logger.Info().
			Str("todo_id", todo.ID.String()).
			Str("todo_title", todo.Title).
			Str("user_id", todo.UserID).
			Msg("Enqueued overdue notification")
	}

	jobCtx.Server.Logger.Info().
		Int("enqueued_count", enqueuedCount).
		Int("total_todos", len(todos)).
		Msg("Overdue notifications enqueued")

	for userID, titles := range userTodos {
		jobCtx.Server.Logger.Info().
			Str("user_id", userID).
			Int("overdue_count", len(titles)).
			Msg("User overdue todos enqueued")
	}

	return nil
}

//============================================================================

type WeeklyReportJob struct{}

func (j *WeeklyReportJob) Name() string {
	return "weekly-reports"
}

func (j *WeeklyReportJob) Description() string {
	return "Enqueue weekly productivity report emails"
}

func (j *WeeklyReportJob) Run(ctx context.Context, jobCtx *JobContext) error {
	now := time.Now()
	weekAgo := now.AddDate(0, 0, -7)

	stats, err := jobCtx.Repositories.Todo.GetWeeklyStatsForUsers(ctx, weekAgo, now)
	if err != nil {
		return err
	}

	jobCtx.Server.Logger.Info().
		Int("user_count", len(stats)).
		Msg("Generating weekly reports")

	enqueuedCount := 0

	for _, userStats := range stats {
		completedTodos, err := jobCtx.Repositories.Todo.GetCompletedTodosForUser(ctx, userStats.UserID, weekAgo, now)
		if err != nil {
			jobCtx.Server.Logger.Error().
				Err(err).
				Str("user_id", userStats.UserID).
				Msg("Failed to fetch completed todos")

			completedTodos = []todo.PopulatedTodo{}
		}

		overdueTodos, err := jobCtx.Repositories.Todo.GetOverdueTodosForUser(ctx, userStats.UserID)
		if err != nil {
			jobCtx.Server.Logger.Error().
				Err(err).
				Str("user_id", userStats.UserID).
				Msg("Failed to fetch overdue todos")

			overdueTodos = []todo.PopulatedTodo{}
		}

		weeklyReportTask := &job.WeeklyReportEmailPayload{
			UserID:         userStats.UserID,
			WeekStart:      weekAgo,
			WeekEnd:        now,
			CompletedCount: userStats.CompletedCount,
			ActiveCount:    userStats.ActiveCount,
			OverdueCount:   userStats.OverdueCount,
			CompletedTodos: completedTodos,
			OverdueTodos:   overdueTodos,
		}

		err = job.EnqueueWeeklyReportEmail(jobCtx.JobClient, weeklyReportTask)
		if err != nil {
			jobCtx.Server.Logger.Error().
				Err(err).
				Str("user_id", userStats.UserID).
				Msg("Failed to enqueue weekly report")

			continue
		}

		enqueuedCount++

		jobCtx.Server.Logger.Info().
			Str("user_id", userStats.UserID).
			Int("created", userStats.CreatedCount).
			Int("completed", userStats.CompletedCount).
			Int("active", userStats.ActiveCount).
			Int("overdue", userStats.OverdueCount).
			Msg("Enqueued weekly report")
	}

	jobCtx.Server.Logger.Info().
		Int("enqueued_count", enqueuedCount).
		Int("total_users", len(stats)).
		Msg("Weekly reports enqueued")

	return nil
}

//============================================================================

type AutoArchiveJob struct{}

func (j *AutoArchiveJob) Name() string {
	return "auto-archive"
}

func (j *AutoArchiveJob) Description() string {
	return "Archive old completed todos"
}

func (j *AutoArchiveJob) Run(ctx context.Context, jobCtx *JobContext) error {
	cutoffDate := time.Now().AddDate(0, 0, -jobCtx.Server.Config.Cron.ArchiveDaysThreshold)

	jobCtx.Server.Logger.Info().
		Time("cutoff_date", cutoffDate).
		Msg("Searching for completed todos to archive")

	todos, err := jobCtx.Repositories.Todo.GetCompletedTodosOlderThan(ctx, cutoffDate, jobCtx.Server.Config.Cron.BatchSize)
	if err != nil {
		return err
	}

	jobCtx.Server.Logger.Info().
		Int("todo_count", len(todos)).
		Msg("Found completed todos to archive")

	if len(todos) == 0 {
		jobCtx.Server.Logger.Info().Msg("No todos to archive")
		return nil
	}

	todoIDs := make([]uuid.UUID, len(todos))
	userTodos := make(map[string]int)

	for i, todo := range todos {
		todoIDs[i] = todo.ID
		userTodos[todo.UserID]++
	}

	err = jobCtx.Repositories.Todo.ArchiveTodos(ctx, todoIDs)
	if err != nil {
		return err
	}

	jobCtx.Server.Logger.Info().
		Int("archived_count", len(todoIDs)).
		Msg("Successfully archived todos")

	for userID, count := range userTodos {
		jobCtx.Server.Logger.Info().
			Str("user_id", userID).
			Int("archived_count", count).
			Msg("User todos archived")
	}

	return nil
}

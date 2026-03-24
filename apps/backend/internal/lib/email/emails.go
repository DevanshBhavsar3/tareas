package email

import (
	"fmt"
	"time"

	"github.com/DevanshBhavsar3/tareas/internal/model/todo"
	"github.com/google/uuid"
)

func (c *Client) SendDueReminderEmail(to, todoTitle string, todoID uuid.UUID, dueDate time.Time) error {
	data := map[string]any{
		"TodoTitle":    todoTitle,
		"TodoID":       todoID.String(),
		"DueDate":      dueDate.Format("Monday, January 2, 2006 at 3:04 PM"),
		"DaysUntilDue": int(time.Until(dueDate).Hours() / 24),
	}

	return c.SendEmail(
		to,
		fmt.Sprintf("Reminder: '%s' is due soon", todoTitle),
		DueReminderTemplate,
		data,
	)
}

func (c *Client) SendOverdueReminderEmail(to, todoTitle string, todoID uuid.UUID, dueDate time.Time) error {
	data := map[string]any{
		"TodoTitle":   todoTitle,
		"TodoID":      todoID.String(),
		"DueDate":     dueDate.Format("Monday, January 2, 2006 at 3:04 PM"),
		"DaysOverdue": int(time.Since(dueDate).Hours() / 24),
	}

	return c.SendEmail(
		to,
		fmt.Sprintf("Overdue: '%s' needs your attention", todoTitle),
		OverdueReminderTemplate,
		data,
	)
}

func (c *Client) SendWeeklyReportEmail(
	to string,
	weekStart,
	weekEnd time.Time,
	completedCount, activeCount, overdueCount int,
	completedTodos, overdueTodos []todo.PopulatedTodo,
) error {
	data := map[string]any{
		"WeekStart":      weekStart.Format("January 2, 2006"),
		"WeekEnd":        weekEnd.Format("January 2, 2006"),
		"CompletedCount": completedCount,
		"ActiveCount":    activeCount,
		"OverdueCount":   overdueCount,
		"CompletedTodos": completedTodos,
		"OverdueTodos":   overdueTodos,
		"HasCompleted":   completedCount > 0,
		"HasOverdue":     overdueCount > 0,
	}

	return c.SendEmail(
		to,
		fmt.Sprintf("Your Weekly Productivity Report (%s - %s)", weekStart.Format("Jan 2"), weekEnd.Format("Jan 2")),
		WeeklyReportTemplate,
		data,
	)
}

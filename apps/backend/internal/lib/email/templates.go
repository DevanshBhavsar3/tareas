package email

type Template string

const (
	DueReminderTemplate     Template = "due-reminder"
	OverdueReminderTemplate Template = "overdue-reminder"
	WeeklyReportTemplate    Template = "weekly-report"
)

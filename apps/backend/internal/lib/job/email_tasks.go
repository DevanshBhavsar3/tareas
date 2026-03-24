package job

import (
	"encoding/json"
	"time"

	"github.com/DevanshBhavsar3/tareas/internal/model/todo"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

const (
	TaskReminderEmail     = "email:reminder"
	TaskWeeklyReportEmail = "email:weekly_report"
)

type ReminderEmailPayload struct {
	UserID    string    `json:"user_id"`
	TodoID    uuid.UUID `json:"todo_id"`
	TodoTitle string    `json:"todo_title"`
	DueDate   time.Time `json:"due_date"`
	TaskType  string    `json:"task_type"`
}

func EnqueueReminderEmail(client *asynq.Client, task *ReminderEmailPayload) error {
	payload, err := json.Marshal(task)
	if err != nil {
		return err
	}

	asynqTask := asynq.NewTask(TaskReminderEmail, payload,
		asynq.MaxRetry(3),
		asynq.Queue("default"),
		asynq.Timeout(30*time.Second))

	_, err = client.Enqueue(asynqTask)
	return err
}

type WeeklyReportEmailPayload struct {
	UserID         string               `json:"user_id"`
	WeekStart      time.Time            `json:"week_start"`
	WeekEnd        time.Time            `json:"week_end"`
	CompletedCount int                  `json:"completed_count"`
	ActiveCount    int                  `json:"active_count"`
	OverdueCount   int                  `json:"overdue_count"`
	CompletedTodos []todo.PopulatedTodo `json:"completed_todos"`
	OverdueTodos   []todo.PopulatedTodo `json:"overdue_todos"`
}

func EnqueueWeeklyReportEmail(client *asynq.Client, task *WeeklyReportEmailPayload) error {
	payload, err := json.Marshal(task)
	if err != nil {
		return err
	}

	asynqTask := asynq.NewTask(TaskWeeklyReportEmail, payload,
		asynq.MaxRetry(3),
		asynq.Queue("default"),
		asynq.Timeout(60*time.Second))

	_, err = client.Enqueue(asynqTask)
	return err
}

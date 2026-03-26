package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/DevanshBhavsar3/tareas/internal/errs"
	"github.com/DevanshBhavsar3/tareas/internal/model/todo"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type TodoRepository struct {
	server *server.Server
}

func NewTodoRepository(server *server.Server) *TodoRepository {
	return &TodoRepository{
		server: server,
	}
}

func (r *TodoRepository) CreateTodo(ctx context.Context, userID string, payload *todo.CreateTodoPayload) (*todo.Todo, error) {
	query := `
		INSERT INTO todos(
			user_id,
			title,       
			description, 
			priority,    
			due_date,     
			parent_todo_id,
			category_id,  
			metadata    
		) VALUES (
			@user_id,
			@title,       
			@description, 
			@priority,    
			@due_date,     
			@parent_todo_id,
			@category_id,  
			@metadata    
		) RETURNING *
	`

	if payload.Priority == nil {
		defaultPriority := todo.PriorityLow
		payload.Priority = &defaultPriority
	}

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id":        userID,
		"title":          payload.Title,
		"description":    payload.Description,
		"priority":       payload.Priority,
		"due_date":       payload.DueDate,
		"parent_todo_id": payload.ParentTodoID,
		"category_id":    payload.CategoryID,
		"metadata":       payload.Metadata,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute create todo query: %w", err)
	}

	todoItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[todo.Todo])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todos: %w", err)
	}

	return &todoItem, nil
}

func (r *TodoRepository) GetTodoByID(ctx context.Context, userID string, payload *todo.GetTodoByIDPayload) (*todo.PopulatedTodo, error) {
	query := `
		SELECT
			t.*,
			CASE
				WHEN c.id IS NOT NULL
					THEN to_jsonb(camel(c))
				ELSE NULL	
			END as category,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(child))
					ORDER BY
						child.sort_order ASC,
						child.created_at ASC
				) FILTER (
					WHERE
						child.id IS NOT NULL
				),
				'[]'::JSONB
			) as children,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(tcomment))
					ORDER BY
						tcomment.created_at ASC
				) FILTER (
					WHERE
						tcomment.id IS NOT NULL
				),
				'[]'::JSONB
			) as comments,
			COALESCE (
				(
					SELECT 
						jsonb_agg(a.obj ORDER BY a.created_at ASC)
					FROM (
						SELECT DISTINCT ON (ta.id)
							ta.created_at,
							to_jsonb(camel(ta)) AS obj
						FROM todo_attachments ta
						WHERE ta.todo_id = t.id
						ORDER BY ta.id, ta.created_at ASC
					) a
				),
				'[]'::jsonb
			) as attachments
		FROM todos t
			LEFT JOIN todo_categories c ON c.id = t.category_id AND c.user_id=@user_id
			LEFT JOIN todos child ON child.parent_todo_id = t.id AND child.user_id=@user_id
			LEFT JOIN todo_comments tcomment ON tcomment.todo_id = t.id AND tcomment.user_id=@user_id
			LEFT JOIN todo_attachments tattachment ON tattachment.todo_id = t.id
		WHERE 
			t.id = @id AND t.user_id = @user_id
		GROUP BY
			t.id,
			c.id
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"id":      payload.ID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get todo by id query: %w", err)
	}

	populatedTodoItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[todo.PopulatedTodo])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todos: %w", err)
	}

	return &populatedTodoItem, nil
}

func (r *TodoRepository) CheckTodoExists(ctx context.Context, userID string, todoID uuid.UUID) (*todo.Todo, error) {
	query := `
		SELECT *
		FROM todos
		WHERE
			id=@id AND user_id=@user_id
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"id":      todoID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to check if todo exists: %w", err)
	}

	todoItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[todo.Todo])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todos: %w", err)
	}

	return &todoItem, nil
}

func (r *TodoRepository) GetTodos(ctx context.Context, userID string, payload *todo.GetTodosPayload) (*todo.PaginatedPopulatedTodoResponse, error) {
	query := `
		SELECT
			t.*,
			CASE
				WHEN c.id IS NOT NULL
					THEN to_jsonb(camel(c))
				ELSE NULL	
			END as category,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(child))
					ORDER BY
						child.sort_order ASC,
						child.created_at ASC
				) FILTER (
					WHERE
						child.id IS NOT NULL
				),
				'[]'::JSONB
			) as children,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(tcomment))
					ORDER BY
						tcomment.created_at ASC
				) FILTER (
					WHERE
						tcomment.id IS NOT NULL
				),
				'[]'::JSONB
			) as comments,
			COALESCE (
				(
					SELECT 
						jsonb_agg(a.obj ORDER BY a.created_at ASC)
					FROM (
						SELECT DISTINCT ON (ta.id)
							ta.created_at,
							to_jsonb(camel(ta)) AS obj
						FROM todo_attachments ta
						WHERE ta.todo_id = t.id
						ORDER BY ta.id, ta.created_at ASC
					) a
				),
				'[]'::jsonb
			) as attachments
		FROM todos t
			LEFT JOIN todo_categories c ON c.id = t.category_id AND c.user_id=@user_id
			LEFT JOIN todos child ON child.parent_todo_id = t.id AND child.user_id=@user_id
			LEFT JOIN todo_comments tcomment ON tcomment.todo_id = t.id AND tcomment.user_id=@user_id
			LEFT JOIN todo_attachments tattachment ON tattachment.todo_id = t.id
	`

	args := pgx.NamedArgs{
		"user_id": userID,
	}

	conditions := []string{
		"t.user_id = @user_id",
	}

	if payload.Status != nil {
		conditions = append(conditions, "t.status = @status")
		args["status"] = *payload.Status
	}

	if payload.Priority != nil {
		conditions = append(conditions, "t.priority = @priority")
		args["priority"] = *payload.Priority
	}

	if payload.CategoryID != nil {
		conditions = append(conditions, "t.category_Id = @category_id")
		args["category_id"] = *payload.CategoryID
	}

	if payload.ParentTodoID != nil {
		conditions = append(conditions, "t.parent_todo_id = @parent_todo_id")
		args["parent_todo_id"] = *payload.ParentTodoID
	} else {
		conditions = append(conditions, "t.parent_todo_id IS NULL")
	}

	if payload.DueFrom != nil {
		conditions = append(conditions, "t.due_date >= @due_from")
		args["due_from"] = *payload.DueFrom
	}

	if payload.DueTo != nil {
		conditions = append(conditions, "t.due_date <= @due_to")
		args["due_to"] = *payload.DueTo
	}

	if payload.Overdue != nil && *payload.Overdue {
		conditions = append(conditions, "t.due_date < NOW() && t.status != 'completed'")
	}

	if payload.Completed != nil {
		if *payload.Completed {
			conditions = append(conditions, "t.status = 'completed'")
		} else {
			conditions = append(conditions, "t.status != 'completed'")
		}
	}

	if payload.Search != nil {
		conditions = append(conditions, "(t.title ILIKE @search OR t.description ILIKE @search)")
		args["search"] = "%" + *payload.Search + "%"
	}

	if payload.Sort == nil {
		defaultSort := "created_at"
		payload.Sort = &defaultSort
	}

	if payload.Order == nil {
		defaultOrder := "desc"
		payload.Order = &defaultOrder
	}

	query += fmt.Sprintf(`
		WHERE %s 
		GROUP BY t.id, c.id
		ORDER BY t.%s %s
		LIMIT @limit OFFSET @offset
	`, strings.Join(conditions, " AND "), *payload.Sort, *payload.Order)

	args["limit"] = *payload.Limit
	args["offset"] = (*payload.Page - 1) * (*payload.Limit)

	rows, err := r.server.DB.Pool.Query(ctx, query, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute get todos query: %w", err)
	}

	todos, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.PopulatedTodo])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &todo.PaginatedPopulatedTodoResponse{
				Data:       []todo.PopulatedTodo{},
				Page:       *payload.Page,
				Limit:      *payload.Limit,
				Total:      0,
				TotalPages: 0,
			}, nil
		}

		return nil, fmt.Errorf("failed to collect rows from table:todos: %w", err)
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM todos t
		WHERE %s
	`, strings.Join(conditions, " AND "))

	var total int
	if err := r.server.DB.Pool.QueryRow(ctx, countQuery, args).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to get total count for todos: %w", err)
	}

	return &todo.PaginatedPopulatedTodoResponse{
		Data:       todos,
		Page:       *payload.Page,
		Limit:      *payload.Limit,
		Total:      total,
		TotalPages: (total + *payload.Limit - 1) / *payload.Limit,
	}, nil
}

func (r *TodoRepository) UpdateTodo(ctx context.Context, userID string, payload *todo.UpdateTodoPayload) (*todo.Todo, error) {
	args := pgx.NamedArgs{
		"id":      payload.ID,
		"user_id": userID,
	}
	setClauses := []string{}

	if payload.Title != nil {
		setClauses = append(setClauses, "title = @title")
		args["title"] = *payload.Title
	}

	if payload.Description != nil {
		setClauses = append(setClauses, "description = @description")
		args["description"] = *payload.Description
	}

	if payload.Status != nil {
		setClauses = append(setClauses, "status = @status")
		args["status"] = *payload.Status

		// Auto-set completed_at when status changes to completed
		if *payload.Status == todo.StatusCompleted {
			setClauses = append(setClauses, "completed_at = @completed_at")
			args["completed_at"] = time.Now()
		} else if *payload.Status != todo.StatusCompleted {
			setClauses = append(setClauses, "completed_at = NULL")
		}
	}

	if payload.Priority != nil {
		setClauses = append(setClauses, "priority = @priority")
		args["priority"] = *payload.Priority
	}

	if payload.DueDate != nil {
		setClauses = append(setClauses, "due_date = @due_date")
		args["due_date"] = *payload.DueDate
	}

	if payload.ParentTodoID != nil {
		setClauses = append(setClauses, "parent_todo_id = @parent_todo_id")
		args["parent_todo_id"] = *payload.ParentTodoID
	}

	if payload.CategoryID != nil {
		setClauses = append(setClauses, "category_id = @category_id")
		args["category_id"] = *payload.CategoryID
	}

	if payload.Metadata != nil {
		setClauses = append(setClauses, "metadata = @metadata")
		args["metadata"] = payload.Metadata
	}

	if len(setClauses) == 0 {
		return nil, errs.NewBadRequestError("no fields to update", false, nil, nil, nil)
	}

	query := fmt.Sprintf(`
		UPDATE todos
		SET %s
		WHERE
			id = @id AND 
			user_id = @user_id
		RETURNING *
	`, strings.Join(setClauses, ", "))

	rows, err := r.server.DB.Pool.Query(ctx, query, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute update todo query: %w", err)
	}

	updatedTodo, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[todo.Todo])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todos: %w", err)
	}

	return &updatedTodo, nil
}

func (r *TodoRepository) DeleteTodo(ctx context.Context, userID string, payload *todo.DeleteTodoPayload) error {
	query := `
		DELETE FROM todos
		WHERE
			id = @id AND 
			user_id = @user_id
	`

	result, err := r.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
		"id":      payload.ID,
		"user_id": userID,
	})
	if err != nil {
		return fmt.Errorf("failed to execute delete todo query: %w", err)
	}

	if result.RowsAffected() == 0 {
		code := "TODO_NOT_FOUND"
		return errs.NewNotFoundError("todo not found", false, &code)
	}

	return nil
}

func (r *TodoRepository) GetTodoStats(ctx context.Context, userID string) (*todo.TodoStats, error) {
	query := `
		SELECT
			COUNT(*) AS total,
			COUNT(
				CASE
					WHEN status='draft' THEN 1
				END
			) AS draft,
			COUNT(
				CASE
					WHEN status='active' THEN 1
				END
			) AS active,
			COUNT(
				CASE
					WHEN status='completed' THEN 1
				END
			) AS completed,
			COUNT(
				CASE
					WHEN status='archived' THEN 1
				END
			) AS archived,
			COUNT(
				CASE
					WHEN due_date < NOW() AND status!='completed' THEN 1
				END
			) AS overdue
		FROM
			todos
		WHERE
			user_id=@user_id
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute todo stats query: %w", err)
	}

	stats, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[todo.TodoStats])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todos: %w", err)
	}

	return &stats, nil
}

func (r *TodoRepository) UploadTodoAttachment(
	ctx context.Context,
	todoID uuid.UUID,
	fileName string,
	userID string,
	s3Key string,
	fileSize int64,
	mimeType string,
) (*todo.TodoAttachment, error) {
	query := `
		INSERT INTO
			todo_attachments (
				todo_id,
				name,
				uploaded_by,
				download_key,
				file_size,
				mime_type
			)
		VALUES
			(
				@todo_id,
				@name,
				@uploaded_by,
				@download_key,
				@file_size,
				@mime_type
			)
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"todo_id":      todoID,
		"name":         fileName,
		"uploaded_by":  userID,
		"download_key": s3Key,
		"file_size":    fileSize,
		"mime_type":    mimeType,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create todo attachment for todo_id=%s: %w", todoID.String(), err)
	}

	attachment, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[todo.TodoAttachment])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_attachments: %w", err)
	}

	return &attachment, nil
}

func (r *TodoRepository) GetTodoAttachment(ctx context.Context, todoID uuid.UUID, attachmentID uuid.UUID) (*todo.TodoAttachment, error) {
	query := `
		SELECT
			*
		FROM
			todo_attachments
		WHERE
			id = @id AND
			todo_id = @todo_id
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"id":      attachmentID,
		"todo_id": todoID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get todo attachment: %w", err)
	}

	attachment, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[todo.TodoAttachment])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			code := "ATTACHMENT_NOT_FOUND"
			return nil, errs.NewNotFoundError("attachment not found", false, &code)
		}

		return nil, fmt.Errorf("failed to collect row from table:todo_attachments: %w", err)
	}

	return &attachment, nil
}

func (r *TodoRepository) GetTodoAttachments(ctx context.Context, todoID uuid.UUID) ([]todo.TodoAttachment, error) {
	query := `
		SELECT
			*
		FROM
			todo_attachments
		WHERE
			todo_id = @todo_id
		ORDER BY
			created_at DESC
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"todo_id": todoID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get todo attachments: %w", err)
	}

	attachments, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.TodoAttachment])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return []todo.TodoAttachment{}, nil
		}

		return nil, fmt.Errorf("failed to collect rows from table:todo_attachments: %w", err)
	}

	return attachments, nil
}

func (r *TodoRepository) DeleteTodoAttachment(ctx context.Context, payload *todo.DeleteTodoAttachmentPayload) error {
	query := `
		DELETE FROM todo_attachments
		WHERE
			id = @id AND
			todo_id = @todo_id
	`

	result, err := r.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
		"id":      payload.AttachmentId,
		"todo_id": payload.TodoID,
	})
	if err != nil {
		return fmt.Errorf("failed to delete todo attachment: %w", err)
	}

	if result.RowsAffected() == 0 {
		code := "ATTACHMENT_NOT_FOUND"
		return errs.NewNotFoundError("attachment not found", false, &code)
	}

	return nil
}

func (r *TodoRepository) GetTodosDueInHours(ctx context.Context, hours int, limit int) ([]todo.Todo, error) {
	query := fmt.Sprintf(`
		SELECT
			t.*
		FROM
			todos t
		WHERE
			t.due_date IS NOT NULL
			AND t.due_date > NOW()
			AND t.due_date <= NOW() + INTERVAL '%d hours'
			AND t.status NOT IN ('completed', 'archived')
		ORDER BY
			t.due_date ASC
		LIMIT
			%d
	`, hours, limit)

	rows, err := r.server.DB.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute get todos due in %d hours query: %w", hours, err)
	}

	todos, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.Todo])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return []todo.Todo{}, nil
		}

		return nil, fmt.Errorf("failed to collect rows from table:todos: %w", err)
	}

	return todos, nil
}

func (r *TodoRepository) GetOverdueTodos(ctx context.Context, limit int) ([]todo.Todo, error) {
	query := `
		SELECT
			*
		FROM
			todos
		WHERE
			due_date IS NOT NULL
			AND due_date < NOW()
			AND status NOT IN ('completed', 'archived')
		ORDER BY
			due_date ASC
		LIMIT
			@limit
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"limit": limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get overdue todos query: %w", err)
	}

	todos, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.Todo])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return []todo.Todo{}, nil
		}

		return nil, fmt.Errorf("failed to collect rows from table:todos: %w", err)
	}

	return todos, nil
}

func (r *TodoRepository) GetCompletedTodosOlderThan(ctx context.Context, cutoffDate time.Time, limit int) ([]todo.Todo, error) {
	query := `
		SELECT
			*
		FROM
			todos
		WHERE
			status = 'completed'
			AND completed_at IS NOT NULL
			AND completed_at < @cutoff_date
		ORDER BY
			completed_at ASC
		LIMIT
			@limit
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"cutoff_date": cutoffDate,
		"limit":       limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get completed todos older than %s query: %w", cutoffDate.Format("2006-01-02"), err)
	}

	todos, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.Todo])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return []todo.Todo{}, nil
		}

		return nil, fmt.Errorf("failed to collect rows from table:todos: %w", err)
	}

	return todos, nil
}

func (r *TodoRepository) ArchiveTodos(ctx context.Context, todoIDs []uuid.UUID) error {
	query := `
		UPDATE todos
		SET
			status = 'archived'
		WHERE
			id = ANY(@todo_ids::uuid[])
	`

	result, err := r.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
		"todo_ids": todoIDs,
	})
	if err != nil {
		return fmt.Errorf("failed to archive todos: %w", err)
	}

	if result.RowsAffected() != int64(len(todoIDs)) {
		return fmt.Errorf("expected to archive %d todos, but archived %d", len(todoIDs), result.RowsAffected())
	}

	return nil
}

func (r *TodoRepository) GetWeeklyStatsForUsers(ctx context.Context, startDate, endDate time.Time) ([]todo.UserWeeklyStats, error) {
	query := `
		SELECT
			user_id,
			COUNT(*) FILTER (WHERE created_at >= @start_date AND created_at <= @end_date) AS created_count,
			COUNT(*) FILTER (WHERE status = 'completed' AND completed_at >= @start_date AND completed_at <= @end_date) AS completed_count,
			COUNT(*) FILTER (WHERE status NOT IN ('completed', 'archived')) AS active_count,
			COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'archived')) AS overdue_count
		FROM
			todos
		GROUP BY
			user_id
		HAVING
			COUNT(*) > 0
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"start_date": startDate,
		"end_date":   endDate,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get weekly stats query: %w", err)
	}

	stats, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.UserWeeklyStats])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return []todo.UserWeeklyStats{}, nil
		}

		return nil, fmt.Errorf("failed to collect rows from table:todos: %w", err)
	}

	return stats, nil
}

func (r *TodoRepository) GetCompletedTodosForUser(ctx context.Context, userID string,
	startDate, endDate time.Time,
) ([]todo.PopulatedTodo, error) {
	query := `
		SELECT
			t.*,
			CASE
				WHEN c.id IS NOT NULL
					THEN to_jsonb(camel(c))
				ELSE NULL	
			END as category,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(child))
					ORDER BY
						child.sort_order ASC,
						child.created_at ASC
				) FILTER (
					WHERE
						child.id IS NOT NULL
				),
				'[]'::JSONB
			) as children,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(tcomment))
					ORDER BY
						tcomment.created_at ASC
				) FILTER (
					WHERE
						tcomment.id IS NOT NULL
				),
				'[]'::JSONB
			) as comments,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(tattachment))
					ORDER BY
						tattachment.created_at ASC
				) FILTER (
					WHERE
						tattachment.id IS NOT NULL
				),
				'[]'::JSONB
			) as attachments
		FROM todos t
			LEFT JOIN todo_categories c ON c.id = t.category_id AND c.user_id=@user_id
			LEFT JOIN todos child ON child.parent_todo_id = t.id AND child.user_id=@user_id
			LEFT JOIN todo_comments tcomment ON tcomment.todo_id = t.id AND tcomment.user_id=@user_id
			LEFT JOIN todo_attachments tattachment ON tattachment.todo_id = t.id
		WHERE
			t.user_id = @user_id
			AND t.status = 'completed'
			AND t.completed_at >= @start_date
			AND t.completed_at <= @end_date
		GROUP BY
			t.id, c.id
		ORDER BY
			t.completed_at DESC
		LIMIT 10
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id":    userID,
		"start_date": startDate,
		"end_date":   endDate,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get completed todos query for user %s: %w", userID, err)
	}

	completedTodos, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.PopulatedTodo])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return []todo.PopulatedTodo{}, nil
		}

		return nil, fmt.Errorf("failed to collect completed todos for user %s: %w", userID, err)
	}

	return completedTodos, nil
}

func (r *TodoRepository) GetOverdueTodosForUser(ctx context.Context, userID string) ([]todo.PopulatedTodo, error) {
	query := `
		SELECT
			t.*,
			CASE
				WHEN c.id IS NOT NULL
					THEN to_jsonb(camel(c))
				ELSE NULL	
			END as category,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(child))
					ORDER BY
						child.sort_order ASC,
						child.created_at ASC
				) FILTER (
					WHERE
						child.id IS NOT NULL
				),
				'[]'::JSONB
			) as children,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(tcomment))
					ORDER BY
						tcomment.created_at ASC
				) FILTER (
					WHERE
						tcomment.id IS NOT NULL
				),
				'[]'::JSONB
			) as comments,
			COALESCE (
				jsonb_agg(
					to_jsonb(camel(tattachment))
					ORDER BY
						tattachment.created_at ASC
				) FILTER (
					WHERE
						tattachment.id IS NOT NULL
				),
				'[]'::JSONB
			) as attachments
		FROM todos t
			LEFT JOIN todo_categories c ON c.id = t.category_id AND c.user_id=@user_id
			LEFT JOIN todos child ON child.parent_todo_id = t.id AND child.user_id=@user_id
			LEFT JOIN todo_comments tcomment ON tcomment.todo_id = t.id AND tcomment.user_id=@user_id
			LEFT JOIN todo_attachments tattachment ON tattachment.todo_id = t.id
		WHERE
			t.user_id = @user_id
			AND t.due_date < NOW()
			AND t.status NOT IN ('completed', 'archived')
		GROUP BY
			t.id, c.id
		ORDER BY
			t.due_date ASC
		LIMIT 10
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get overdue todos query for user %s: %w", userID, err)
	}

	overdueTodos, err := pgx.CollectRows(rows, pgx.RowToStructByName[todo.PopulatedTodo])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return []todo.PopulatedTodo{}, nil
		}

		return nil, fmt.Errorf("failed to collect overdue todos for user %s: %w", userID, err)
	}

	return overdueTodos, nil
}

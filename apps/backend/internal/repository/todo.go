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
		SELECT (
			t.*,
			CASE
				WHEN category.id IS NOT NULL
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
					to_jsonb(camel(comment))
					ORDER BY
						comment.created_at ASC
				) FILTER (
					WHERE
						comment.id IS NOT NULL
				),
				'[]'::JSONB
			) as comments,
		) 
		FROM todos t
			LEFT JOIN todo_categories category ON category.id = t.category_id AND category.user_id=@user_id
			LEFT JOIN todos child ON child.parent_todo_id = t.id AND child.user_id=@user_id
			LEFT JOIN todo_comments comment ON comment.todo_id = t.id AND comment.user_id=@user_id
		WHERE 
			t.id = @id AND t.user_id = @user_id
		GROUP BY
			t.id,
			category.id
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
			) as comments
		FROM todos t
			LEFT JOIN todo_categories c ON c.id = t.category_id AND c.user_id=@user_id
			LEFT JOIN todos child ON child.parent_todo_id = t.id AND child.user_id=@user_id
			LEFT JOIN todo_comments tcomment ON tcomment.todo_id = t.id AND tcomment.user_id=@user_id
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
		return nil, fmt.Errorf("failed to get total count for todos: %w", &err)
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

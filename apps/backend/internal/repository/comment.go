package repository

import (
	"context"
	"fmt"

	"github.com/DevanshBhavsar3/tareas/internal/errs"
	"github.com/DevanshBhavsar3/tareas/internal/model/comment"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/jackc/pgx/v5"
)

type CommentRepository struct {
	server *server.Server
}

func NewCommentRepository(server *server.Server) *CommentRepository {
	return &CommentRepository{
		server: server,
	}
}

func (r *CommentRepository) AddComment(ctx context.Context, userID string, payload *comment.AddCommentPayload) (*comment.Comment, error) {
	query := `
		INSERT INTO todo_comments (
			user_id,
			todo_id,
			content
		) VALUES (
			@user_id,
			@todo_id,
			@content
		) RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"todo_id": payload.TodoID,
		"content": payload.Content,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute add comment query: %w", err)
	}

	commentItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[comment.Comment])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_comments: %w", err)
	}

	return &commentItem, nil
}

func (r *CommentRepository) GetCommentsByTodoID(ctx context.Context, userID string, payload *comment.GetCommentsByTodoIDPayload) ([]comment.Comment, error) {
	query := `
		SELECT *
		FROM todo_comments
		WHERE
			user_id = @user_id AND
			todo_id = @todo_id
		ORDER BY
			created_at ASC
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"todo_id": payload.TodoID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get comments by todo id query: %w", err)
	}

	comments, err := pgx.CollectRows(rows, pgx.RowToStructByName[comment.Comment])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_comments: %w", err)
	}

	return comments, nil
}

func (r *CommentRepository) GetCommentByID(ctx context.Context, userID string, payload *comment.GetCommentByIDPayload) (*comment.Comment, error) {
	query := `
		SELECT *
		FROM todo_comments
		WHERE
			user_id = @user_id AND
			id = @id
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"id":      payload.ID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get comment by id query: %w", err)
	}

	commentItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[comment.Comment])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_comments: %w", err)
	}

	return &commentItem, nil
}

func (r *CommentRepository) UpdateComment(ctx context.Context, userID string, payload *comment.UpdateCommentPayload) (*comment.Comment, error) {
	query := `
		UPDATE todo_comments
		SET
			content = @content
		WHERE
			user_id = @user_id AND
			id = @id
		RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"id":      payload.ID,
		"content": payload.Content,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute update comment query: %w", err)
	}

	commentItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[comment.Comment])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_comments: %w", err)
	}

	return &commentItem, nil
}

func (r *CommentRepository) DeleteComment(ctx context.Context, userID string, payload *comment.DeleteCommentPayload) error {
	query := `
		DELETE FROM todo_comments
		WHERE
			user_id = @user_id AND
			id = @id
	`

	result, err := r.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"id":      payload.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to execute delete comment query: %w", err)
	}

	if result.RowsAffected() == 0 {
		code := "COMMENT_NOT_FOUND"
		return errs.NewNotFoundError("comment not found", false, &code)
	}

	return nil
}

package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/DevanshBhavsar3/tareas/internal/errs"
	"github.com/DevanshBhavsar3/tareas/internal/model/category"
	"github.com/DevanshBhavsar3/tareas/internal/server"
	"github.com/jackc/pgx/v5"
)

type CategoryRepository struct {
	server *server.Server
}

func NewCategoryRepository(server *server.Server) *CategoryRepository {
	return &CategoryRepository{
		server: server,
	}
}

func (r *CategoryRepository) CreateCategory(ctx context.Context, userID string, payload *category.CreateCategoryPayload) (*category.Category, error) {
	query := `
		INSERT INTO todo_categories (
			user_id,
			name,
			color,
			description
		) VALUES (
			@user_id,
			@name,
			@color,
			@description
		) RETURNING *
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id":     userID,
		"name":        payload.Name,
		"color":       payload.Color,
		"description": payload.Description,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute create category query: %w", err)
	}

	categoryItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[category.Category])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_categories: %w", err)
	}

	return &categoryItem, nil
}

func (r *CategoryRepository) GetCategoryByID(ctx context.Context, userID string, payload *category.GetCategoryByIDPayload) (*category.Category, error) {
	query := `
		SELECT *
		FROM todo_categories
		WHERE
			user_id = @user_id AND
			id = @id
	`

	rows, err := r.server.DB.Pool.Query(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"id":      payload.ID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to execute get category by id query: %w", err)
	}

	categoryItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[category.Category])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_categories: %w", err)
	}

	return &categoryItem, nil
}

func (r *CategoryRepository) GetCategories(ctx context.Context, userID string, payload *category.GetCategoriesPayload) (*category.PaginatedCategoryResponse, error) {
	query := `
		SELECT *
		FROM todo_categories
		WHERE
			user_id = @user_id
	`
	args := pgx.NamedArgs{
		"user_id": userID,
		"sort":    *payload.Sort,
		"order":   *payload.Order,
		"limit":   *payload.Limit,
		"offset":  (*payload.Page - 1) * (*payload.Limit),
	}

	if payload.Search != nil {
		query += " AND name ILIKE '%' || @search || '%'"
		args["search"] = *payload.Search
	}

	query += fmt.Sprintf(`
		ORDER BY %s %s
		LIMIT @limit OFFSET @offset
	`, *payload.Sort, *payload.Order)

	rows, err := r.server.DB.Pool.Query(ctx, query, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute get categories query: %w", err)
	}

	categories, err := pgx.CollectRows(rows, pgx.RowToStructByName[category.Category])
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return &category.PaginatedCategoryResponse{
				Data:       []category.Category{},
				Page:       *payload.Page,
				Limit:      *payload.Limit,
				Total:      0,
				TotalPages: 0,
			}, nil
		}

		return nil, fmt.Errorf("failed to collect rows from table:todo_categories: %w", err)
	}

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM todo_categories
		WHERE
			user_id = @user_id
	`)
	countArgs := pgx.NamedArgs{
		"user_id": userID,
	}

	if payload.Search != nil {
		countQuery += " AND name ILIKE '%' || @search || '%'"
		countArgs["search"] = *payload.Search
	}

	var total int
	if err = r.server.DB.Pool.QueryRow(ctx, countQuery, countArgs).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to get total category count: %w", err)
	}

	return &category.PaginatedCategoryResponse{
		Data:       categories,
		Limit:      *payload.Limit,
		Page:       *payload.Page,
		Total:      total,
		TotalPages: (total + *payload.Limit - 1) / *payload.Limit,
	}, nil
}

func (r *CategoryRepository) UpdateCategory(ctx context.Context, userID string, payload *category.UpdateCategoryPayload) (*category.Category, error) {
	args := pgx.NamedArgs{
		"user_id": userID,
		"id":      payload.ID,
	}
	setClauses := []string{}

	if payload.Name != nil {
		setClauses = append(setClauses, "name = @name")
		args["name"] = *payload.Name
	}

	if payload.Color != nil {
		setClauses = append(setClauses, "color = @color")
		args["color"] = *payload.Color
	}

	if payload.Description != nil {
		setClauses = append(setClauses, "description = @description")
		args["description"] = *payload.Description
	}

	if len(setClauses) == 0 {
		return nil, errs.NewBadRequestError("no fields to update", false, nil, nil, nil)
	}

	query := fmt.Sprintf(`
		UPDATE todo_categories
		SET %s
		WHERE
			user_id = @user_id AND
			id = @id
		RETURNING *
	`, strings.Join(setClauses, ", "))

	rows, err := r.server.DB.Pool.Query(ctx, query, args)
	if err != nil {
		return nil, fmt.Errorf("failed to execute update category query: %w", err)
	}

	categoryItem, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[category.Category])
	if err != nil {
		return nil, fmt.Errorf("failed to collect row from table:todo_categories: %w", err)
	}

	return &categoryItem, nil
}

func (r *CategoryRepository) DeleteCategory(ctx context.Context, userID string, payload *category.DeleteCategoryPayload) error {
	query := `
		DELETE FROM todo_categories
		WHERE
			user_id = @user_id AND
			id = @id
	`

	result, err := r.server.DB.Pool.Exec(ctx, query, pgx.NamedArgs{
		"user_id": userID,
		"id":      payload.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to execute delte category query: %w", err)
	}

	if result.RowsAffected() == 0 {
		code := "CATEGORY_NOT_FOUND"
		return errs.NewNotFoundError("category not found", false, &code)
	}

	return nil
}

package service

import (
	"github.com/DevanshBhavsar3/tareas/internal/middleware"
	"github.com/DevanshBhavsar3/tareas/internal/model/category"
	"github.com/DevanshBhavsar3/tareas/internal/repository"
	"github.com/labstack/echo/v4"
)

type CategoryService struct {
	categoryRepo *repository.CategoryRepository
}

func NewCategoryService(categoryRepo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{
		categoryRepo: categoryRepo,
	}
}

func (s *CategoryService) CreateCategory(ctx echo.Context, userID string, payload *category.CreateCategoryPayload) (*category.Category, error) {
	logger := middleware.GetLogger(ctx)

	categoryItem, err := s.categoryRepo.CreateCategory(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to create category")
		return nil, err
	}

	logger.Info().
		Str("event", "category_created").
		Str("category_id", categoryItem.ID.String()).
		Str("name", categoryItem.Name).
		Str("color", categoryItem.Color).
		Msg("Category created successfully")

	return categoryItem, nil
}

func (s *CategoryService) GetCategories(ctx echo.Context, userID string, payload *category.GetCategoriesPayload) (*category.PaginatedCategoryResponse, error) {
	logger := middleware.GetLogger(ctx)

	categories, err := s.categoryRepo.GetCategories(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to fetch categories")
		return nil, err
	}

	return categories, nil
}

func (s *CategoryService) GetCategoryByID(ctx echo.Context, userID string, payload *category.GetCategoryByIDPayload) (*category.Category, error) {
	logger := middleware.GetLogger(ctx)

	categoryItem, err := s.categoryRepo.GetCategoryByID(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to fetch category by ID")
		return nil, err
	}

	return categoryItem, nil
}

func (s *CategoryService) UpdateCategory(ctx echo.Context, userID string, payload *category.UpdateCategoryPayload) (*category.Category, error) {
	logger := middleware.GetLogger(ctx)

	categoryItem, err := s.categoryRepo.UpdateCategory(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to update category")
		return nil, err
	}

	logger.Info().
		Str("event", "category_updated").
		Str("category_id", categoryItem.ID.String()).
		Str("name", categoryItem.Name).
		Msg("Category updated successfully")

	return categoryItem, nil
}

func (s *CategoryService) DeleteCategory(ctx echo.Context, userID string, payload *category.DeleteCategoryPayload) error {
	logger := middleware.GetLogger(ctx)

	err := s.categoryRepo.DeleteCategory(ctx.Request().Context(), userID, payload)
	if err != nil {
		logger.Error().Err(err).Msg("failed to delete category")
		return err
	}

	logger.Info().
		Str("event", "category_deleted").
		Str("category_id", payload.ID.String()).
		Msg("Category deleted successfully")

	return nil
}

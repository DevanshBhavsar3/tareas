package category

import (
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

//============================================================================
// Request DTOs
//============================================================================

type CreateCategoryPayload struct {
	Name        string  `json:"name" validate:"required,min=1,max=100"`
	Color       string  `json:"color" validate:"required,hexcolor"`
	Description *string `json:"description" validate:"omitempty,max=255"`
}

func (p *CreateCategoryPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

//============================================================================

type GetCategoryByIDPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *GetCategoryByIDPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

// ============================================================================

type UpdateCategoryPayload struct {
	ID          uuid.UUID `param:"id" validate:"required,uuid"`
	Name        *string   `json:"name" validate:"omitempty,min=1,max=100"`
	Color       *string   `json:"color" validate:"omitempty,hexcolor"`
	Description *string   `json:"description" validate:"omitempty,max=255"`
}

func (p *UpdateCategoryPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

//============================================================================

type GetCategoriesPayload struct {
	Page   *int    `query:"page" validate:"omitempty,min=1"`
	Limit  *int    `query:"limit" validate:"omitempty,min=1,max=100"`
	Sort   *string `query:"sort" validate:"omitempty,oneof=created_at updated_at name"`
	Order  *string `query:"order" validate:"omitempty,oneof=asc desc"`
	Search *string `query:"search" validate:"omitempty,min=1"`
}

func (p *GetCategoriesPayload) Validate(validate *validator.Validate) error {
	if err := validate.Struct(p); err != nil {
		return err
	}

	// Set defaults
	if p.Page == nil {
		defaultPage := 1
		p.Page = &defaultPage
	}

	if p.Limit == nil {
		defaultLimit := 50
		p.Limit = &defaultLimit
	}

	if p.Sort == nil {
		defaultSort := "name"
		p.Sort = &defaultSort
	}

	if p.Order == nil {
		defaultOrder := "asc"
		p.Order = &defaultOrder
	}

	return nil
}

//============================================================================

type DeleteCategoryPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *DeleteCategoryPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

//============================================================================
// Response DTOs
//============================================================================

type PaginatedCategoryResponse struct {
	Data       []Category `json:"data"`
	Page       int        `json:"page"`
	TotalPages int        `json:"totalPages"`
	Limit      int        `json:"limit"`
	Total      int        `json:"total"`
}

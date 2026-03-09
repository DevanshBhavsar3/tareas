package todo

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

//============================================================================

type CreateTodoPayload struct {
	Title        string     `json:"title" validate:"required,min=1,max=255"`
	Description  *string    `json:"description" validate:"omitempty,max=1000"`
	Priority     *Priority  `json:"priority" validate:"omitempty,oneof=low medium high"`
	DueDate      *time.Time `json:"dueDate"`
	ParentTodoID *uuid.UUID `json:"parentTodoId" validate:"omitempty,uuid"`
	CategoryID   *uuid.UUID `json:"categoryId" validate:"omitempty,uuid"`
	Metadata     *Metadata  `json:"metadata"`
}

func (p *CreateTodoPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

//============================================================================

type UpdateTodoPayload struct {
	ID           uuid.UUID  `param:"id" validate:"required,uuid"`
	Title        *string    `json:"title" validate:"omitempty,min=1,max=255"`
	Description  *string    `json:"description" validate:"omitempty,max=1000"`
	Status       *Status    `json:"status" validate:"omitempty,oneof=draft active completed archived"`
	Priority     *Priority  `json:"priority" validate:"omitempty,oneof=low medium high"`
	DueDate      *time.Time `json:"dueDate"`
	ParentTodoID *uuid.UUID `json:"parentTodoId" validate:"omitempty,uuid"`
	CategoryID   *uuid.UUID `json:"categoryId" validate:"omitempty,uuid"`
	Metadata     *Metadata  `json:"metadata"`
}

func (p *UpdateTodoPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

//============================================================================

type GetTodos struct {
	Page         *int       `query:"page" validate:"omitempty,min=1"`
	Limit        *int       `query:"limit" validate:"omitempty,min=1,max=100"`
	Sort         *string    `query:"sort" validate:"omitempty,oneof=created_at updated_at title priority due_date status"`
	Order        *string    `query:"order" validate:"omitempty,oneof=asc desc"`
	Search       *string    `query:"search" validate:"omitempty,min=1"`
	Status       *Status    `query:"status" validate:"omitempty,oneof=draft active completed archived"`
	Priority     *Priority  `query:"priority" validate:"omitempty,oneof=low medium high"`
	CategoryID   *uuid.UUID `query:"categoryId" validate:"omitempty,uuid"`
	ParentTodoID *uuid.UUID `query:"parentTodoId" validate:"omitempty,uuid"`
	DueFrom      *time.Time `query:"dueFrom"`
	DueTo        *time.Time `query:"dueTo"`
	Overdue      *bool      `query:"overdue"`
	Completed    *bool      `query:"completed"`
}

func (p *GetTodos) Validate(validate *validator.Validate) error {
	if err := validate.Struct(p); err != nil {
		return err
	}

	if p.Page == nil {
		defaultPage := 1
		p.Page = &defaultPage
	}

	if p.Limit == nil {
		defaultLimit := 20
		p.Page = &defaultLimit
	}

	if p.Sort == nil {
		defaultSort := "created_at"
		p.Sort = &defaultSort
	}

	if p.Order == nil {
		defaultOrder := "desc"
		p.Order = &defaultOrder
	}

	return nil
}

//============================================================================

type GetTodoByIDPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *GetTodoByIDPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

//============================================================================

type DeleteTodoPayload struct {
	ID uuid.UUID `param:"id" validate:"required,uuid"`
}

func (p *DeleteTodoPayload) Validate(validate *validator.Validate) error {
	return validate.Struct(p)
}

//============================================================================

type GetTodoStatsPayload struct{}

func (p *GetTodoStatsPayload) Validate(validate *validator.Validate) error {
	return nil
}

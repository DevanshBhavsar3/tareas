package cron

import (
	"context"
	"fmt"
)

type JobRunner struct {
	job Job
	ctx *JobContext
}

func NewJobRunner(job Job) (*JobRunner, error) {
	ctx, err := NewJobContext()
	if err != nil {
		return nil, fmt.Errorf("failed to create job context: %w", err)
	}

	return &JobRunner{
		job: job,
		ctx: ctx,
	}, nil
}

func (r *JobRunner) Run() error {
	defer r.ctx.Close()

	r.ctx.Server.Logger.Info().
		Str("job", r.job.Name()).
		Msg("Starting cron job")

	ctx := context.Background()

	err := r.job.Run(ctx, r.ctx)
	if err != nil {
		r.ctx.Server.Logger.Error().
			Err(err).
			Str("job", r.job.Name()).
			Msg("Failed to run cron job")

		return err
	}

	r.ctx.Server.Logger.Info().
		Str("job", r.job.Name()).
		Msg("Cron job completed successfully")

	return nil
}

package main

import (
	"fmt"
	"os"

	"github.com/DevanshBhavsar3/tareas/internal/cron"
	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "cron",
		Short: "Tareas Cron Job Runner",
		Long:  "Tareas Cron Job Runner - Execute scheduled jobs for the Tareas - task management system",
	}

	registry := cron.NewJobRegistry()

	listCmd := &cobra.Command{
		Use:   "list",
		Short: "List available cron jobs",
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Print(registry.Help())
		},
	}
	rootCmd.AddCommand(listCmd)

	for _, jobName := range registry.List() {
		job, _ := registry.Get(jobName)

		jobCmd := &cobra.Command{
			Use:   job.Name(),
			Short: job.Description(),
			RunE: func(cmd *cobra.Command, args []string) error {
				runner, err := cron.NewJobRunner(job)
				if err != nil {
					return fmt.Errorf("failed to create job runner: %w", err)
				}

				if err := runner.Run(); err != nil {
					return fmt.Errorf("job failed: %w", err)
				}

				return nil
			},
		}

		rootCmd.AddCommand(jobCmd)
	}

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

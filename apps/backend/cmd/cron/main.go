package main

import (
	"fmt"
	"net/http"

	"github.com/DevanshBhavsar3/tareas/internal/config"
	"github.com/DevanshBhavsar3/tareas/internal/cron"
	"github.com/labstack/echo/v5"
)

func main() {
	cfg := config.Load()
	e := echo.New()
	registry := cron.NewJobRegistry()

	fmt.Println(cfg.Cron.CRON_SECRET)

	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			token := c.Request().Header.Get("Authorization")
			if token != "Bearer "+cfg.Cron.CRON_SECRET {
				return c.String(http.StatusUnauthorized, "Unauthorized")
			}

			return next(c)
		}
	})

	e.GET("/cron", func(c *echo.Context) error {
		jobs := registry.List()
		return c.JSON(http.StatusOK, jobs)
	})

	e.POST("/cron/:job", func(c *echo.Context) error {
		jobName := c.Param("job")

		job, err := registry.Get(jobName)
		if err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}

		runner, err := cron.NewJobRunner(job)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}

		if err := runner.Run(); err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}

		return c.String(http.StatusOK, "Job executed successfully")
	})

	if err := e.Start(":8080"); err != nil {
		e.Logger.Error("Failed to start server: ", "error", err)
	}
}

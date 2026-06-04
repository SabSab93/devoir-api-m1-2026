package main

import (
	"api-go-docker/internal/database"
	"api-go-docker/internal/handlers"
	"api-go-docker/internal/repository"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	db := database.Connect()
	defer db.Close()

	schisteRepo := repository.NewSchisteRepository(db)
	schisteHandler := handlers.NewSchisteHandler(schisteRepo)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.SetHeader("Content-Type", "application/json"))

	r.Route("/api/schistes", func(r chi.Router) {
		r.Get("/", schisteHandler.GetAll)
		r.Post("/", schisteHandler.Create)
		r.Get("/{id}", schisteHandler.GetOne)
		r.Put("/{id}", schisteHandler.Update)
		r.Delete("/{id}", schisteHandler.Delete)
	})

	log.Println("API running on :3022")
	if err := http.ListenAndServe(":3022", r); err != nil {
		log.Fatal(err)
	}
}

package handlers

import (
	"api-go-docker/internal/models"
	"api-go-docker/internal/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type SchisteHandler struct {
	repo *repository.SchisteRepository
}

func NewSchisteHandler(repo *repository.SchisteRepository) *SchisteHandler {
	return &SchisteHandler{repo: repo}
}

func (h *SchisteHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	schistes, err := h.repo.FindAll()
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if schistes == nil {
		schistes = []models.Schiste{}
	}
	jsonResponse(w, http.StatusOK, schistes)
}

func (h *SchisteHandler) GetOne(w http.ResponseWriter, r *http.Request) {
	id := parseID(w, r)
	if id == 0 {
		return
	}
	s, err := h.repo.FindByID(id)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if s == nil {
		jsonError(w, http.StatusNotFound, "schiste not found")
		return
	}
	jsonResponse(w, http.StatusOK, s)
}

func (h *SchisteHandler) Create(w http.ResponseWriter, r *http.Request) {
	var s models.Schiste
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid body")
		return
	}
	created, err := h.repo.Create(&s)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	jsonResponse(w, http.StatusCreated, created)
}

func (h *SchisteHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := parseID(w, r)
	if id == 0 {
		return
	}
	var s models.Schiste
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid body")
		return
	}
	updated, err := h.repo.Update(id, &s)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if updated == nil {
		jsonError(w, http.StatusNotFound, "schiste not found")
		return
	}
	jsonResponse(w, http.StatusOK, updated)
}

func (h *SchisteHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := parseID(w, r)
	if id == 0 {
		return
	}
	deleted, err := h.repo.Delete(id)
	if err != nil {
		jsonError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !deleted {
		jsonError(w, http.StatusNotFound, "schiste not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func parseID(w http.ResponseWriter, r *http.Request) int {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id <= 0 {
		jsonError(w, http.StatusBadRequest, "invalid id")
		return 0
	}
	return id
}

func jsonResponse(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func jsonError(w http.ResponseWriter, status int, msg string) {
	jsonResponse(w, status, map[string]string{"error": msg})
}

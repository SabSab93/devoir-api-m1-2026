package models

import "time"

type Schiste struct {
	ID          int       `json:"id"`
	Nom         string    `json:"nom"`
	Origine     string    `json:"origine"`
	Profondeur  float64   `json:"profondeur"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

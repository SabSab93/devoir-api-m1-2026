package repository

import (
	"api-go-docker/internal/models"
	"database/sql"
)

type SchisteRepository struct {
	db *sql.DB
}

func NewSchisteRepository(db *sql.DB) *SchisteRepository {
	return &SchisteRepository{db: db}
}

func (r *SchisteRepository) FindAll() ([]models.Schiste, error) {
	rows, err := r.db.Query(`SELECT id, nom, origine, profondeur, description, created_at, updated_at FROM schistes ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schistes []models.Schiste
	for rows.Next() {
		var s models.Schiste
		if err := rows.Scan(&s.ID, &s.Nom, &s.Origine, &s.Profondeur, &s.Description, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		schistes = append(schistes, s)
	}
	return schistes, nil
}

func (r *SchisteRepository) FindByID(id int) (*models.Schiste, error) {
	var s models.Schiste
	err := r.db.QueryRow(
		`SELECT id, nom, origine, profondeur, description, created_at, updated_at FROM schistes WHERE id = $1`, id,
	).Scan(&s.ID, &s.Nom, &s.Origine, &s.Profondeur, &s.Description, &s.CreatedAt, &s.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SchisteRepository) Create(s *models.Schiste) (*models.Schiste, error) {
	err := r.db.QueryRow(
		`INSERT INTO schistes (nom, origine, profondeur, description) VALUES ($1, $2, $3, $4)
		 RETURNING id, nom, origine, profondeur, description, created_at, updated_at`,
		s.Nom, s.Origine, s.Profondeur, s.Description,
	).Scan(&s.ID, &s.Nom, &s.Origine, &s.Profondeur, &s.Description, &s.CreatedAt, &s.UpdatedAt)
	return s, err
}

func (r *SchisteRepository) Update(id int, s *models.Schiste) (*models.Schiste, error) {
	err := r.db.QueryRow(
		`UPDATE schistes SET nom=$1, origine=$2, profondeur=$3, description=$4, updated_at=NOW()
		 WHERE id=$5
		 RETURNING id, nom, origine, profondeur, description, created_at, updated_at`,
		s.Nom, s.Origine, s.Profondeur, s.Description, id,
	).Scan(&s.ID, &s.Nom, &s.Origine, &s.Profondeur, &s.Description, &s.CreatedAt, &s.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return s, err
}

func (r *SchisteRepository) Delete(id int) (bool, error) {
	res, err := r.db.Exec(`DELETE FROM schistes WHERE id = $1`, id)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}

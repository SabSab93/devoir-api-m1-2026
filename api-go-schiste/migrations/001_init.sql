CREATE TABLE IF NOT EXISTS schistes (
    id          SERIAL PRIMARY KEY,
    nom         VARCHAR(255) NOT NULL,
    origine     VARCHAR(255) NOT NULL,
    profondeur  FLOAT NOT NULL DEFAULT 0,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

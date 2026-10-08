CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL
                  CHECK (role IN ('ADMIN', 'AUDITOR', 'REPRESENTATIVE')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audited_units (
    id                   SERIAL PRIMARY KEY,
    name                 VARCHAR(150) NOT NULL UNIQUE,
    type                 VARCHAR(20)  NOT NULL
                         CHECK (type IN ('CLUB', 'FORUM', 'UNIT', 'HOSTEL')),
    description          TEXT,
    -- If the responsible user is deleted, the unit stays but has no representative.
    responsible_user_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audits (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    audit_date       DATE NOT NULL,
    -- RESTRICT: a unit that still has audits cannot be deleted by accident.
    audited_unit_id  INTEGER NOT NULL REFERENCES audited_units(id) ON DELETE RESTRICT,
    -- RESTRICT: a user who created audits cannot be deleted.
    created_by       INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audited_units_responsible_user ON audited_units(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_audits_audited_unit ON audits(audited_unit_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_by ON audits(created_by);
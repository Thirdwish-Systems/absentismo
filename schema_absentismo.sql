-- =============================================================================
-- ABSENTISMO PLATFORM - DATABASE SCHEMA (PostgreSQL 17 + pgvector + TimescaleDB)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- pgvector
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- =============================================================================
-- 1. UTILS & FUNCTIONS
-- =============================================================================

-- Updated_at automation
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================================================
-- 2. CORE MASTER TABLES
-- =============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- PostgreSQL 17 standard
    name TEXT NOT NULL,
    sector TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    unit_type TEXT NOT NULL, -- 'Centro', 'Tienda', 'Planta'
    location_data JSONB, -- Dirección, coordenadas, etc.
    is_critical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id),
    name TEXT NOT NULL, -- 'Producción', 'Retail', 'Logística'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    external_id TEXT, -- E-10021
    full_name TEXT NOT NULL,
    gender CHAR(1), -- 'M', 'F', 'X'
    birth_date DATE,
    role TEXT NOT NULL,
    shift TEXT NOT NULL, -- 'Mañana', 'Noche', etc.
    seniority_date DATE,
    salary_annual NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- 3. OPERATIONAL TABLES (ABSENCES & WORKFLOWS)
-- =============================================================================

CREATE TABLE absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    start_date TIMESTAMPTZ NOT NULL,
    expected_end_date TIMESTAMPTZ,
    actual_end_date TIMESTAMPTZ,
    absence_type TEXT NOT NULL, -- 'AT', 'IT', 'Absentismo injustificado'
    reported_by_name TEXT,
    reported_at TIMESTAMPTZ,
    cost_month_est NUMERIC(12, 2), -- Coste estimado mes actual
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    absence_id UUID REFERENCES absences(id),
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'active', 'completed'
    metadata JSONB, -- Pasos, logs, acciones tomadas
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- =============================================================================
-- 4. VECTORIAL SUPPORT (pgvector)
-- =============================================================================

-- Interacciones del Copiloto para memoria semántica
CREATE TABLE copilot_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID,
    query_text TEXT NOT NULL,
    response_text TEXT,
    embedding VECTOR(1536), -- OpenAI Ada-002 dimension (o ajusta a 768 para otros)
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Index para búsqueda semántica ultrarrápida
CREATE INDEX idx_copilot_embedding_hnsw ON copilot_interactions 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Patrones Predictivos
CREATE TABLE prediction_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    title TEXT NOT NULL,
    description TEXT,
    pattern_type TEXT, -- 'Seasonal', 'Operational', etc.
    evidence JSONB, -- Correlaciones, años de coincidencia, variables
    impact_eur NUMERIC(12, 2),
    impact_days INTEGER,
    confidence TEXT,
    embedding VECTOR(1536), -- Representación vectorial del patrón
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patterns_embedding_hnsw ON prediction_patterns 
USING hnsw (embedding vector_cosine_ops);

-- =============================================================================
-- 5. TIME-SERIES (TimescaleDB)
-- =============================================================================

-- Métricas diarias por unidad
CREATE TABLE metrics_unit_daily (
    time TIMESTAMPTZ NOT NULL,
    unit_id UUID NOT NULL REFERENCES units(id),
    absent_count INTEGER,
    active_count INTEGER,
    absenteeism_rate NUMERIC(5, 4),
    cost_daily NUMERIC(12, 2)
);

-- Convertir en Hypertable
SELECT create_hypertable('metrics_unit_daily', 'time');

-- Política de Compresión (A partir de 3 meses)
ALTER TABLE metrics_unit_daily SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'unit_id'
);
SELECT add_compression_policy('metrics_unit_daily', INTERVAL '3 months');

-- Política de Retención (5 años)
SELECT add_retention_policy('metrics_unit_daily', INTERVAL '5 years');

-- Impacto financiero detallado (Series temporales)
CREATE TABLE metrics_financial_impact (
    time TIMESTAMPTZ NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    unit_id UUID,
    concept_key TEXT NOT NULL, -- 'complement', 'substitution', 'overtime', etc.
    amount_eur NUMERIC(12, 2) NOT NULL,
    metadata JSONB
);

SELECT create_hypertable('metrics_financial_impact', 'time');

-- =============================================================================
-- 6. INDICES & OPTIMIZACIÓN
-- =============================================================================

-- Índices GIN para consultas eficientes sobre JSONB
CREATE INDEX idx_organizations_config_gin ON organizations USING GIN (config);
CREATE INDEX idx_workflows_metadata_gin ON workflows USING GIN (metadata);
CREATE INDEX idx_patterns_evidence_gin ON prediction_patterns USING GIN (evidence);

-- Índices compuestos para filtros frecuentes
CREATE INDEX idx_units_org_type ON units (organization_id, unit_type);
CREATE INDEX idx_employees_org_role ON employees (organization_id, role);
CREATE INDEX idx_absences_unit_date ON absences (unit_id, start_date);

-- =============================================================================
-- 7. AUDIT TRIGGERS
-- =============================================================================

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('organizations', 'units', 'groups', 'employees', 'absences', 'workflows', 'prediction_patterns')
    LOOP
        EXECUTE format('CREATE TRIGGER trigger_update_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();', t);
    END LOOP;
END $$;

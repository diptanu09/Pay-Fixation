-- PAYFIX Phase 7 Migration: RBAC, Case State Machine, Immutable Snapshots & Request Auditing

-- 1. Users, Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    designation VARCHAR(150),
    ddo_code VARCHAR(32) REFERENCES ddo_masters(ddo_code),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Roles
INSERT INTO roles (name, description) VALUES
    ('SYSTEM_ADMIN', 'System Administrator with full access'),
    ('DATA_ENTRY', 'Data Entry Officer creating and submitting cases'),
    ('DEALING_ASSISTANT', 'Dealing Assistant processing case details'),
    ('VERIFIER', 'Verifier reviewing calculation traces'),
    ('SUPERINTENDENT', 'Superintendent approving case calculations'),
    ('AUTHORIZING_OFFICER', 'Authorizing Officer issuing sanction orders'),
    ('AUDITOR', 'Auditor reviewing immutable records'),
    ('REPORT_USER', 'Report User generating department summaries'),
    ('READ_ONLY', 'Read-Only Viewer')
ON CONFLICT (name) DO NOTHING;

-- Seed Default Permissions
INSERT INTO permissions (code, description) VALUES
    ('case:create', 'Create new pension/pay fixation cases'),
    ('case:read', 'View case details'),
    ('case:update', 'Update draft case details'),
    ('case:calculate', 'Execute calculation engine'),
    ('case:submit_verification', 'Submit case for verification'),
    ('case:verify', 'Verify case calculation trace'),
    ('case:reject', 'Reject case back to data entry'),
    ('case:approve', 'Approve verified case calculation'),
    ('case:authorize', 'Authorize and issue pension sanction order'),
    ('admin:users', 'Manage system users and role assignments')
ON CONFLICT (code) DO NOTHING;

-- Map Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SYSTEM_ADMIN'
ON CONFLICT DO NOTHING;

-- Map Data Entry permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'DATA_ENTRY' AND p.code IN ('case:create', 'case:read', 'case:update', 'case:calculate', 'case:submit_verification')
ON CONFLICT DO NOTHING;

-- Map Verifier permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'VERIFIER' AND p.code IN ('case:read', 'case:verify', 'case:reject')
ON CONFLICT DO NOTHING;

-- Map Authorizing Officer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'AUTHORIZING_OFFICER' AND p.code IN ('case:read', 'case:approve', 'case:authorize')
ON CONFLICT DO NOTHING;

-- 2. State Machine & Optimistic Locking Columns on pension_cases
ALTER TABLE pension_cases
    ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100),
    ADD COLUMN IF NOT EXISTS assigned_role VARCHAR(50),
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,
    ADD COLUMN IF NOT EXISTS approval_notes TEXT,
    ADD COLUMN IF NOT EXISTS authorized_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS authorized_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ;

-- 3. Enhance calculation_snapshots with SHA-256 Hash & JSON Blobs
ALTER TABLE calculation_snapshots
    ADD COLUMN IF NOT EXISTS calculation_hash VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS input_snapshot JSONB NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS result_snapshot JSONB NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS calculation_steps JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS warnings JSONB NOT NULL DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_immutable BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS calculated_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';

-- 4. Enhance audit_logs with Request Tracking & State Diff
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS request_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS client_ip VARCHAR(50),
    ADD COLUMN IF NOT EXISTS user_role VARCHAR(50),
    ADD COLUMN IF NOT EXISTS before_state JSONB,
    ADD COLUMN IF NOT EXISTS after_state JSONB;

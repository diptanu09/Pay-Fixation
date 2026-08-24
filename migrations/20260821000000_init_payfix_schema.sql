-- PAYFIX Database Schema Initial Migration
-- PostgreSQL 14+ Schema for Pay Fixation & Pension Administration System

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Master Data Tables
CREATE TABLE ddo_masters (
    ddo_code VARCHAR(32) PRIMARY KEY,
    ddo_name VARCHAR(255) NOT NULL,
    office_name VARCHAR(255) NOT NULL,
    district VARCHAR(100),
    treasury_code VARCHAR(32)
);

CREATE TABLE designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    group_class VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pay_matrices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    revision_rule VARCHAR(50) NOT NULL, -- ROP 2017 / ROP 2018
    pay_level VARCHAR(32) NOT NULL,
    grade_pay NUMERIC(12, 2),
    cell_index INT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employee Master Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pr_no VARCHAR(64) UNIQUE NOT NULL,
    application_no VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    group_class VARCHAR(50) NOT NULL,
    dob DATE NOT NULL,
    doj DATE NOT NULL,
    date_regularization DATE,
    date_retirement_or_death DATE NOT NULL,
    ddo_code VARCHAR(32) REFERENCES ddo_masters(ddo_code),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pension Cases
CREATE TABLE pension_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_no VARCHAR(64) UNIQUE NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id),
    case_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    last_basic_pay NUMERIC(12, 2) NOT NULL,
    non_qualifying_days INT NOT NULL DEFAULT 0,
    commutation_percent NUMERIC(5, 2) DEFAULT 40.00,
    age_next_birthday INT NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Calculations & Snapshots
CREATE TABLE calculation_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pension_case_id UUID NOT NULL REFERENCES pension_cases(id),
    engine_version VARCHAR(50) NOT NULL,
    rule_version VARCHAR(50) NOT NULL,
    gross_pension NUMERIC(12, 2) NOT NULL,
    family_pension_normal NUMERIC(12, 2) NOT NULL,
    family_pension_enhanced NUMERIC(12, 2) NOT NULL,
    dcrg_gross NUMERIC(12, 2) NOT NULL,
    dcrg_net NUMERIC(12, 2) NOT NULL,
    commuted_value NUMERIC(12, 2) NOT NULL,
    reduced_pension NUMERIC(12, 2) NOT NULL,
    qualifying_years INT NOT NULL,
    qualifying_months INT NOT NULL,
    qualifying_days INT NOT NULL,
    half_year_periods INT NOT NULL,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Revisions History
CREATE TABLE revision_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_case_id UUID NOT NULL REFERENCES pension_cases(id),
    revision_no INT NOT NULL,
    reason TEXT NOT NULL,
    revised_pension NUMERIC(12, 2) NOT NULL,
    pension_diff NUMERIC(12, 2) NOT NULL,
    revised_dcrg NUMERIC(12, 2) NOT NULL,
    dcrg_diff NUMERIC(12, 2) NOT NULL,
    revised_commutation NUMERIC(12, 2) NOT NULL,
    commutation_diff NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Immutable Audit Log
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

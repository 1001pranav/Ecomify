-- ============================================================================
-- PostgreSQL Initialization Script
-- ============================================================================

-- Create database if not exists
SELECT 'CREATE DATABASE ecomify'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ecomify')\gexec

-- Connect to ecomify database
\c ecomify

-- Enable Row Level Security (RLS) for multi-tenancy
ALTER DATABASE ecomify SET row_security = on;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Create schemas for different services
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS store;
CREATE SCHEMA IF NOT EXISTS product;
CREATE SCHEMA IF NOT EXISTS order_management;
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS customer;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Set search path
ALTER DATABASE ecomify SET search_path TO public, auth, store, product, order_management, payment, inventory, customer, analytics;

-- Create roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ecomify_app') THEN
        CREATE ROLE ecomify_app WITH LOGIN PASSWORD 'change_this_password';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ecomify_readonly') THEN
        CREATE ROLE ecomify_readonly WITH LOGIN PASSWORD 'change_this_password';
    END IF;
END
$$;

-- Grant privileges
GRANT CONNECT ON DATABASE ecomify TO ecomify_app, ecomify_readonly;
GRANT USAGE ON SCHEMA public, auth, store, product, order_management, payment, inventory, customer, analytics TO ecomify_app, ecomify_readonly;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public, auth, store, product, order_management, payment, inventory, customer, analytics TO ecomify_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public, auth, store, product, order_management, payment, inventory, customer, analytics TO ecomify_readonly;

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_log (table_name, operation, old_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_setting('app.user_id', true));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_log (table_name, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_setting('app.user_id', true));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_log (table_name, operation, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_setting('app.user_id', true));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Log initialization
SELECT 'Database initialized successfully' AS status;

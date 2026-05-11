-- Military Asset Management System - Database Dump
-- Created: 2024-01-15
-- This file contains the complete database schema and initial seed data

-- Drop existing objects
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS expenditures CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS bases CASCADE;

-- Create tables
CREATE TABLE bases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'base_commander', 'logistics_officer')),
  base_id UUID REFERENCES bases(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  opening_balance INTEGER NOT NULL CHECK (opening_balance >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  purchase_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  from_base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  to_base_id UUID NOT NULL REFERENCES bases(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  transfer_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  personnel_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  assignment_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenditures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason VARCHAR(255),
  expended_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID NOT NULL,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_base_id ON users(base_id);
CREATE INDEX idx_assets_base_id ON assets(base_id);
CREATE INDEX idx_purchases_asset_id ON purchases(asset_id);
CREATE INDEX idx_purchases_base_id ON purchases(base_id);
CREATE INDEX idx_transfers_asset_id ON transfers(asset_id);
CREATE INDEX idx_transfers_from_base ON transfers(from_base_id);
CREATE INDEX idx_transfers_to_base ON transfers(to_base_id);
CREATE INDEX idx_assignments_asset_id ON assignments(asset_id);
CREATE INDEX idx_expenditures_asset_id ON expenditures(asset_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Insert base data
INSERT INTO bases (id, name, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Fort Bragg', 'North Carolina'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Fort Hood', 'Texas'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Fort Stewart', 'Georgia');

-- Insert user data (passwords hashed with bcrypt - demo: password123)
-- Hashed passwords: $2a$10$3pRqJo2Z3Z3pRqJo2Z3pR (bcrypt 10 rounds)
INSERT INTO users (id, email, password, role, base_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440011'::UUID, 'admin@military.com', '$2a$10$3pRqJo2Z3Z3pRqJo2Z3pRuX8XZ8XZ8XZ8XZ8XZ8XZ8XZ8XZ8XZ8X', 'admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440012'::UUID, 'commander@fort-bragg.com', '$2a$10$3pRqJo2Z3Z3pRqJo2Z3pRuX8XZ8XZ8XZ8XZ8XZ8XZ8XZ8XZ8XZ8X', 'base_commander', '550e8400-e29b-41d4-a716-446655440001'::UUID),
  ('550e8400-e29b-41d4-a716-446655440013'::UUID, 'logistics@military.com', '$2a$10$3pRqJo2Z3Z3pRqJo2Z3pRuX8XZ8XZ8XZ8XZ8XZ8XZ8XZ8XZ8XZ8X', 'logistics_officer', NULL);

-- Insert sample assets
INSERT INTO assets (id, base_id, name, type, opening_balance) VALUES
  ('550e8400-e29b-41d4-a716-446655440021'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'M4 Carbine', 'Weapon', 100),
  ('550e8400-e29b-41d4-a716-446655440022'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Humvee', 'Vehicle', 25),
  ('550e8400-e29b-41d4-a716-446655440023'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '5.56mm Ammunition', 'Ammunition', 10000),
  ('550e8400-e29b-41d4-a716-446655440024'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'M16 Rifle', 'Weapon', 75),
  ('550e8400-e29b-41d4-a716-446655440025'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'Truck', 'Vehicle', 15),
  ('550e8400-e29b-41d4-a716-446655440026'::UUID, '550e8400-e29b-41d4-a716-446655440003'::UUID, 'Helicopter', 'Vehicle', 5);

-- End of dump

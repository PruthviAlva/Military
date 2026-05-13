-- Seed data for Military Asset Management System

-- Insert bases
INSERT INTO bases (id, name, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Fort Bragg', 'North Carolina'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Fort Hood', 'Texas'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Fort Stewart', 'Georgia')
ON CONFLICT (name) DO NOTHING;

-- Insert users (passwords are hashed with bcrypt)
-- Admin user: admin@military.com / password123
-- Base Commander: commander@fort-bragg.com / password123
-- Logistics Officer: logistics@military.com / password123
INSERT INTO users (id, email, password, role, base_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440011'::UUID, 'admin@military.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36p4rWjO', 'admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440012'::UUID, 'commander@fort-bragg.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36p4rWjO', 'base_commander', '550e8400-e29b-41d4-a716-446655440001'::UUID),
  ('550e8400-e29b-41d4-a716-446655440013'::UUID, 'logistics@military.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36p4rWjO', 'logistics_officer', NULL)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Insert sample assets
INSERT INTO assets (id, base_id, name, type, opening_balance) VALUES
  ('550e8400-e29b-41d4-a716-446655440021'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'M4 Carbine', 'Weapon', 100),
  ('550e8400-e29b-41d4-a716-446655440022'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Humvee', 'Vehicle', 25),
  ('550e8400-e29b-41d4-a716-446655440023'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '5.56mm Ammunition', 'Ammunition', 10000)
ON CONFLICT DO NOTHING;

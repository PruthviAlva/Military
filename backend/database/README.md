# Database Setup

## PostgreSQL Schema and Seeding

### Schema Files
- `schema.sql` - Core database schema with all tables
- `seed.sql` - Initial seed data

### Setup Instructions

1. **Create Database**
   ```bash
   createdb military_db
   ```

2. **Load Schema**
   ```bash
   psql military_db < schema.sql
   ```

3. **Load Seed Data**
   ```bash
   psql military_db < seed.sql
   ```

4. **Verify Installation**
   ```bash
   psql military_db -c "SELECT * FROM bases;"
   ```

### Database Models

#### Users
- Stores user accounts with role-based access (admin, base_commander, logistics_officer)
- Linked to bases for role-specific access

#### Bases
- Military installations/bases
- Referenced by assets and transfers

#### Assets
- Equipment tracked across bases (weapons, vehicles, ammunition)
- Tracks opening balance by asset type

#### Purchases
- Records of new equipment purchases
- Linked to asset and base

#### Transfers
- Inter-base asset movements
- Tracks from_base_id and to_base_id

#### Assignments
- Assets assigned to personnel
- Tracks quantity and assignment date

#### Expenditures
- Consumed/expended assets
- Tracks reason for expenditure

#### Audit Logs
- Complete transaction history
- Tracks user, action, resource, changes, and IP address

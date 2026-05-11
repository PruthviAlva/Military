# Military Asset Management Web

React TypeScript frontend for the Military Asset Management System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

- `/src/pages` - Page components (Dashboard, Purchases, Transfers, etc.)
- `/src/components` - Reusable UI components
- `/src/services` - API service calls
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions
- `/src/context` - React context for state management

## Features

- Dashboard with key metrics
- Purchases management
- Asset transfers
- Assignments & expenditures
- Role-based UI
- Authentication

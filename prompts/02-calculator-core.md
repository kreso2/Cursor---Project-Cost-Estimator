# 02 - Calculator Core

## Core Calculator Features
Implement the main project cost calculation functionality with the following capabilities:

## Basic Calculator
- Single role cost calculation
- Hourly rate input
- Number of hours input
- Total cost calculation
- Currency selection (USD, EUR, GBP, etc.)
- Real-time calculation updates

## Multi-Role Calculator
- Add multiple roles to a project
- Each role with:
  - Role title/name
  - Hourly rate
  - Number of hours
  - Subtotal calculation
- Total project cost calculation
- Role management (add, remove, edit)

## Advanced Features
- Currency conversion with live exchange rates
- Tax calculation (net/gross pricing)
- Project templates and presets
- Cost breakdown by role
- Export functionality (PDF, CSV)

## Data Models
```typescript
interface Role {
  id: string;
  name: string;
  hourlyRate: number;
  hours: number;
  currency: string;
  subtotal: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  roles: Role[];
  totalCost: number;
  currency: string;
  taxRate: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## UI Components
- Calculator form with role inputs
- Role list with edit/delete functionality
- Total cost display
- Currency selector
- Tax rate toggle
- Save/load project functionality

## Integration Points
- Connect with role catalog from admin system
- Save projects to database
- Load existing projects
- Share projects via links 

ChatGPT Prompt suggestion:
Add a project cost calculator with:
- Project duration (months), working hours, currency selector
- Add/edit/remove team members with roles, rates, and allocations
- Role catalog integration with autocomplete
- Show total cost, gross margin, blended rates
- Support currency conversion using live exchange rates (mock or real)

ChatGPT Prompt suggestion:
Add a project cost calculator with:
- Project duration (months), working hours, currency selector
- Add/edit/remove team members with roles, rates, and allocations
- Role catalog integration with autocomplete
- Show total cost, gross margin, blended rates
- Support currency conversion using live exchange rates (mock or real)

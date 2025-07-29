# 04 - Project Management

## Project Management Features
Implement comprehensive project management capabilities for organizing and tracking cost calculations.

## Project CRUD Operations
- Create new projects
- View project list with search and filtering
- Edit existing projects
- Delete projects (with confirmation)
- Duplicate projects as templates
- Archive/restore projects

## Project Structure
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  client?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  budget: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  roles: ProjectRole[];
  totalCost: number;
  taxRate: number;
  tags: string[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectRole {
  id: string;
  roleId: string;
  roleName: string;
  hourlyRate: number;
  hours: number;
  subtotal: number;
  currency: string;
  notes?: string;
}
```

## Project Templates
- Save projects as templates
- Browse template library
- Apply templates to new projects
- Share templates with team
- Template categories and tags
- Template rating and reviews

## Project Sharing
- Generate shareable links
- Set sharing permissions (view/edit)
- Password-protected sharing
- Expiration dates for shared links
- Track link usage and views

## Project Analytics
- Project cost breakdown
- Time tracking integration
- Budget vs actual costs
- Project timeline visualization
- Export project reports (PDF, Excel)
- Project comparison tools

## Collaboration Features
- Team member assignments
- Comments and discussions
- Version history
- Change tracking
- Approval workflows
- Notifications for updates

## Project Dashboard
- Overview of all projects
- Recent projects
- Project status summary
- Quick actions (create, duplicate, archive)
- Search and filter capabilities
- Bulk operations

## Database Schema
```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  budget DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  total_cost DECIMAL(15,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tags TEXT[],
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project roles table
CREATE TABLE project_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role_id UUID REFERENCES role_catalog(id),
  role_name TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  hours DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project templates table
CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2),
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project shares table
CREATE TABLE project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id),
  shared_with TEXT NOT NULL,
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  password_hash TEXT,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## UI Components
- Project list view with cards/table
- Project creation wizard
- Project detail view
- Template browser
- Sharing dialog
- Project analytics dashboard
- Search and filter interface
- Bulk action toolbar

## Integration Points
- Connect with calculator for cost updates
- Link with user management for permissions
- Integrate with role catalog
- Export functionality
- Email notifications 

ChatGPT Prompt suggestion:
Add project management features:
- Share projects with users (view/edit permissions)
- Real-time notifications for shared projects
- Search, sort, and bulk project actions
- Export to Excel, import from CSV
- Save and manage project templates

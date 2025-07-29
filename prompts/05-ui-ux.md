# 05 - UI/UX Design

## Design System Overview
Create a modern, accessible, and user-friendly interface for the project cost calculator application.

## Design Principles
- Clean and minimalist design
- Intuitive user experience
- Responsive design for all devices
- Accessibility compliance (WCAG 2.1)
- Consistent visual language
- Fast and responsive interactions

## Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-900: #1e3a8a;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Semantic Colors */
--success-500: #10b981;
--warning-500: #f59e0b;
--error-500: #ef4444;
--info-500: #3b82f6;
```

## Typography
- **Primary Font**: Inter (Google Fonts)
- **Monospace Font**: JetBrains Mono (for code/numbers)
- **Font Sizes**: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px
- **Line Heights**: 1.4, 1.5, 1.6
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Component Library
### Buttons
- Primary button (blue, filled)
- Secondary button (gray, outlined)
- Danger button (red, filled)
- Ghost button (transparent)
- Icon button (circular)
- Loading states
- Disabled states

### Forms
- Input fields with labels
- Text areas
- Select dropdowns
- Checkboxes and radio buttons
- Toggle switches
- Form validation states
- Error messages

### Cards
- Project cards
- Role cards
- User cards
- Template cards
- Hover effects
- Shadow variations

### Tables
- Sortable columns
- Pagination
- Search and filter
- Bulk actions
- Responsive design
- Loading states

### Modals
- Confirmation dialogs
- Form modals
- Information modals
- Loading modals
- Backdrop blur

### Navigation
- Sidebar navigation
- Breadcrumbs
- Tabs
- Pagination
- Search bar

## Layout Structure
```
┌─────────────────────────────────────┐
│ Header (Logo, User Menu, Theme)     │
├─────────────────┬───────────────────┤
│ Sidebar         │ Main Content      │
│ Navigation      │                   │
│                 │                   │
│                 │                   │
│                 │                   │
└─────────────────┴───────────────────┘
```

## Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large Desktop**: 1440px+

## Dark Mode Support
- Automatic theme detection
- Manual theme toggle
- Consistent color mapping
- Proper contrast ratios
- Smooth transitions

## Animation & Transitions
- **Duration**: 150ms, 200ms, 300ms
- **Easing**: ease-in-out, ease-out
- **Properties**: opacity, transform, color
- **Micro-interactions**: hover, focus, click
- **Page transitions**: fade, slide

## Accessibility Features
- Keyboard navigation
- Screen reader support
- Focus indicators
- Color contrast compliance
- ARIA labels and roles
- Skip links
- Error announcements

## Icon System
- **Library**: Lucide React
- **Size variants**: 16px, 20px, 24px, 32px
- **Color inheritance**
- **Consistent stroke width**

## Loading States
- Skeleton loaders
- Spinner animations
- Progress bars
- Shimmer effects
- Loading text

## Error States
- Error boundaries
- Empty states
- 404 pages
- Network error handling
- Validation errors

## Success States
- Success messages
- Confirmation dialogs
- Progress indicators
- Completion animations

## Performance Considerations
- Lazy loading
- Image optimization
- Code splitting
- Bundle size optimization
- Caching strategies 

ChatGPT Prompt suggestion:
Enhance the UI/UX with:
- Professional color palette (HSL)
- Semantic design tokens
- Shadcn UI components: buttons, forms, modals, tables
- Toast notifications, skeleton loaders, error states
- Accessibility: ARIA, keyboard nav, contrast compliance

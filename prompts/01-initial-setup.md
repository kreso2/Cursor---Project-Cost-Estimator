# 01 - Initial Setup

## Project Overview
Create a project cost calculator application with the following features:
- User authentication and authorization
- Project cost calculation with multiple roles
- Admin dashboard for user and role management
- Modern UI with Tailwind CSS
- TypeScript and React

## Initial Requirements
- Set up React + TypeScript project with Vite
- Configure Tailwind CSS
- Set up Supabase for authentication and database
- Create basic project structure
- Implement user authentication flow

## Technical Stack
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS
- Backend: Supabase (Auth + Database)
- State Management: React Context API
- Routing: React Router DOM
- Notifications: react-hot-toast

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── contexts/      # React contexts (Auth, Theme)
├── lib/           # Utility functions and configurations
├── assets/        # Static assets
└── types/         # TypeScript type definitions
```

## Key Features to Implement
1. User registration and login
2. Protected routes
3. Basic layout with sidebar navigation
4. Theme switching (light/dark mode)
5. Responsive design
6. Error handling and loading states 

ChatGPT Prompt suggestion:
Create a modern business web app in React with TypeScript and Tailwind CSS. 
Include:
- Authentication (email/password) using Supabase
- User roles: global_admin, role_admin, user
- Profile management with first/last name, email
- Responsive sidebar navigation
- Dark/light mode toggle
- Home, Projects, Admin, Profile, and Help routes
Use a business-grade blue color palette and professional layout.

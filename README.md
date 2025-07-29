# 🧮 Project Cost Calculator

A comprehensive web application for calculating project costs by managing team roles, hourly rates, and project timelines.

## ✨ Features

- **📊 Project Management**: Create and manage multiple projects with detailed cost calculations
- **👥 Role Catalog**: Predefined roles with base rates and location variations
- **💰 Cost Calculation**: Automatic calculation of project costs, billing, and margins
- **🌍 Multi-currency Support**: Support for different currencies with real-time exchange rates
- **🔐 User Authentication**: Secure user registration and login with Supabase Auth
- **⚡ Real-time Updates**: Live updates using Supabase real-time subscriptions
- **📱 Responsive Design**: Modern UI that works on desktop and mobile devices
- **📧 Email Integration**: Send emails via SendGrid API
- **📱 SMS Integration**: Send SMS messages via Twilio API
- **💱 Currency Conversion**: Live currency exchange rates with caching

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Context API
- **Form Validation**: Zod
- **Notifications**: React Hot Toast
- **Email**: SendGrid API
- **SMS**: Twilio API
- **Currency**: ExchangeRate.host API

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-cost-calculator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment

Copy `env.example` to `.env` and configure your environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Execute the SQL script to create all tables and policies

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📚 Documentation

All documentation is organized in the `docs/` directory:

- **[📖 Documentation Index](docs/README.md)** - Complete documentation overview
- **[⚡ Quick Start](docs/QUICK-START.md)** - Quick setup guide
- **[🔧 Setup Instructions](docs/SETUP-INSTRUCTIONS.md)** - Detailed setup guide
- **[🐛 Troubleshooting](docs/TROUBLESHOOTING-GUIDE.md)** - Common issues and solutions

## 🗂️ Project Structure

```
project-cost-calculator/
├── docs/                    # 📚 Documentation
│   ├── README.md           # Documentation index
│   ├── QUICK-START.md      # Quick setup guide
│   ├── SETUP-INSTRUCTIONS.md # Detailed setup
│   ├── TROUBLESHOOTING-GUIDE.md # Common issues
│   └── ...                 # Other documentation
├── prompts/                # 🤖 AI development prompts
│   ├── 01-initial-setup.md
│   ├── 02-calculator-core.md
│   └── ...                 # Feature-specific prompts
├── src/                    # 💻 Source code
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── lib/              # Utility libraries
│   ├── pages/            # Page components
│   └── main.tsx          # App entry point
├── database-setup.sql     # 🗄️ Database schema
├── server.js             # 🔧 Backend server
└── package.json          # 📦 Dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run server` - Start backend server (for Twilio/Email)

## 🌟 Key Features

### 📊 Project Calculator
- Multi-role project cost calculation
- Real-time currency conversion
- Net/gross pricing with tax calculations
- Project templates and sharing

### 📧 Email Integration
- Send emails via SendGrid API
- Template-based email sending
- Error handling and delivery tracking

### 📱 SMS Integration
- Send SMS messages via Twilio API
- E.164 phone number formatting
- Delivery status tracking

### 💱 Currency Conversion
- Live exchange rates from ExchangeRate.host
- 30+ supported currencies
- Automatic caching for performance
- Real-time rate updates

### 👥 User Management
- Role-based access control
- User authentication with Supabase
- Admin dashboard for user management
- Audit logging

## 🔐 Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Exchange Rate API
VITE_EXCHANGE_RATE_API_KEY=your_api_key

# Optional: Debug Mode
VITE_DEBUG_MODE=false
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User profiles and authentication data
- **projects**: Project data and cost calculations
- **role_catalog**: Predefined roles with rates and skills
- **project_shares**: Project sharing between users
- **project_templates**: Reusable project templates
- **notifications**: User notifications
- **audit_logs**: System audit trail
- **permissions**: System permissions
- **role_permissions**: Role-permission mappings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- 📖 Check the [Documentation](docs/README.md)
- 🐛 Review [Troubleshooting Guide](docs/TROUBLESHOOTING-GUIDE.md)

---

*Built with ❤️ using React, TypeScript, and Supabase* 
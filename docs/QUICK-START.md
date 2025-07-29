# 🚀 Quick Start Guide

## Prva stranica aplikacije

Aplikacija sada ima **Landing stranicu** kao prvu stranicu na `http://localhost:5173/`

### 📋 Koraci za početak:

1. **Otvorite aplikaciju** - `http://localhost:5173/`
2. **Vidjet ćete Landing stranicu** s opisom funkcionalnosti
3. **Kliknite "Get Started"** ili "Sign In" za prijavu
4. **Kreirajte račun** kroz Sign Up formu

### 🔐 Opcije za prijavu:

#### Opcija A: Mock Login (brzo testiranje)
- U donjem desnom kutu je **Mock Login panel**
- Click on any user for instant login
- Test korisnici: admin@test.com, user@test.com, roleadmin@test.com

#### Opcija B: Pravu registracija (preporučeno)
1. Kliknite "Sign Up" na Auth stranici
2. Unesite podatke:
   - **Email**: admin@test.com (or any other)
   - **Password**: test123456 (min 6 znakova)
   - **First Name**: Admin
   - **Last Name**: User
3. Kliknite "Sign up"

### 🎯 What you should see after login:

- **22 roles** in Role Catalog (Development, Design, Management...)
- **3 test projects** with real data
- **Admin Dashboard** (if you're admin)
- **Mock Login panel** for quick switching between users

### 🔧 If you have problems:

1. **Check if database setup is executed**:
   - `database-setup.sql` (run this in Supabase SQL Editor)

2. **Check Supabase configuration**:
   - URL and anon key are set correctly
   - Database is available

3. **Use Mock Login** for quick testing

### 📱 Navigation:

- **Landing** (`/`) - First page with description
- **Auth** (`/auth`) - Login/registration
- **Home** (`/home`) - Main calculator
- **Projects** (`/projects`) - Project management
- **Admin** (`/admin`) - Admin dashboard
- **Profile** (`/profile`) - User profile
- **Help** (`/help`) - Help and documentation

---

**Everything is ready for testing!** 🎉 
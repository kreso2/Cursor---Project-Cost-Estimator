# Setup Instructions - Project Cost Calculator

## 🔧 Rješavanje problema s korisnicima i ulogama

### Problem
- Korisnici se ne prikazuju u Admin Dashboard
- Role Catalog je prazan
- Nema mogućnosti prijave

### Rješenje

#### 1. Pokrenite database-setup.sql:

**Jedan korak za sve:**
```sql
-- Kopirajte i pokrenite database-setup.sql u Supabase SQL Editor
-- Ovo će kreirati sve tablice, funkcije, trigere, politike i seed podatke
```

#### 2. Kreiranje test korisnika

**Opcija A: Kroz Supabase Dashboard**
1. Idite u Supabase Dashboard → Authentication → Users
2. Kliknite "Add User"
3. Kreirajte ove korisnike:

```
Email: admin@test.com
Password: test123456
First Name: Admin
Last Name: User

Email: user@test.com
Password: test123456
First Name: Regular
Last Name: User

Email: roleadmin@test.com
Password: test123456
First Name: Role
Last Name: Admin
```

**Opcija B: Kroz aplikaciju (preporučeno)**
1. Otvorite aplikaciju na http://localhost:5173
2. Kliknite "Sign Up" 
3. Kreirajte korisnike s gore navedenim podacima

#### 3. Postavljanje uloga korisnika

After creating users, run this SQL:

```sql
-- Postavite uloge korisnika
UPDATE users 
SET role = 'global_admin' 
WHERE email = 'admin@test.com';

UPDATE users 
SET role = 'role_admin' 
WHERE email = 'roleadmin@test.com';

UPDATE users 
SET role = 'user' 
WHERE email = 'user@test.com';
```

#### 4. Testiranje

**Option A: Mock Login (quick testing)**
- A "Mock Login" panel will appear in the bottom right corner of the application
- Click on any user for instant login

**Option B: Real login**
- Use the email and password you created
- Log in through the login form

### 📊 What you should see after setup:

#### Role Catalog (22 uloge):
- **Development**: 6 uloga (Frontend, Backend, Full Stack...)
- **Design**: 4 uloge (UI/UX, Graphic Designer...)
- **Management**: 4 uloge (Project Manager, Product Manager...)
- **Operations**: 2 uloge (DevOps Engineer...)
- **Quality Assurance**: 1 uloga (QA Engineer)
- **Analytics**: 2 uloge (Data Analyst, Data Scientist)
- **Security**: 1 uloga (Security Engineer)
- **Marketing**: 2 uloge (Content Strategist, Marketing Manager)

#### Test Projekti (3):
1. E-commerce Platform - $106,200
2. Mobile App Development - $98,400
3. Corporate Website Redesign - $46,400

#### Korisnici (3):
- admin@test.com (Global Admin)
- user@test.com (Regular User)
- roleadmin@test.com (Role Admin)

### 🔍 Check if everything is working:

1. **Check Role Catalog**:
   - Go to the Home page
   - You should see 22 roles in the "Add from Catalog" section

2. **Check Admin Dashboard**:
   - Log in as admin@test.com
   - Go to the Admin page
   - You should see users in the "Users" tab
   - You should see roles in the "Roles" tab

3. **Check Projects**:
   - Go to the Projects page
   - You should see 3 test projects

### 🚨 Common problems and solutions:

**Problem**: "Role catalog is empty"
- **Solution**: Run `fix-users-and-roles.sql` again

**Problem**: "Users not showing in Admin"
- **Solution**: Check if users are created in Supabase Auth

**Problem**: "Cannot login"
- **Solution**: Use Mock Login for quick testing or create users through the application

**Problem**: "Projects not loading"
- **Solution**: Check if RLS policies are set correctly

### 📞 Support

If you still have problems:
1. Check Supabase logs in Dashboard
2. Check browser console for errors
3. Check if all SQL scripts were successfully executed 
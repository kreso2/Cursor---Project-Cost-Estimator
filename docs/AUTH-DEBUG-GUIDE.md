# AuthContext Debug Guide

## Problem
AuthContext initializes, but may not be fetching the user correctly, which causes issues with the admin page.

## Solution

### 1. Test AuthContext

Go to **http://localhost:5173/auth-test** to see what's happening with authentication:

- ✅ Check loading state
- ✅ Check user state
- ✅ Check session state
- ✅ See detailed debug information

### 2. Check browser console

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Go to auth-test page** and see all AuthContext messages
4. **Check** if the user is being fetched correctly

### 3. Most common problems and solutions

#### Problem: "Loading" stays true
**Solution:** Check if `setLoading(false)` is called in all cases

#### Problem: User is null even though session is present
**Solution:** Check if the user exists in the `users` table

#### Problem: Session is null
**Solution:** Check if the user is logged in to Supabase

### 4. Koraci za popravak

1. **Idi na** http://localhost:5173/auth-test
2. **Provjeri rezultate** - vidi što se događa s AuthContext-om
3. **Provjeri konzolu** - vidi detaljne poruke
4. **Provjeri bazu podataka** - vidi da li korisnik postoji
5. **Testiraj ponovno** admin stranicu

### 5. SQL skripte za provjeru

#### Provjeri korisnika u bazi:
```sql
-- Provjeri sve korisnike
SELECT id, email, first_name, last_name, role, is_active, created_at
FROM users
ORDER BY created_at DESC;

-- Provjeri specifičnog korisnika (zamijeni email)
SELECT id, email, first_name, last_name, role, is_active, created_at
FROM users
WHERE email = 'your-email@example.com';
```

#### Kreiraj korisnika ako ne postoji:
```sql
-- Zamijeni s tvojim podacima
INSERT INTO users (id, email, first_name, last_name, role, is_active)
VALUES (
  'your-user-id-here',
  'your-email@example.com',
  'Your',
  'Name',
  'global_admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'global_admin',
  is_active = true;
```

### 6. Provjera da sve radi

Nakon što pokreneš SQL skripte, provjeri:

```sql
-- Provjeri da korisnik postoji i ima admin ulogu
SELECT id, email, first_name, last_name, role, is_active
FROM users
WHERE email = 'your-email@example.com'
AND role IN ('global_admin', 'role_admin');
```

### 7. Testiranje

1. **Osvježi stranicu** http://localhost:5173/auth-test
2. **Provjeri** da se korisnik dohvaća ispravno
3. **Provjeri** da loading postaje false
4. **Idi na** http://localhost:5173/admin-test
5. **Provjeri** da admin test prolazi
6. **Idi na** http://localhost:5173/admin

### 8. Ako i dalje ne radi

1. **Provjeri Supabase logove** u Dashboard
2. **Provjeri RLS politike** za users tablicu
3. **Provjeri da je autentifikacija** ispravno postavljena
4. **Kontaktiraj** ako trebaš pomoć

## Linkovi

- **Auth Test:** http://localhost:5173/auth-test
- **Admin Test:** http://localhost:5173/admin-test
- **Admin Page:** http://localhost:5173/admin
- **Supabase Dashboard:** https://supabase.com/dashboard

## Što očekujem da vidiš u AuthTest:

1. **Loading State** - trebao bi postati false
2. **User State** - trebao bi pokazati "Logged In"
3. **User Details** - trebao bi prikazati tvoje podatke
4. **Session Details** - trebao bi prikazati session informacije
5. **Debug Info** - detaljne informacije o stanju

Nakon što pokreneš sve korake, AuthContext bi trebao raditi ispravno! 🎉 
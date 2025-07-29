# 🔧 UUID Problem Fix Guide

## Problem
"Invalid input syntax for type uuid" - ovo znači da se pokušava umetnuti neispravan UUID format u bazu.

## 🔍 Diagnostika

### 1. Pokrenite `test-uuid.sql`
Ova skripta će:
- Provjeriti da li je UUID ekstenzija dostupna
- Generirati test UUID
- Pokušati umetnuti test korisnika
- Analizirati strukturu tablice
- Provjeriti postojeće korisnike

### 2. Pokrenite `fix-uuid-issue.sql`
Ova skripta će:
- Provjeriti postojeće korisnike
- Validirati UUID formate
- Usporediti `auth.users` i `public.users`
- Automatski kreirati korisničke profile za auth korisnike

## 🚀 Rješenja

### Rješenje 1: Automatsko popravljanje
```sql
-- Pokrenite fix-uuid-issue.sql
-- Ovo će automatski kreirati korisničke profile za sve auth korisnike
```

### Rješenje 2: Ručno kreiranje korisnika
```sql
-- Kreirajte korisnika kroz Supabase Dashboard
-- Idite u Authentication → Users → Add User
-- Zatim pokrenite fix-uuid-issue.sql da kreira profil
```

### Rješenje 3: Reset i ponovno postavljanje
```sql
-- 1. Pokrenite cleanup-functions-triggers.sql
-- 2. Pokrenite database-schema-simple.sql
-- 3. Pokrenite fix-users-and-roles-simple.sql
-- 4. Kreirajte korisnika kroz aplikaciju
```

## 🔧 Česti uzroci problema

### 1. Korisnik nema profil u `public.users`
- Korisnik je kreiran u `auth.users` ali ne u `public.users`
- **Rješenje**: Pokrenite `fix-uuid-issue.sql`

### 2. Neispravan UUID format
- UUID nije u ispravnom formatu (npr. "1" umjesto "550e8400-e29b-41d4-a716-446655440001")
- **Rješenje**: Provjerite MockLogin komponentu

### 3. Problem s foreign key constraint
- `user_id` u `projects` tablici ne odgovara stvarnom korisniku
- **Rješenje**: Ažurirajte projekte s ispravnim `user_id`

### 4. Problem s RLS politikama
- Korisnik nema pristup svojim podacima
- **Rješenje**: Provjerite RLS politike

## 🧪 Testiranje

### Korak 1: Provjerite korisnike
```sql
SELECT id, email, first_name, last_name FROM users ORDER BY created_at DESC;
```

### Korak 2: Provjerite auth korisnike
```sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;
```

### Korak 3: Testirajte kreiranje projekta
1. Prijavite se u aplikaciju
2. Pokušajte kreirati novi projekt
3. Provjerite browser console za greške

## 🔍 Debug informacije

### U browser console trebali biste vidjeti:
```
User created in auth: 550e8400-e29b-41d4-a716-446655440001
User profile created successfully
Fetching user with ID: 550e8400-e29b-41d4-a716-446655440001
User fetched successfully: {id: "550e8400-e29b-41d4-a716-446655440001", ...}
```

### Ako vidite greške:
- "Invalid UUID format" - problem s MockLogin
- "User not found in public.users" - pokrenite fix-uuid-issue.sql
- "Permission denied" - problem s RLS politikama

## 📋 Checklist

- [ ] Pokrenite `test-uuid.sql` i provjerite rezultate
- [ ] Pokrenite `fix-uuid-issue.sql` za automatsko popravljanje
- [ ] Provjerite da li korisnik postoji u `auth.users` i `public.users`
- [ ] Testirajte kreiranje projekta u aplikaciji
- [ ] Provjerite browser console za greške
- [ ] Ako i dalje ne radi, resetirajte bazu i počnite iznova

## 🆘 Ako ništa ne pomaže

1. **Resetirajte bazu** u Supabase Dashboard
2. **Pokrenite sve skripte iznova**:
   - `database-schema-simple.sql`
   - `fix-users-and-roles-simple.sql`
3. **Kreirajte korisnika kroz aplikaciju** (ne kroz Dashboard)
4. **Testirajte s MockLogin** za brzo testiranje

---

**UUID problemi su obično vezani uz sinkronizaciju između `auth.users` i `public.users` tablica.** 🎯 
# Test conexiune Supabase

## Probleme identificate:

1. **ETIMEDOUT** - Conexiunea nu ajunge la server

## Soluții de verificat:

### 1. Verifică setările Supabase

- Intră în Supabase Dashboard
- Mergi la Settings → Database
- Verifică dacă "Connection pooling" este activat
- Copiază connection string-ul corect

### 2. Verifică firewall-ul

- Windows Firewall poate bloca conexiunile pe portul 5432
- Router-ul poate avea restricții

### 3. Verifică IP Whitelisting în Supabase

- În Supabase Dashboard → Settings → API
- Verifică dacă IP-ul tău este în whitelist
- Sau setează 0.0.0.0/0 pentru test (temporar)

### 4. Testează cu Connection String

Înlocuiește configurația din .env cu:

```
# Exemplu (NU FOLOSI PAROLA REALĂ ÎN REPO):
DATABASE_URL=postgresql://USER:PAROLA@xxxx.supabase.co:5432/NUME_BD?sslmode=require
```

### 5. Verifică statusul Supabase

- Mergi pe https://status.supabase.com/
- Verifică dacă sunt probleme cu serviciul

## Testare alternativă cu Connection String:

```bash
# În terminal:
# PowerShell exemplu (înlocuiește USER, PAROLA, HOST, DB):
$env:DATABASE_URL="postgresql://USER:PAROLA@HOST.supabase.co:5432/DB?sslmode=require"
npm run develop
```

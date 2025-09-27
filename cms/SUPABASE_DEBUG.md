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
DATABASE_URL=postgresql://ionutdiaconescu:14081995.IonuttttS@gbzwxjdsinimqdgkvtsu.supabase.co:5432/asociatia_zambete_magice?sslmode=require
```

### 5. Verifică statusul Supabase

- Mergi pe https://status.supabase.com/
- Verifică dacă sunt probleme cu serviciul

## Testare alternativă cu Connection String:

```bash
# În terminal:
$env:DATABASE_URL="postgresql://ionutdiaconescu:14081995.IonuttttS@gbzwxjdsinimqdgkvtsu.supabase.co:5432/asociatia_zambete_magice?sslmode=require"
npm run develop
```

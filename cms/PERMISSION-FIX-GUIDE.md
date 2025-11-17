# Permission Fix Guide - Run in Production

## What This Script Does

The `fix-permissions-db.js` script directly manipulates the Postgres database to:

1. Find the Public role (type='public')
2. Create permission entries in `up_permissions` table for:
   - `api::homepage.homepage.find`
   - `api::homepage.homepage.findOne`
   - `api::campanie-de-donatii.campanie-de-donatii.find`
   - `api::campanie-de-donatii.campanie-de-donatii.findOne`
3. Link these permissions to Public role via `up_permissions_role_lnk` junction table
4. Publish homepage if unpublished

## How to Run on Render

### Option 1: Via Render Shell (Recommended)

1. Go to Render Dashboard → Your Strapi Service
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd /app
   node scripts/fix-permissions-db.js
   ```
4. Look for: `✅ Setup complete!`
5. Restart the service: Settings → Manual Deploy → Deploy Latest Commit

### Option 2: Via package.json Script

Add to `package.json`:

```json
"scripts": {
  "fix-perms": "node scripts/fix-permissions-db.js"
}
```

Then run in Render shell:

```bash
npm run fix-perms
```

## Expected Output

```
✅ Connected to database
✅ Public role ID: 2
✅ Using linking table: up_permissions_role_lnk
🔧 Granting permissions...
✅ Created permission: api::homepage.homepage.find
   ✅ Linked to Public role
✅ Created permission: api::homepage.homepage.findOne
   ✅ Linked to Public role
✅ Created permission: api::campanie-de-donatii.campanie-de-donatii.find
   ✅ Linked to Public role
✅ Created permission: api::campanie-de-donatii.campanie-de-donatii.findOne
   ✅ Linked to Public role
✅ Published 1 homepage(s)
✅ Total application permissions for Public role: 4
🎉 Setup complete!
```

## After Running

1. **Wait for Strapi restart** (Render auto-restarts, or manual restart)
2. **Test the endpoints**:
   ```bash
   curl https://asociatia-zambete-magice.onrender.com/api/homepage?populate=*
   curl https://asociatia-zambete-magice.onrender.com/api/campanie-de-donatiis?populate=coverImage
   ```
3. **Check Admin UI**:
   - Clear browser cache
   - Go to Settings → Users & Permissions → Roles → Public
   - You should now see Homepage and Campanie-de-donatii sections
   - Permissions should be checked

## Troubleshooting

### Still Getting 404

- Routes not registered yet → Check that index.ts files exist in API folders
- Run `npm run fix-apis` to generate missing index.ts files
- Redeploy after generating index files

### Getting 403 Forbidden (Good Sign!)

- Permissions created but not taking effect yet
- Try: Restart Strapi service manually
- Clear Strapi cache: delete `.cache` folder and rebuild

### Content Types Not in Admin UI

- This is separate from API access - routes need to be registered
- Check Render logs for route registration messages
- Ensure `src/api/*/index.ts` files are present

## Database Schema Reference

Strapi v5 permission structure discovered:

- **up_roles**: Stores role definitions (id, name, type)
- **up_permissions**: Stores permission actions (id, action)
- **up_permissions_role_lnk**: Links roles to permissions (role_id, permission_id)

This is a many-to-many relationship via junction table.

## Safety Notes

- Script is **idempotent** - safe to run multiple times
- Uses `INSERT ... ON CONFLICT DO NOTHING` pattern
- Only affects Public role (type='public')
- Does NOT delete any existing permissions
- Can be run before or after content creation

## Next Steps After Success

1. ✅ Deploy frontend to Vercel (will now get 200 responses)
2. ✅ Remove emergency scripts from codebase
3. ✅ Document this for future content types
4. ✅ Consider adding this to CI/CD pipeline

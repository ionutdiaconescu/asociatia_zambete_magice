# API Setup Fix for Content Types

## Problem

Content types created in Admin UI don't appear in Settings → Roles → Public permissions.

## Root Cause

Strapi doesn't automatically generate `index.ts` files for API modules, which are required for route registration.

## Solution

### After creating ANY new content type in Admin UI:

1. **Generate missing index files:**

   ```bash
   cd cms
   npm run fix-apis
   ```

2. **Build and deploy:**

   ```bash
   npm run build
   cd ..
   git add .
   git commit -m "fix: add index.ts for new content type"
   git push
   ```

3. **Wait for Render to deploy** (3-5 minutes)

4. **Set permissions in Admin UI:**

   - Settings → Users & Permissions → Roles → Public
   - Find your content type under "Application" section
   - Check `find` and `findOne`
   - Save

5. **Publish content:**

   - Content Manager → Your content type
   - Click Publish

6. **Test API:**
   ```bash
   curl https://asociatia-zambete-magice.onrender.com/api/your-content-type?populate=*
   ```

## Current Status

### Working Content Types

- ✅ Homepage (`/api/homepage`)
- ✅ Campanie-de-donatii (`/api/campanie-de-donatiis`)
- ✅ Donatii
- ✅ Page

### Incomplete Setup (missing folders)

- ⚠️ Payments
- ⚠️ Stats
- ⚠️ Test

## Manual Deploy on Render

If changes don't appear after git push:

1. Go to Render Dashboard
2. Select `asociatia-zambete-magice` service
3. Click **Manual Deploy**
4. Select **Clear build cache & deploy**

## Troubleshooting

### Content type doesn't appear in Roles:

- Verify `index.ts` exists: `cms/src/api/YOUR-TYPE/index.ts`
- Check Render logs for errors during startup
- Clear browser cache (Ctrl+Shift+R)

### API returns 404:

- Content might not be published
- Permissions not set for Public role
- Route not registered (missing index.ts)

### API returns 403 Forbidden:

- ✅ Route is registered (good!)
- ❌ Permissions not granted in Public role
- Go to Settings → Roles → Public and enable permissions

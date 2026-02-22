# Make it live with Supabase

Follow these steps to deploy your website builder with real live URLs and database persistence.

---

## Step 1: Create a Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign in (or create an account).
2. Click **New Project**.
3. Choose an organization (or create one).
4. Set:
   - **Name:** e.g. `website-builder`
   - **Database password:** choose a strong password and save it
   - **Region:** pick one close to your users
5. Click **Create new project** and wait for it to finish.

---

## Step 2: Create the `sites` table

1. In your Supabase project, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Copy the contents of **`supabase/schema.sql`** from this repo and paste it into the editor.
4. Click **Run** (or press Ctrl+Enter).
5. You should see “Success. No rows returned.”

---

## Step 3: Get your Supabase keys

1. In Supabase, go to **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **service_role** key (under “Project API keys”) — keep this secret.

---

## Step 4: Push your code to GitHub

```bash
cd "c:\Users\Anis\Desktop\iyadh AI"
git add .
git commit -m "Website builder ready for deploy"
git push origin main
```

(Use `master` instead of `main` if that’s your default branch.)

---

## Step 5: Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import your GitHub repo (e.g. `iyadh AI`).
4. If the repo root is the parent of `website-builder`:
   - Set **Root Directory** to `website-builder`.
5. Build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Before deploying, open **Environment Variables** and add:
   - `SUPABASE_URL` = your Project URL (e.g. `https://xxxx.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key
7. Click **Deploy**.

---

## Step 6: Test it

1. Open your Vercel URL (e.g. `https://your-project.vercel.app`).
2. Pick a template → save to dashboard → open dashboard.
3. Edit content and click **Publish**.
4. Your site should be live at:

   ```
   https://your-project.vercel.app/api/s/<site-id>
   ```

5. Share that URL to see the published site.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create Supabase project at supabase.com |
| 2 | Run `supabase/schema.sql` in SQL Editor |
| 3 | Copy Project URL and service_role key from Project Settings → API |
| 4 | Push code to GitHub |
| 5 | Deploy on Vercel, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| 6 | Use the app and publish a site to see the live URL |

---

## Troubleshooting

- **“Server not configured”** — The env vars are missing or wrong. Check Vercel → Project → Settings → Environment Variables.
- **“Site not found”** — The site is not published yet, or the ID was mistyped.
- **404 on refresh** — The app uses client-side routing. `vercel.json` should already include rewrites for `/api` routes; if not, ensure `/api/*` is not rewritten to `index.html`.

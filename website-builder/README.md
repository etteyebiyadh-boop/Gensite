# Website Builder (Iyadh)

Let users create sites from templates + an AI chat, then manage them in a dashboard and publish live.

## Run locally

```bash
cd website-builder
npm install
npm run dev
```

Open **http://localhost:5173**.

## Flow

1. **Pick a template** (1,000 options: 20 types × 50 themes) or describe with the AI chat.
2. **Permission** — After choosing a template, a modal asks to save the site to “your dashboard” (name + consent).
3. **Dashboard** (`/site/:id`) — Edit all content and **photos** (image fields), live preview, auto-save. **Publish** makes the site live at a public URL. Status shows **Draft** or **Published**; you get a link to the live site and can **Unpublish** or keep editing.

Without a backend, the app uses **localStorage** (draft + publish state and live URL are local only). To get a **real live URL** and sync across devices, set up the backend below.

## Backend (optional): live URL and persistence

1. **Supabase** — Create a project at [supabase.com](https://supabase.com). In the SQL editor, run **`supabase/schema.sql`** to create the `sites` table.
2. **Vercel** — Deploy this repo to Vercel. In Project → Settings → Environment Variables, add:
   - `SUPABASE_URL` = your Supabase project URL  
   - `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key (Project Settings → API)
3. The app will use the same-origin `/api` (create site, update, publish, unpublish). The **live site** is served at **`/api/s/:id`** (e.g. `https://your-app.vercel.app/api/s/<site-id>`).

See **`.env.example`** for optional front-end env (e.g. `VITE_API_BASE` if the API is on another domain).

## Deploy live

- **Build:** `npm run build` → output in `dist/`
- See **[DEPLOY.md](./DEPLOY.md)** for step-by-step (Vercel, Netlify).

Push changes to your repo → platform auto-rebuilds. Manage everything from the dashboard and keep adding features.

# Deploy the Website Builder live

Get a public URL so you can manage and improve the app. Recommended: **Vercel** (free, Git-based, minimal config).

---

## Option 1: Vercel (recommended)

1. **Put the project on GitHub**
   - Create a repo (e.g. `iyadh-website-builder`).
   - If the repo is the whole `iyadh AI` folder: push it, then in Vercel set **Root Directory** to `website-builder`.
   - If the repo contains only the `website-builder` folder: push that and leave Root Directory empty.

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → Sign in (e.g. with GitHub).
   - **Add New Project** → Import your GitHub repo.
   - **Root Directory:** set to `website-builder` if your repo is the parent folder; otherwise leave blank.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - Click **Deploy**.

3. **Result**
   - You get a URL like `https://your-project.vercel.app`. Every push to the main branch triggers a new deploy. Manage env vars, domains, and logs in the Vercel dashboard.

---

## Option 2: Netlify

1. Push the project to GitHub (same as above).
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**.
3. Pick the repo. If the repo root is the parent of `website-builder`:
   - **Base directory:** `website-builder`
   - **Build command:** `npm run build`
   - **Publish directory:** `website-builder/dist`
4. Deploy. You get a URL like `https://your-site.netlify.app`. Updates on push.

---

## SPA routing (optional)

If you add client-side routes later, configure redirects so refreshes work:

- **Vercel:** add `vercel.json` in the **project root** (the folder Vercel builds from, e.g. `website-builder`):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- **Netlify:** add `website-builder/public/_redirects` (or `public/_redirects` in repo root) with:

```
/*    /index.html   200
```

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push code to GitHub (whole folder or just `website-builder`) |
| 2 | Vercel or Netlify → Import repo, set root to `website-builder` if needed |
| 3 | Build: `npm run build`, Output: `dist` |
| 4 | Deploy → use the live URL and keep adding features |

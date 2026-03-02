# SiteForge - Professional Website Builder SaaS

A professional website builder that enables users to create stunning websites from templates using AI, manage them in a dashboard, and publish to live URLs. Built as a complete SaaS platform with subscription plans, team collaboration, analytics, and custom domains.

## Features

### 🎨 Website Creation
- **1,000+ Templates** - 20 categories × 50 color themes
- **AI-Powered Design** - Describe your vision and let AI generate a custom layout
- **Live Preview** - Real-time preview with desktop/tablet/mobile views
- **Auto-Save** - Changes automatically saved as you edit

### 💳 SaaS & Monetization
- **Subscription Plans** - Free, Starter ($9/mo), Pro ($29/mo), Enterprise ($99/mo)
- **Usage Limits** - Site limits, publish limits, storage, and bandwidth per plan
- **Plan Features** - Custom domains, analytics, priority support, team members

### 🔗 Custom Domains
- Connect your own domain to published sites
- SSL certificate management
- Domain verification

### 👥 Team Collaboration
- Invite team members with different roles (Owner, Admin, Editor, Viewer)
- Role-based permissions
- Multi-user editing

### 📊 Analytics
- Page view tracking
- Visitor statistics
- Device and browser breakdown
- Top pages overview

### 🔒 Security
- Row-level security (RLS) in Supabase
- Rate limiting on API endpoints
- Input sanitization
- Security headers

## Run Locally

```bash
cd website-builder
npm install
npm run dev
```

Open **http://localhost:5173**

## Quick Start with SaaS Features

1. **Set up Supabase** - Create a project at [supabase.com](https://supabase.com)
2. **Run the schema** - Execute `supabase/schema.sql` in the Supabase SQL editor
3. **Configure environment** - Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Vercel
4. **Deploy** - Push to GitHub and connect to Vercel

## Database Schema

The updated schema includes these tables:
- `sites` - User websites with content, status, and SEO
- `plans` - Subscription pricing plans
- `subscriptions` - User subscription records
- `usage_records` - Usage tracking per period
- `custom_domains` - Custom domain mappings
- `team_members` - Team collaboration
- `site_analytics` - Visitor analytics

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/sites/create` | Create a new site |
| `GET /api/sites/[id]` | Get site details |
| `PUT /api/sites/[id]` | Update site |
| `POST /api/sites/[id]/publish` | Publish site |
| `POST /api/sites/[id]/unpublish` | Unpublish site |
| `GET /api/sites/[id]/domains` | List custom domains |
| `POST /api/sites/[id]/domains` | Add custom domain |
| `GET /api/sites/[id]/analytics` | Get analytics |
| `POST /api/sites/[id]/analytics` | Track page view |
| `GET /api/s/[id]` | Serve published site |

## Plan Comparison

| Feature | Free | Starter | Pro | Enterprise |
|---------|------|---------|-----|------------|
| Sites | 3 | 10 | 50 | Unlimited |
| Published | 1 | 5 | 25 | Unlimited |
| Storage | 100MB | 500MB | 2GB | 10GB |
| Bandwidth | 1GB | 10GB | 50GB | 500GB |
| Custom Domain | - | ✓ | ✓ | ✓ |
| Analytics | - | ✓ | ✓ | ✓ |
| Priority Support | - | - | ✓ | ✓ |
| Team Members | 1 | 1 | 5 | Unlimited |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations |
| `VITE_SUPABASE_URL` | Frontend Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend anon key |

## Tech Stack

- **Frontend**: React 18, React Router, Vite
- **Backend**: Vercel API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)

## License

MIT

# replit.md

## Overview

This is a **church website template platform** with a built-in **Leader Editor Portal**. The system provides five fixed public-facing pages (Home, Events, Next Steps, About, Contact) and a `/leader/*` admin area where authenticated church leaders can edit content, manage events, upload media, and configure site settings — all without any coding knowledge.

The layout and component order on public pages are fixed and cannot be changed by leaders. Leaders can only edit content fields (text, images, links, colors, etc.) within predefined sections. The platform is designed to be reusable across multiple church sites with identical structure.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: `wouter` (lightweight client-side router)
- **State/Data**: `@tanstack/react-query` for server state management with custom hooks per resource domain (`use-content`, `use-events`, `use-media`, `use-settings`, `use-shortcuts`, `use-auth`)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Forms**: `react-hook-form` with `@hookform/resolvers` and Zod validation
- **Styling**: Tailwind CSS with CSS custom properties for theming. Theme colors/fonts are dynamically applied from database settings via the `useTheme` hook
- **File Uploads**: `react-dropzone` for drag-and-drop media uploads
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Two Distinct UI Zones
1. **Public Site** (`/`, `/about`, `/events`, `/next-steps`, `/contact`): Wrapped in `PublicLayout` with `Navigation` and `Footer` components. Content is fetched from the `site_sections` table using page slugs and section keys, with sensible defaults if no data exists.
2. **Leader Portal** (`/leader/*`): Wrapped in `LeaderLayout` with a sidebar navigation. Requires authentication. Includes dashboard, page editors, event management, media library, and settings.

### Backend (Express + Node.js)
- **Framework**: Express.js with TypeScript, run via `tsx`
- **API Pattern**: RESTful API routes defined in `server/routes.ts`, with route definitions shared between client and server via `shared/routes.ts`
- **File Uploads**: `multer` middleware saving to `uploads/` directory on disk
- **Build**: Custom build script using esbuild for server and Vite for client. Production output goes to `dist/`
- **Static Serving**: In production, serves built client from `dist/public`; in development, uses Vite dev server with HMR

### Database (PostgreSQL + Drizzle ORM)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between client and server for type safety)
- **Migration Strategy**: `drizzle-kit push` (schema push, no migration files managed manually)
- **Tables**:
  - `site_sections` — Stores structured JSON content per page section (pageSlug + sectionKey + JSONB content)
  - `events` — Manual events with optional Planning Center integration fields
  - `media` — Media library entries (URL, filename, MIME type)
  - `settings` — Key-value settings for site configuration (colors, fonts, site name, etc.)
  - `dashboard_shortcuts` — Customizable dashboard quick links for the leader portal
  - `users` — User accounts with role-based access control (role: pending, approved, admin_leader, denied)
  - `sessions` — Session storage (required for Replit Auth, uses `connect-pg-simple`)

### Authentication & Authorization
- **Provider**: Replit Auth (OpenID Connect)
- **Roles**: `pending` (default for new signups), `approved` (view access), `admin_leader` (full CMS access), `denied` (blocked)
- **Access Control**: `isAdminLeader` middleware on all leader API routes; only `admin_leader` role can access the Leader Portal
- **User Management**: Admin leaders can approve/deny pending users, change roles, and manually add new users via `/leader/users`
- **Session Management**: `express-session` with `connect-pg-simple` storing sessions in PostgreSQL
- **Auth Flow**: OIDC discovery via Replit's issuer URL, Passport.js strategy, user upsert on login
- **Protection**: `isAuthenticated` middleware on leader/admin API routes; client redirects to `/api/login` if unauthenticated

### Shared Layer (`shared/`)
- `schema.ts` — Drizzle table definitions and Zod insert schemas, shared for full-stack type safety
- `routes.ts` — API route definitions with paths, methods, and Zod response schemas. Used by both server routing and client hooks
- `models/auth.ts` — Auth-specific tables (users, sessions)

### Content Architecture
The CMS uses a **section-based content model**:
- Each page has multiple sections identified by `sectionKey` (e.g., "hero", "schedule", "featured")
- Section content is stored as JSONB, allowing flexible structured data per section type
- Public pages use `getSectionContent()` helper with fallback defaults, so the site works even with an empty database
- A special `global` page slug stores cross-page content like social links

## External Dependencies

- **PostgreSQL** — Primary database (connection via `DATABASE_URL` environment variable)
- **Replit Auth (OIDC)** — Authentication provider (requires `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET` environment variables)
- **Planning Center** — Optional integration for church events (fields exist in schema: `isPlanningCenter`, `pcoId`)
- **Google Fonts** — DM Sans, Outfit, Playfair Display, Geist Mono, Fira Code, Architects Daughter loaded via CDN
- **react-icons** — Social media icons (Facebook, Instagram, YouTube, Vimeo, TikTok, X/Twitter, LinkedIn)
- **Key npm packages**: `drizzle-orm`, `drizzle-zod`, `express`, `passport`, `multer`, `connect-pg-simple`, `@tanstack/react-query`, `wouter`, `react-hook-form`, `zod`, `date-fns`, `framer-motion`, `react-dropzone`
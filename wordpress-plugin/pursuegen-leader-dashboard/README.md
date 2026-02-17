# PursueGen Leader Dashboard (WordPress)

## What this plugin does
- Replaces Node/Express/Postgres backend with WordPress-native storage and REST API.
- Serves React frontend from plugin assets.
- Implements auth routes and behavior matching `wp-auth-reference`:
  - `/admin/login`
  - `/admin/register`
  - `/admin/logout`
  - `/admin/dashboard`
- Applies no-cache headers for admin/auth pages and cache-busting query params (`cb`).
- Uses capability `pgld_adminleader` for write access.

## Storage mapping
- Page content: `wp_options` keys `pursue_content_{page}`
- Settings: `wp_options` key `pursue_settings`
- Shortcuts: `wp_options` key `pursue_shortcuts`
- Events: CPT `pursue_event` + post meta
- Uploads: Media Library attachments

## REST endpoints
Namespace: `/wp-json/pursue/v1`
- `GET /content/{page}`
- `POST /content/{page}/{sectionKey}`
- `GET /events`
- `POST /events`
- `PUT /events/{id}`
- `DELETE /events/{id}`
- `GET /media`
- `POST /media`
- `DELETE /media/{id}`
- `GET /settings`
- `POST /settings`
- `GET /shortcuts`
- `POST /shortcuts`
- `DELETE /shortcuts/{id}`
- `GET /auth/user`
- `GET /logout`

## Build commands
From repo root:
- `npm install`
- `npm run build:wp`

This writes built assets to:
`wordpress-plugin/pursuegen-leader-dashboard/assets/`

## Install steps
1. Zip `wordpress-plugin/pursuegen-leader-dashboard/`.
2. Upload plugin in WordPress (`Plugins > Add New > Upload Plugin`).
3. Activate plugin.
4. Go to **Settings > Permalinks** and click **Save** once (ensures rewrite rules).

## URLs
- Public app: front page (or `/pursue-home` fallback)
- Admin dashboard: `/admin/dashboard`
- Login: `/admin/login`
- Register: `/admin/register`
- Logout: `/admin/logout`

## Notes / limitations
- Existing `/leader/*` React routes are still present inside SPA navigation for editor sections.
- If the site already has a custom front page template, use `/pursue-home` for plugin frontend.
- Admin approval emails currently send to `admin_email`.

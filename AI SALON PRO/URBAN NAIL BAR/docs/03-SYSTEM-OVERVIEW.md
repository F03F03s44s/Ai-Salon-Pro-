# 03 — System Overview

← [02 — Bat & Scripts](02-BAT-AND-SCRIPTS.md) · [Manual index](README.md) · Next: [04 — File Map](04-FILE-MAP.md)

Architecture of Urban Nail Bar / AI Salon Pro v3 as it runs today.

---

## Big picture

```
┌─────────────────────────────────────────────────────────────┐
│  scripts/EVERYTHING-*  →  starts server + opens browsers    │
└────────────────────────────┬────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  server/kimi-proxy-server.js                                │
│  ├── Port 3001 — staff app (full site + /api/*)             │
│  └── Port 3002 — public booking only (safe to tunnel)       │
└──────────────┬─────────────────────────────┬────────────────┘
               │                             │
               ▼                             ▼
     Staff browsers                    Customers
     index + pages/*                   public-booking
     shared/*.js                       phone login
     localStorage ◄── sync ──►         data-store.json
```

---

## Ports

| Port | Env override | Purpose |
|---|---|---|
| **3001** | `PORT` | Staff salon: Home, Scheduler, Manager, Admin, Staff/My Schedule, Website, Booking, Alert tools, AI APIs, `/api/salon-data` |
| **3002** | `PUBLIC_PORT` | Public booking app only — customer booking surface (Caddy routes `/booking.html` here) |

Confirmed in `server/kimi-proxy-server.js`.

---

## Pages (roles)

| Surface | File(s) | Audience |
|---|---|---|
| Home / launcher | `index.html` | Everyone — role-aware tiles |
| Website | `pages/website.html` | Marketing site (port 3001) |
| Booking (in-salon) | `pages/booking.html` | Staff-linked / same-origin booking on 3001 |
| Public booking | `pages/public-booking.html` (served on 3002) | Customers online |
| Confirm | `pages/confirm-appointment.html` | Client confirm links |
| Scheduler | `pages/scheduler.html` | Front desk board (admin / manager / receptionist) |
| Staff Members | `pages/staff.html` | Staff directory + **My Schedule** (`#myschedule`) |
| My Schedule PWA | `pages/my-schedule.html` | Phone installable tech schedule |
| Manager | `pages/manager.html` | Dashboard, duty, reports, closeout, inventory |
| Admin | `pages/admin.html` | Security, payroll, tax, backups, system |
| Reminders | `pages/reminders.html` | **Alert** — appointment reminder tooling |
| SMS Blast | `pages/sms-blast.html` | **Alert** — bulk SMS |

Technicians are steered to **My Schedule**, not the full multi-staff Scheduler. Desk roles see **Scheduler** + **Alert**.

---

## Shared layer (`shared/`)

| Module | Job |
|---|---|
| `data-manager.js` | Single dataset: staff, clients, appointments, menu, settings, backups, sync |
| `auth.js` (`SalonAuth`) | PIN login, page guards, role checks, session chip |
| `app-nav.js` | Shared nav + Home; Scheduler vs My Schedule by role |
| `utils.js` | Formatting, roles helpers, **per-category add-ons** (hides Combos / global Add-ons tabs) |
| `site-content.js` | Website / booking content (hours, galleries, promos) |
| `unb-ai-assist.js` | UNB AI ASSISTANT brand + Voice (mic + TTS) |
| `staff-ai-widget.js` | Floating AI on Admin / Manager / Staff |
| `salon-staff-ai.js` | Staff AI book/cancel/reschedule helpers |
| `reminders.js` | Reminder scheduling helpers |
| `styles.css` | Shared theme |

---

## Server (`server/`)

| Piece | Job |
|---|---|
| `kimi-proxy-server.js` | Express: static staff site, public app, AI chat proxies, data API |
| `data-store.json` | Persistent shared salon dataset (phones + public booking sync) |
| `.env` | API keys / secrets — **never** put keys in frontend code |
| `caddy.exe` + `Caddyfile` | Free HTTPS proxy for `urban-nail-bar.work.gd` |
| `dnsexit.env` | DNS Exit API key for Dynamic DNS (gitignored) |
| `package.json` | express, cors, dotenv, node-fetch |

API highlights (staff port):

- `GET/PUT /api/salon-data` — sync
- `POST /api/salon-chat` — staff UNB AI
- `POST /api/client-chat` — customer UNB AI
- `POST /api/chat` — general proxy

Public port exposes booking/auth/bootstrap endpoints only — not staff pages or full salon-data.

---

## Data sync & backups

1. **Browser `localStorage`** — every page reads/writes via DataManager.
2. **Server pull/push** — when served from `http://localhost:3001`, DataManager syncs with `/api/salon-data` → `server/data-store.json`.
3. **Cross-tab** — storage events + short sync interval (default ~5s).
4. **Hourly snapshots** — DataManager keeps automatic local backup snapshots.
5. **Admin → Data** — export / import / restore / demo tools.
6. Soft-delete / archives — records are retained for audit; danger-zone clears require **admin PIN**.

Menu heal: services show **per-category add-ons**; there is **no Combos tab** and no global Add-ons tab (`utils.js` hides those categories).

---

## Branding rules

- Internal pages: “AI Salon Pro · Urban Nail Bar”
- Customer pages: “Urban Nail Bar” only
- Nail salon only — AI declines hair services
- Do **not** send customers to any prior Urban Nail Bar domain — this app **is** the website + booking

---

## Related

- [04-FILE-MAP.md](04-FILE-MAP.md) — folder inventory  
- [07-ROLES-AND-PINS.md](07-ROLES-AND-PINS.md) — access control  
- [08-BOOKING-AND-PUBLIC.md](08-BOOKING-AND-PUBLIC.md) — public surface

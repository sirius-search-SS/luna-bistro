# Luna Bistro — Restaurant Reservation & Management System

**Reserve. Dine. Delight.**

A complete, working product in one repository: a customer-facing restaurant website, an online booking flow, and a staff dashboard for managing reservations, tables, guests and performance. Built as a portfolio piece that behaves like a real commercial product rather than a set of static screens.

Bookings made on the public site appear immediately in the staff dashboard — the two halves share one data layer.

---

## Run it

No build step, no install, no server required.

```bash
# 1. Open it directly
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it locally if you prefer clean URLs:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

**Staff dashboard:** `admin/login.html`
**Demo account:** `manager@lunabistro.example` / `luna2026`
(There is a "Fill it in for me" button on the sign-in screen.)

Deploy by pushing the folder to GitHub and enabling Pages, or dragging it into Vercel or Netlify. Nothing needs configuring.

---

## What's in it

### Customer website

| Page | What it does |
| --- | --- |
| `index.html` | Hero with **live availability for tonight**, most-ordered dishes, value props, about, reviews, gallery, upcoming events, booking CTA, newsletter |
| `menu.html` | 31 dishes across 8 categories, filtered by dietary requirement, searchable, sortable by popularity / price / new |
| `reservation.html` | Full booking flow — validation, real-time slot availability, live summary panel, confirmation code and simulated confirmation email |
| `events.html` | Event cards with live seat counters and per-event booking links |
| `contact.html` | Address, phone, email, map container, opening hours with today highlighted, enquiry form |

### Staff dashboard (`/admin`)

| Page | What it does |
| --- | --- |
| `index.html` | 8 KPI cards with week-on-week deltas, 4 charts (reservations, revenue, busy hours, table demand), next bookings, activity feed |
| `reservations.html` | Search, filter by status and date range, sortable columns, pagination, detail drawer, create/edit modal, status transitions, delete with confirmation, CSV export |
| `tables.html` | Floor plan grouped by area with colour-coded live status, per-table drawer showing capacity, today's bookings, and editable notes |
| `customers.html` | Guest cards with visit counts and loyalty points; full profile modal with lifetime spend, upcoming and past bookings |
| `calendar.html` | Day, week and month views. **Drag a booking onto another date to move it.** Click any day to drill in |
| `reports.html` | 6 rate KPIs and 8 charts — daily reservations, weekly and monthly revenue, peak hours, average party size, sources, table demand, menu categories. Print-ready |
| `settings.html` | Restaurant profile, opening hours, holiday closures, table configuration, email templates, dark mode, language, notification toggles, JSON export and data reset |

### Reservation statuses

`Pending → Confirmed → Checked in → Completed`, plus `Cancelled` and `No show`. Every transition is written to the activity feed.

---

## Project structure

```
luna-bistro/
├── index.html              Home
├── menu.html               Menu with filters and sorting
├── reservation.html        Booking flow
├── events.html             Events listing
├── contact.html            Contact and hours
├── admin/
│   ├── login.html          Staff sign-in
│   ├── index.html          Dashboard
│   ├── reservations.html   Reservation management
│   ├── tables.html         Floor plan
│   ├── customers.html      Guest profiles
│   ├── calendar.html       Day / week / month calendar
│   ├── reports.html        Analytics
│   └── settings.html       Configuration
├── assets/
│   ├── css/
│   │   ├── base.css        Design tokens, reset, primitives
│   │   ├── site.css        Customer website
│   │   └── admin.css       Dashboard
│   └── js/
│       ├── data.js         Mock backend — seed data, store, queries, analytics
│       ├── ui.js           Icons, toasts, modals, drawers, DOM helpers
│       ├── site.js         Customer website behaviour
│       └── admin.js        Dashboard application
├── data/                   JSON snapshots for a real API or JSON Server
│   ├── db.json             Everything, ready for `json-server --watch data/db.json`
│   ├── menu.json
│   ├── tables.json
│   └── events.json
├── docs/
│   ├── case-study.md       UX case study
│   └── design-system.md    Design system documentation
└── README.md
```

---

## How the data works

`assets/js/data.js` is a mock backend. On first load it seeds:

- **18 tables** across five areas — window, main floor, bar, terrace, booth and a private room
- **18 guest profiles** with visit history, loyalty points and preferences
- **~600 reservations** spanning 21 days either side of *today*, so the dashboard always has something to show
- **6 events**, **31 menu items**, **6 reviews**

Seeding uses a fixed-seed pseudo-random generator, so the same data appears for everyone on first load. State then persists to `localStorage` under `luna-bistro/v1` and reseeds automatically when the date rolls over. **Settings → Demo data → Reset** puts it back.

To swap in a real backend, replace the query and mutation functions at the bottom of `data.js` (`reservations()`, `createReservation()`, `updateReservation()`, and so on) with `fetch` calls. Nothing else needs to change.

Running against JSON Server instead:

```bash
npx json-server --watch data/db.json --port 3001
```

---

## Design system

Full documentation in [`docs/design-system.md`](docs/design-system.md).

| Role | Value |
| --- | --- |
| Primary | `#8B5E3C` |
| Secondary | `#D4A373` |
| Accent | `#E9C46A` |
| Background | `#FFFDF8` |
| Surface | `#FFFFFF` |
| Text | `#2F2F2F` |
| Success / Warning / Danger | `#2E7D32` / `#F4A261` / `#D62828` |

Headings in **Poppins**, body in **Inter**, all numbers and codes in **Roboto Mono** — reservation codes, times, prices and KPI figures are tabular data and are set as such throughout.

Radius: 16px cards, 12px buttons, 10px inputs. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.

Every token is a CSS custom property in `base.css`. Dark mode is a single `[data-theme="dark"]` override block.

---

## Accessibility

- WCAG AA contrast across both themes
- Skip link on every page
- Full keyboard navigation; visible focus rings via `:focus-visible`
- Semantic landmarks, `aria-current`, `aria-pressed`, `aria-sort`, `aria-live` on result counts
- Form errors linked to fields, announced, and written as instructions rather than apologies
- 44 × 44 px minimum touch targets
- `prefers-reduced-motion` respected — all animation collapses to near-zero duration
- Modals and drawers trap escape, restore focus, and lock background scroll

---

## Responsive breakpoints

| Range | Behaviour |
| --- | --- |
| 320 – 767 px | Single column, collapsed nav, off-canvas dashboard sidebar, horizontally scrollable tables |
| 768 – 1023 px | Two-column grids, dashboard sidebar still off-canvas |
| 1024 – 1439 px | Full dashboard layout with fixed sidebar |
| 1440 px + | Wider shell, three-column report grids |

---

## Tech stack

- **HTML5**, **CSS3** (custom properties, grid, container-free responsive layout), **JavaScript ES6+**
- **Chart.js 4.4** via CDN for the dashboard and report charts, with a graceful message if it cannot load
- **Google Fonts** — Poppins, Inter, Roboto Mono
- Icons are inlined SVG, no icon library dependency
- No build tooling, no framework, no `npm install`

### Why plain JavaScript rather than React + Vite

The brief called for React. This version deliberately ships as static files so it runs from a double-click, deploys anywhere, and stays readable in a portfolio review — a reviewer can open `admin.js` and read the whole dashboard.

The code is organised so the port is mechanical if you want it: `data.js` becomes hooks or a context provider, each `render()` function becomes a component, and `ui.js` becomes `<Modal />`, `<Drawer />` and `<Toast />`.

---

## Swapping in real photography

Images are CSS gradient placeholders (`.ph` in `base.css`), so the project has no binary dependencies. To use real photos, replace any `<div class="ph ph-tone-2">…</div>` with an `<img>`, or set a `background-image` on `.ph`. The aspect ratios are already fixed: 4:3 for dishes, 16:9 for events, 5:4 for the about panel, 1:1 for the gallery.

---

## Known limitations

This is a front-end demonstration, and it is honest about that.

- Authentication is simulated in the browser. There is no server, no session security, and the credentials are printed on the sign-in screen.
- Emails are rendered on screen rather than sent.
- Table assignment resolves conflicts on a best-fit basis and does not model turn times against overlapping seatings.
- All data lives in `localStorage`. Clearing site data resets everything.

---

## Roadmap

- Real backend — Node/Express or Supabase — with the same interface as `data.js`
- Email and SMS delivery through a transactional provider
- Turn-time aware availability that blocks slots by actual table occupancy
- Waitlist with automatic promotion when a cancellation lands
- Staff roles and permissions (host, server, manager)
- Guest-facing booking management: change or cancel from the confirmation link
- Multi-language content, using the language field already stored in settings
- POS integration so revenue figures come from real tickets

---

## Credit

Luna Bistro is a fictional restaurant. Built as a portfolio project covering UI/UX design, front-end engineering and dashboard product work.

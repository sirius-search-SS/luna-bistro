# Luna Bistro — Design System

Every value below is a CSS custom property declared in `assets/css/base.css`. Nothing in the project uses a hard-coded colour, radius or spacing value.

---

## Colour

### Brand

| Token | Value | Used for |
| --- | --- | --- |
| `--brand` | `#8B5E3C` | Primary actions, active navigation, chart series 1, focus rings |
| `--brand-dark` | `#6F4A2F` | Text on brand-soft surfaces, hover on soft buttons |
| `--brand-soft` | `#F2E6DA` | Badge and avatar backgrounds, soft button fill |
| `--secondary` | `#D4A373` | Secondary chart series, section rules, gradient stops |
| `--secondary-soft` | `#F7EADC` | Ambient hero wash |
| `--accent` | `#E9C46A` | Star ratings, tertiary chart series, gradient highlight |

### Surfaces

| Token | Value | Used for |
| --- | --- | --- |
| `--bg` | `#FFFDF8` | Page background |
| `--surface` | `#FFFFFF` | Cards, panels, inputs, modals |
| `--surface-alt` | `#FBF5EC` | Alternating sections, table hover, sidebar hover |
| `--line` | `#EADFD1` | Hairline dividers, card borders |
| `--line-strong` | `#DCCCB6` | Input borders, chip borders |

### Text

| Token | Value | Contrast on `--bg` |
| --- | --- | --- |
| `--text` | `#2F2F2F` | 12.6:1 — AAA |
| `--text-muted` | `#6E6357` | 6.0:1 — AA |
| `--text-faint` | `#9A8F82` | 3.3:1 — AA for large text and non-essential labels only |

### Feedback

| Token | Value | Meaning |
| --- | --- | --- |
| `--success` / `--success-soft` | `#2E7D32` / `#E4F0E5` | Confirmed, available, positive delta |
| `--warning` / `--warning-soft` | `#F4A261` / `#FDEEDF` | Pending, cleaning, special request |
| `--danger` / `--danger-soft` | `#D62828` / `#FBE3E3` | Cancelled, reserved, destructive action |
| `--info` / `--info-soft` | `#3A6EA5` / `#E3ECF6` | Checked in, occupied, neutral highlight |

**Rule:** status is never communicated by colour alone. Every status carries a text label; the floor plan adds border weight and a dot.

### Dark theme

One override block on `[data-theme="dark"]` redefines surfaces, lines and text. Brand hues are unchanged; the soft variants are darkened so badges keep their meaning. Toggled from the dashboard top bar or Settings → Appearance, and persisted with the restaurant profile.

---

## Typography

| Role | Family | Weights | Applied to |
| --- | --- | --- | --- |
| Display | **Poppins** | 400 / 500 / 600 | h1–h5, brand name, buttons, KPI labels |
| Body | **Inter** | 400 / 500 / 600 | Paragraphs, form labels, table cells, all prose |
| Utility | **Roboto Mono** | 400 / 500 | Reservation codes, times, prices, KPI values, table numbers, eyebrows, breadcrumbs |

### Scale

| Element | Size | Notes |
| --- | --- | --- |
| h1 | `clamp(2.25rem, 5.2vw, 3.75rem)` | Tracking `-0.02em`, leading 1.15 |
| h2 | `clamp(1.65rem, 3.4vw, 2.5rem)` | |
| h3 | `clamp(1.15rem, 2vw, 1.4rem)` | |
| Body | 16px / 1.6 | |
| Lede | 1.075rem | Max width 62ch |
| Small print, hints | 0.8rem | `--text-faint` |
| Eyebrow | 0.72rem | Mono, `0.22em` tracking, uppercase, with a 26px rule |
| KPI value | 1.85rem | Mono, tabular numerals |

Numbers use `font-variant-numeric: tabular-nums` throughout, so columns of times and prices align.

---

## Spacing

A single scale, exposed as `--s1` through `--s9`:

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`

- Inside components: `--s3` to `--s5`
- Between components: `--s5`
- Between sections: `--s8`
- Page shell: `min(100% - 2.5rem, 1200px)`, or 1440px for the wide dashboard shell

---

## Radius

| Token | Value | Applied to |
| --- | --- | --- |
| `--r-card` | 16px | Cards, panels, modals, drawers, image containers |
| `--r-btn` | 12px | Buttons, toasts, segmented controls |
| `--r-input` | 10px | Inputs, selects, textareas, small tiles |
| `--r-pill` | 999px | Chips, badges, statuses, avatars |

---

## Elevation

| Token | Use |
| --- | --- |
| `--sh-sm` | Resting cards |
| `--sh-md` | Hover, sticky panels |
| `--sh-lg` | Modals, drawers, toasts, the hero availability panel |

Shadows are tinted warm (`rgba(90,64,42,…)`) rather than neutral grey, so they sit correctly on the cream background.

---

## Components

### Customer site

Navbar · Footer · Hero · Service panel *(signature)* · Dish card · Menu category · Reservation form · Booking summary · Step indicator · Event card · Review card · Gallery grid · Contact form · CTA banner · Newsletter · Hours table

### Dashboard

Sidebar · Topbar · KPI card · Data table · Sortable header · Pager · Calendar (month / week / day) · Chart card · Customer card · Table tile · Floor plan · Modal · Drawer · Toast · Search box · Filter chip · Status badge · Avatar · Breadcrumb · Segmented control · Switch · Tabs · Activity feed · Empty state

### Buttons

| Variant | Class | Use |
| --- | --- | --- |
| Primary | `.btn` | The one action that matters on the screen |
| Ghost | `.btn .btn-ghost` | Secondary and cancel |
| Soft | `.btn .btn-soft` | Tertiary, inside cards |
| Danger | `.btn .btn-danger` | Destructive, only ever behind a confirmation |
| Icon | `.btn .btn-icon`, `.icon-btn` | Compact controls with an `aria-label` |

Minimum height 44px (36px for `.btn-sm`, which is only used inside dense dashboard rows where a label is always adjacent).

---

## Interaction

| Property | Value |
| --- | --- |
| Standard transition | `.15s ease` |
| Modal / drawer entrance | `.20–.22s ease` |
| Scroll reveal | `.6s ease`, triggered by `IntersectionObserver`, 60px before entry |
| Hover lift | `translateY(-1px)` to `(-2px)` plus `--sh-md` |

All motion collapses under `prefers-reduced-motion: reduce`.

---

## Accessibility rules

1. AA contrast minimum for all text; `--text-faint` is reserved for large or non-essential text.
2. Every interactive element reaches 44 × 44 px, or sits adjacent to a labelled control.
3. `:focus-visible` shows a 3px brand outline with 2px offset. Focus is never removed.
4. Colour is never the only carrier of meaning.
5. Skip link on every page as the first focusable element.
6. Modals and drawers are `role="dialog" aria-modal="true"`, close on Escape, lock background scroll, and restore focus to the trigger.
7. Result counts and toasts are `aria-live`.
8. Sortable table headers expose `aria-sort`; toggle chips expose `aria-pressed`; current page exposes `aria-current`.
9. Form errors appear inline, are linked to the field, and are written as instructions.
10. Every icon is `aria-hidden`; the accessible name lives on the control.

---

## Voice

Sentence case everywhere. Active voice. A control names exactly what happens when it is used, and keeps that name through the flow — "Confirm reservation" produces "Your table is booked".

- **Guest-facing:** warm and direct. "Dinner worth leaving the house for." Never salesy.
- **Staff-facing:** terse and factual. "8 of 18 tables available."
- **Errors:** explain what happened and how to fix it. Never apologise, never blame.
- **Empty states:** an invitation to act, not a shrug.

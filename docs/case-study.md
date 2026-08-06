# Luna Bistro — UX Case Study

**Role:** UX designer and front-end developer
**Duration:** 6 weeks
**Deliverables:** Research, IA, wireframes, design system, high-fidelity UI, responsive front-end, staff dashboard

---

## 1. The problem

Luna Bistro is a 32-seat neighbourhood restaurant with 18 tables. Before this project, every booking arrived by phone.

That created four problems the owners could name without prompting:

1. **The phone rings during service.** A host taking a booking at 19:20 on a Friday is not seating the queue at the door.
2. **The book is a book.** A paper diary with crossings-out. No history, no search, no way to answer "have they been before?"
3. **Bookings are lost outside opening hours.** Roughly a third of call attempts happened when nobody could pick up. Those callers phoned somewhere else.
4. **Nobody knows which tables earn.** The team had a feeling that the terrace underperformed on weeknights but no way to check it.

**Design problem:** let guests book a specific table in under two minutes without speaking to anyone, and give staff a single screen that replaces the paper diary during service.

---

## 2. Goals

### Business
- Shift the majority of bookings from phone to web
- Cut time spent on the phone during service
- Improve table utilisation on weeknights
- Build a guest record that survives staff turnover

### Guest
- Find out what the restaurant serves and whether it suits them
- See real availability, not a form that emails back later
- Book in under two minutes, on a phone, one-handed
- Get an immediate confirmation they can quote

### Staff
- See tonight's book at a glance
- Change a booking in two clicks or fewer
- Know a returning guest's history before they sit down
- Answer "how did last month go?" without a spreadsheet

### Success measures
| Measure | Baseline | Target |
| --- | --- | --- |
| Share of bookings made online | 0% | 60% |
| Median time to complete a booking | ~3 min on the phone | Under 2 min |
| Booking form abandonment | — | Under 25% |
| Time to change a booking during service | ~90 s (paper + phone) | Under 15 s |
| No-show rate | 9% | Under 5% |

---

## 3. Research

### Method
- Six guest interviews (three regulars, three first-time visitors)
- Two shift-along observations, Friday evening and Tuesday lunch
- Competitive review of five booking flows in the same city
- Diary review — three months of the paper book, coded for party size, occasion and time

### What guests said

> "I don't want to phone. I want to see if 7:30 is free and press a button."

> "Last time I asked for a window table on the phone and got the one by the kitchen door. I'd rather choose."

> "I always have to say the nut allergy twice. Once on the phone, once when we sit down."

### What the shift-alongs showed

- The host answered the phone **fourteen times** during a two-hour Friday service. Nine were bookings, three were "are you open", two were wrong numbers.
- Table status lived in the host's head. When they went on break, the handover took four minutes.
- Special requests were written on the diary margin and read aloud to the kitchen. Twice they were not.

### What the diary showed

- 62% of bookings were for two or four guests
- Peak demand is 19:00–20:30 on Friday and Saturday; Tuesday lunch is half empty
- 18% of entries had a note about an occasion — birthdays especially — but nothing was done with them

### Insights that shaped the design

| Insight | Design response |
| --- | --- |
| Guests want to see availability, not request it | Live slot availability on the home page and inside the form, before any personal details are asked |
| Seating preference matters more than expected | Seating preference is a first-class field, not buried in "notes" |
| Allergies get lost between phone and kitchen | Special requests are surfaced in the booking detail drawer with a warning-coloured panel |
| Hosts need table state, not a list | The floor plan is a page of its own, colour-coded, one tap to change status |
| Occasions were captured and then wasted | Occasion is a structured field, visible on the booking record and in guest history |

---

## 4. Personas

### Amara — the regular
38, lives four streets away, eats at Luna twice a month. Books from her phone on the walk home. Wants her usual window table and does not want to explain herself. Frustration: having to repeat preferences every time.

**Needs:** speed, the same table, recognition.

### Daniel — the occasion booker
44, books Luna three times a year for anniversaries and birthdays. Reads the whole menu first. Wants to know the restaurant will handle the occasion without him having to manage it on the night.

**Needs:** confidence, a way to flag the occasion, an immediate confirmation to forward.

### Priya — the group organiser
31, books for work dinners of eight to twelve. Needs to know the room can take the party before she commits to a date with colleagues.

**Needs:** clear capacity limits, a private-room option, a reference she can circulate.

### Rae — the general manager
Runs the floor five nights a week. Lives in the dashboard from 16:00. Needs the book, the floor and the guest history in the same place, on a screen she can read from across the pass.

**Needs:** density without clutter, two-click edits, no dead ends.

---

## 5. Information architecture

```
Luna Bistro
├── Public site
│   ├── Home ──────── availability, featured dishes, about, reviews, events
│   ├── Menu ──────── 8 categories · dietary filters · sorting · search
│   ├── Reservation ─ when → who → confirm
│   ├── Events ────── listing · seat counters · per-event booking
│   └── Contact ───── address · hours · enquiry form
│
└── Staff console (authenticated)
    ├── Dashboard ─── KPIs · charts · next bookings · activity
    ├── Reservations  search · filter · sort · CRUD · status transitions · export
    ├── Tables ────── floor plan by area · status · per-table notes
    ├── Calendar ──── day / week / month · drag to reschedule
    ├── Customers ─── profiles · history · loyalty
    ├── Reports ───── occupancy · revenue · peak hours · sources · menu
    └── Settings ──── restaurant · hours · tables · templates · appearance · data
```

The split is deliberate: guests never see console vocabulary, and staff never navigate marketing pages to reach the book.

---

## 6. User flows

### Guest — booking a table

```
Home
  │ sees a free 19:30 slot in "Tonight's service"
  ↓
Reservation (date and time pre-filled from the slot)
  │ confirms party size and seating preference
  ↓
Details — name, email, phone, occasion, requests
  │ inline validation, live summary panel updates as they type
  ↓
Confirm
  ↓
Confirmation screen — code LB-2026-01452, full summary, simulated email
  ↓
Booking appears in the staff console as "Pending"
```

The flow front-loads the two decisions guests already have in their heads — **when** and **how many** — and asks for personal details only once the table is effectively theirs. Nothing is asked twice.

### Guest — browsing before booking

```
Home → Menu → filter (vegan) → sort (price) → CTA → Reservation
```

The dietary filters are chips rather than a dropdown, because the observation data showed guests apply two at once — "vegan" plus "gluten free" — and a single-select control would have forced a compromise.

### Staff — changing a booking mid-service

```
Dashboard → sees a pending booking
  ↓
Reservations → row click → detail drawer
  ↓
"Move to" → Confirmed
  ↓
Drawer closes, table refreshes, activity feed logs the change
```

Three interactions, no page reload, no form. The heavier edit modal exists behind an explicit "Edit this booking" button, so the common case stays fast and the rare case stays possible.

### Staff — rescheduling

```
Calendar (month) → drag the booking chip onto another day → toast confirms
```

Drag was chosen over an edit form because rescheduling is almost always "same booking, different day" — a spatial operation, not a data-entry one.

---

## 7. Design decisions

**A warm, low-contrast palette rather than restaurant black.** The brief fixed the colours: a clay primary on a warm off-white. It suits a room with brick and brass, and it keeps the dashboard readable across a nine-hour shift in a way a dark UI on a bright floor would not. Dark mode exists for late closes and is a single token override.

**Three typefaces, each with a job.** Poppins carries headings and the brand. Inter carries everything you read as prose. Roboto Mono carries every number — reservation codes, times, prices, KPI figures, table numbers. Numbers are tabular data and setting them in a proportional face made columns of times visibly jitter in early tests.

**The hero is availability, not a photograph.** Most restaurant sites open with a plate of food. Luna's single job on the home page is to get a booking, and the most persuasive thing it can show is that 19:30 is free tonight. The "Tonight's service" panel is the page's signature element and the only place in the design where boldness is spent — everything around it stays quiet.

**Status is colour plus text, never colour alone.** Six reservation statuses and four table states each carry a label and a dot. The floor plan additionally uses position and border weight, so it reads for colour-blind users and under the kitchen's warm lighting.

**Empty states give direction.** "No bookings match those filters. Widen the date range, or clear the search box." Not a shrug, not an apology — an instruction.

**Errors instruct, they don't apologise.** "We need a number we can reach you on if plans change" explains the ask as well as the failure. Users abandoned early prototypes at the phone field until the copy explained why it was required.

---

## 8. What I would test next

- Whether the availability panel measurably lifts conversion against a photo hero (A/B, two weeks)
- Whether seating preference reduces on-arrival table swaps
- Whether the drag-to-reschedule interaction is discoverable without the hint text below the calendar
- Whether staff use the reports page at all, or only the dashboard — and if the latter, what should move

---

## 9. Outcome

The delivered product covers the full loop: a guest books in under two minutes on their phone, the booking lands in the console before they close the tab, and a manager can reschedule it by dragging a chip across a calendar. The paper diary has nothing left to do.

**Skills demonstrated:** user research, personas, information architecture, user flows, wireframing, design system creation, high-fidelity UI, responsive design, accessibility, dashboard and data-density UX, component architecture, form validation, state management, interactive tables, calendar UI, data visualisation, and local data management.

## Goal

Ship a high-fidelity, mobile-first UI mockup for **كنيسة العذراء والأنبا بيشوي** QR attendance app. Bilingual (Arabic RTL ↔ English LTR toggle), no backend — all data is mock. You can switch roles freely from a developer "Role Switcher" on the landing screen to preview every flow. The logo slot will use a tasteful generated placeholder mark until you upload the real logo (one-line swap later).

## Design system

- **Palette** (warm, premium, spiritual)
  - Background: warm off-white `oklch(0.985 0.008 75)`
  - Surface/card: pure white with soft shadow
  - Primary (deep liturgical red): `oklch(0.42 0.16 25)`
  - Gold accent: `oklch(0.78 0.13 80)`
  - Muted gray: `oklch(0.55 0.01 80)`
  - Status: success green, warning amber, destructive red
  - Dark mode included
- **Typography**: Inter (Latin) + Cairo (Arabic) via @fontsource. Strong hierarchy, generous sizing for older members.
- **Components**: rounded-2xl cards, subtle shadows, soft borders, gold-accented badges, large tap targets (min 44px), elegant empty states, bottom nav with active pill.
- **RTL**: full `dir` switching, mirrored layouts, logical properties (ms-/me-) everywhere.

## Routes (TanStack Start, file-based)

```
/                          Landing / Sign In  (+ role-switcher dev panel)
/register                  Registration
/member                    Member layout (bottom nav)
  /member/                   Home (verse, meeting, overview)
  /member/qr                 My QR
  /member/alerts             Notifications
  /member/profile            Profile
/admin                     Admin layout (bottom nav)
  /admin/                    Scanner
  /admin/logs                Attendance logs
  /admin/comms               Alerts & communication (tabs: birthdays, send, receipts, absences)
  /admin/members             Members management (pending requests, add)
  /admin/profile             Admin profile
/super                     Super Admin layout
  /super/                    KPI dashboard
  /super/members             Members management center (filters, expandable cards)
  /super/profile             Profile + sign out
```

## Screen-by-screen

**Auth**
- Sign In — centered logo, church name (Arabic primary + English subtitle), phone + password, primary "Sign In", secondary "New Member? Register", language toggle, dev role-switcher chips.
- Register — same brand header, form fields per spec, "Create Account", back link.

**Member**
- Home — avatar + approval badge, "Welcome, {name}", Verse of the Day card (gold-accented), Weekly Family Meeting card with date/time, two small overview cards (attendance streak, unread announcements).
- My QR — large QR (mock SVG), name, status badge, instruction text, share/download icons.
- Alerts — notification cards w/ unread dot, swipeable feel, "Clear all", empty state.
- Profile — avatar with edit, info list, change phone, edit, logout (destructive).

**Admin**
- Scanner — admin chip header, large scanner card with viewfinder graphic + "Scan QR Code" CTA, today's check-ins + pending alerts summary tiles.
- Attendance Log — search + filter chips (today/week/all), member cards with time/date/status badge.
- Comms — tabbed: Upcoming Birthdays (countdown cards), Send Alerts (search + select-all + checkboxes + counter + type toggle + composer), Read Receipts (progress bars), Friday Absences (warning cards w/ streak).
- Members — "Add Member" CTA, Pending Requests cards with Approve/Reject.
- Profile — same shape as member.

**Super Admin**
- Dashboard — KPI grid (Total Members, Total Admins, Today's Check-ins, Pending), mini-trend lines, recent activity.
- Members Center — role filter chips + status filter chips, expandable member cards with full audit info (registered, approved by, scanned by, last attendance).
- Persistent sign-out near bottom.

## Bilingual handling

- `LanguageProvider` (context) toggling `dir` on `<html>` and swapping a translations dict.
- Toggle accessible on auth screens and in profile.
- All strings flow through `t('key')`.

## Technical notes

- Tailwind v4 tokens in `src/styles.css` (`@theme inline`), oklch only.
- `@fontsource/inter` + `@fontsource/cairo` installed.
- Mock data in `src/lib/mock-data.ts` (members, logs, notifications, verses).
- QR rendered with `qrcode.react` (small dep) for crisp mock QR.
- Lucide icons for controls; placeholder logo generated as a gold cross/dove mark — swap by replacing one asset import when you upload yours.
- Each route gets its own `head()` with title + description.

## Out of scope (this pass)

- Real auth, database, QR scanning camera, push notifications, file uploads.
- Will be added in a follow-up once you approve the design and turn on Lovable Cloud.

Reply "go" and I'll build it.
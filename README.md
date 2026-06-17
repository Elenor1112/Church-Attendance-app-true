# Church Attendance App

> **Virgin Mary & St. Bishoy Church** — A bilingual (Arabic/English) QR-code-based church attendance tracking system with role-based dashboards for members, administrators, and super admins.

---

## Executive Summary

This application enables Coptic Orthodox churches to digitally manage congregation attendance via QR code check-ins. Members display a QR code from their phone; admins scan it with the device camera to record attendance. The system supports three roles — **Member**, **Admin**, and **Super Admin** — each with tailored views and capabilities. The entire interface is fully localized in Arabic and English with a single toggle.

Built as a **dual-platform** monorepo: a **React Native** mobile app (Expo) for on-the-go member/admin use, and a **TanStack Start** web application (SSR React) for desktop administration and dashboard access.

---

## Technical Stack

### Frontend (Mobile)
| Package | Purpose |
|---|---|
| `expo` ^56 | React Native framework & SDK |
| `expo-router` ^56 | File-based navigation |
| `react-native` 0.85 | Native mobile runtime |
| `nativewind` ^4 | Tailwind CSS for React Native |
| `expo-camera` | QR code scanning (admin) |
| `react-native-qrcode-svg` | QR code generation (member) |
| `expo-notifications` | Push notification tokens |
| `expo-secure-store` | Secure JWT session persistence |

### Frontend (Web)
| Package | Purpose |
|---|---|
| `@tanstack/react-start` ^1.98 | SSR React framework (Vinxi + Vite) |
| `@tanstack/react-router` ^1.98 | File-based routing |
| `@tanstack/react-query` ^5 | Server-state management |
| `tailwindcss` ^3 | Utility-first CSS |
| `lucide-react` | Icon library |

### Shared (Mobile + Web)
| Package | Purpose |
|---|---|
| `react` 19.2 | UI library |
| `react-hook-form` + `zod` | Form validation |
| `lucide-react-native` | Icons (mobile) |
| `date-fns` | Date formatting |

### Backend & Database
| Package | Purpose |
|---|---|
| `drizzle-orm` ^0.30 & `drizzle-kit` ^0.21 | ORM & migrations |
| `pg` ^8 | PostgreSQL client |
| `jsonwebtoken` ^9 | JWT authentication |
| `bcryptjs` ^2 | Password hashing |
| `vinxi` ^0.5 | Server framework (h3) |
| `dotenv` ^16 | Environment variables |

### Developer Tooling
| Package | Purpose |
|---|---|
| `typescript` ^5.9 | Type safety |
| `eslint` ^9 | Linting |
| `prettier` ^3 | Code formatting |
| `tsx` ^4 | TypeScript execution |
| `vite` ^5 | Build tool |

---

## Architecture & Project Structure

```
church-attendance-app/
│
├── app/                          # MOBILE APP (Expo Router)
│   ├── _layout.tsx               # Root layout (auth, query, i18n providers)
│   ├── index.tsx                 # Sign-in screen
│   ├── register.tsx              # Member registration
│   ├── admin/                    # Admin tab screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Camera QR scanner
│   │   ├── logs.tsx              # Attendance logs
│   │   ├── comms.tsx             # Communications hub
│   │   ├── members.tsx           # Member approvals
│   │   └── profile.tsx
│   ├── member/                   # Member tab screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home (verse, meeting, stats)
│   │   ├── qr.tsx                # QR code display
│   │   ├── alerts.tsx            # Notifications
│   │   └── profile.tsx
│   └── super/                    # Super Admin tab screens
│       ├── _layout.tsx
│       ├── index.tsx             # Dashboard KPIs
│       ├── members.tsx           # Members center
│       └── profile.tsx
│
├── mobile/                       # MOBILE-ONLY SHARED CODE
│   ├── components/ui.tsx         # Mobile UI primitives
│   ├── data/mock.ts              # In-memory mock data layer
│   ├── features/queries.ts       # TanStack Query hooks
│   └── lib/
│       ├── api.ts                # API client abstraction
│       ├── auth.tsx              # Auth context & provider
│       ├── hooks.ts              # Custom hooks (online, push)
│       ├── i18n.tsx              # Translation context
│       ├── query.tsx             # QueryClient setup
│       ├── storage.ts            # SecureStore session
│       └── validation.ts         # Zod schemas
│
├── src/                          # WEB APP (TanStack Start)
│   ├── components/               # Web UI components
│   │   ├── ui/                   # shadcn/ui primitives
│   │   ├── app-shell.tsx         # Mobile-frame layout wrapper
│   │   ├── bottom-nav.tsx        # Role-based bottom nav
│   │   ├── church-logo.tsx
│   │   └── language-toggle.tsx   # AR/EN switch
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # 6 PostgreSQL table definitions
│   │   ├── index.ts              # Drizzle connection pool
│   │   ├── migrate.ts            # Migration runner
│   │   └── seed.ts               # Development seed data
│   ├── lib/                      # Web utilities
│   │   ├── auth-client.ts        # localStorage session management
│   │   ├── auth-server.ts        # JWT + bcrypt helpers
│   │   ├── config.server.ts      # Server-side config
│   │   └── i18n.tsx              # Web i18n context
│   ├── routes/                   # FILE-BASED ROUTES (Web)
│   │   ├── __root.tsx            # Root layout shell
│   │   ├── index.tsx             # Login page
│   │   ├── register.tsx          # Registration page
│   │   ├── admin*.tsx           # Admin routes
│   │   ├── member*.tsx          # Member routes
│   │   ├── super*.tsx           # Super admin routes
│   │   └── api/                  # API endpoints
│   │       ├── auth/             # login.ts, register.ts, me.ts
│   │       ├── member/home.ts    # Member dashboard API
│   │       ├── super/dashboard.ts# Super admin stats API
│   │       └── notifications.ts  # Notification CRUD
│   ├── server.ts                 # SSR server entry
│   ├── router.tsx                # Router factory
│   ├── styles.css                # Tailwind v4 + theme
│   └── routeTree.gen.ts          # Auto-generated route tree
│
├── drizzle/                      # SQL migration files
├── app.json                      # Expo configuration
├── babel.config.js
├── bunfig.toml
├── components.json               # shadcn/ui config
├── drizzle.config.ts             # Drizzle Kit config
├── eas.json                      # Expo EAS Build config
├── eslint.config.js
├── global.css                    # NativeWind global styles
├── metro.config.js
├── nativewind-env.d.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Core Features

### Role-Based Access

| Role | Access |
|---|---|
| **Member** | View verse of the day, weekly meeting info, attendance count, church announcements. Display QR code for check-in. Receive notifications. |
| **Admin** | All Member capabilities, plus: scan QR codes via camera, view attendance logs with search/filter, send broadcast alerts, approve/reject registrations, view birthdays & absence tracking. |
| **Super Admin** | All Admin capabilities, plus: dashboard with KPIs (total members, admins, today's check-ins, pending approvals), full members center with role/status filtering, recent activity log. |

### QR Code Attendance
- Members generate a scannable QR code containing `{type, memberId, phone, issuedAt}`.
- Admins scan codes using the device camera (`expo-camera`) on mobile.
- Each scan records member ID, timestamp, and scanner identity.

### Bilingual Interface (Arabic / English)
- Full i18n with instant language toggle (no reload required).
- All dynamic content stored in dual columns (`nameAr` / `nameEn`, `dateAr` / `dateEn`, etc.).
- RTL-aware layout for Arabic.

### Member Management
- **Self-registration** with phone + password; requires admin approval.
- **Admin-initiated** manual member creation.
- **Super admin** can view, filter, and manage all members across the church.

### Notifications & Communications
- Members see church announcements, birthday wishes, and attendance receipts.
- Admins can compose and send broadcast or targeted alerts.
- Read receipts track message delivery.
- Absence tracking highlights members who have missed consecutive meetings.

### Database Schema (6 Tables)

| Table | Purpose |
|---|---|
| `members` | User accounts with role, status, bilingual names, contact info |
| `attendance_logs` | Check-in records with timestamp and status |
| `verses` | Verse of the day (bilingual) |
| `meetings` | Scheduled church meetings (bilingual) |
| `notifications` | Push/in-app notifications (bilingual) |
| `activity_logs` | Admin audit trail (bilingual) |

---

## Setup & Installation

### Prerequisites

- **Node.js** >= 20
- **Bun** (recommended) or npm
- **PostgreSQL** >= 14
- **Expo CLI** (`npx expo` — installs on demand)
- **Android Studio** or **Xcode** (for mobile emulators)

### Environment Variables

Create a `.env` file in the project root (a template is already provided):

```env
# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Authentication
JWT_SECRET=generate-a-long-random-secret-key-at-least-32-characters
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081

# App
APP_NAME=Church Attendance App
```

### Quick Start

```bash
# 1. Install dependencies
bun install
# or: npm install

# 2. Set up the database
bun run db:generate   # Generate SQL migration
bun run db:migrate    # Apply migration to PostgreSQL
bun run db:seed       # Seed with demo data

# 3. Start the web app (SSR)
bun run web:dev       # http://localhost:3000

# 4. Start the mobile app (in a separate terminal)
bun start             # Expo dev server — scan QR with Expo Go
```

> **Mobile ↔ API:** The mobile app talks to the live backend over HTTP via `mobile/lib/api.ts`. Set the API base URL through `expo.extra.apiUrl` in `app.json` or the `EXPO_PUBLIC_API_URL` environment variable (defaults to `http://localhost:3000`). There is no mock/demo data layer.

### Available Scripts

| Script | Description |
|---|---|
| `bun run start` | Start Expo dev server (mobile) |
| `bun run android` | Run on Android emulator |
| `bun run ios` | Run on iOS simulator |
| `bun run web` | Start Expo web preview |
| `bun run web:dev` | Start TanStack Start dev server (SSR) |
| `bun run web:build` | Build web app for production |
| `bun run web:start` | Start production web server |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:seed` | Seed database (single production Super Admin) |
| `bun run typecheck` | TypeScript type checking |
| `bun run lint` | Run ESLint |
| `bun run format` | Format code with Prettier |

### Seed Account

`bun run db:seed` wipes all accounts and data, then creates **exactly one** production Super Admin (defined in [`src/db/seed.ts`](src/db/seed.ts)). No demo/test members, admins, or attendance records are created.

| Role | Phone | Password |
|---|---|---|
| Super Admin | `01000000001` | `ChangeMe@123` |

> ⚠️ Change this password immediately after first login. The Super Admin can then create admins (with granular permissions) and members from the Members Center.

---

## Development Notes

- **Web app** is styled as a mobile-first PWA (`max-width: 28rem` app shell).
- **Mobile API** is fully database-driven over HTTP; configure the base URL via `expo.extra.apiUrl` / `EXPO_PUBLIC_API_URL`.
- **Database migrations** are managed via Drizzle Kit and live in `drizzle/`.
- **Type generation:** The route tree (`src/routeTree.gen.ts`) auto-regenerates on dev server start.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Package Management
- Use `npm` for package management (package-lock.json is present)

## Project Architecture

This is a Next.js 15 application for CATV management built with:

### Technology Stack
- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI, Heroicons, Lucide React
- **State Management**: React hooks (useState)
- **Development Tools**: ESLint with Next.js config

### Directory Structure
```
src/
├── app/                     # App Router pages
│   ├── applications/        # 申請番号管理ページ（中電/NTT共架・添架許可管理）
│   ├── orders/             # 工事依頼管理ページ（小川オーダー表形式）
│   ├── schedule/           # 工事日程調整ページ（Outlookライクカレンダー）
│   ├── my-exclusions/      # 協力会社用除外日管理ページ（認証済みユーザー）
│   ├── login/              # ログインページ
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # ダッシュボードページ（KPI表示）
│   └── globals.css         # Global styles (Tailwind)
├── components/
│   ├── Layout.tsx          # Main layout wrapper with sidebar & auth check
│   ├── Sidebar.tsx         # Navigation sidebar with role-based menus
│   └── CalendarPicker.tsx  # Reusable calendar component
└── contexts/
    └── AuthContext.tsx     # Authentication context provider
```

### Key Features
- **Authentication System**: Role-based access control (admin/contractor) with localStorage persistence
- **Responsive sidebar navigation** with hover-to-expand functionality and role-based menus
- **Multi-page CATV management system**:
  - ダッシュボード (Dashboard) - システム概要と工事進捗サマリ
  - 工事依頼管理 (Order Management) - 小川オーダー表形式の工事依頼管理 + アポイント履歴にスケジュール統合表示
  - 工事日程調整 (Schedule Management) - Outlookライクなカレンダー + 協力会社除外日表示
  - 申請番号管理 (Application Number Management) - 中電/NTT申請の受付〜許可管理
  - 除外日管理 (My Exclusions) - 協力会社専用の作業不可日時登録
- **Exclusion Date Management**: Time-specific exclusions (終日/午前/午後/カスタム時間指定)
- **Outlook-style overlapping layout** for schedules and exclusions with collision detection
- TypeScript path aliases configured (@/* maps to ./src/*)

### Domain-Specific Functionality

This system is built for KCT (倉敷ケーブルテレビ) CATV construction management:

#### Key Business Concepts
- **クロージャ番号**: Fiber optic connection point identifiers
- **共架OR添架許可申請**: Utility pole installation permits (collaboration with 中国電力・NTT)
- **宅内引込工事**: Home wiring construction
- **現状線の種別**: Existing line types (fiber optic, coaxial, metal)
- **小川オーダー表**: Excel-based order management format

#### Contractor Management
- **直営班**: In-house construction team (パワーケーブル)
- **栄光電気通信**: External contractor
- **スライヴ**: External contractor

#### Workflow Features
- Excel file upload (.xlsx/.xls) for order import
- 宅内引込進捗表 modal for detailed progress tracking
- Map PDF upload and display functionality
- アポイント履歴管理 for appointment history with integrated schedule view
- Multi-view calendar (月・週・日) with time slots (9:00-18:00)
- Status-based filtering and color coding
- Contractor exclusion date management with time-specific blocking
- Unified display of schedules and exclusions with Outlook-style overlapping layout

### Component Architecture
- Uses 'use client' directive for interactive components (all pages are client-side)
- Custom Layout component wraps all pages with Sidebar
- Sidebar component manages its own expanded/collapsed state via hover
- Icon system uses Heroicons (@heroicons/react/24/outline) for UI
- Modal-based detail editing patterns (using Headless UI Dialog)
- Drag & drop file upload components for Excel/PDF uploads
- CalendarPicker: Reusable date picker with schedule visualization (used in orders page)

### Data Management & State
- All data is stored in component state (useState) - no backend/database yet
- Sample/mock data initialized in each page component
- Excel file parsing expected but not yet implemented (orders page has upload UI)
- PDF uploads stored as data URLs in state
- Authentication data persisted in localStorage (client-side only)
- Exclusion data stored in localStorage with contractor-specific keys

### Development Notes
- Development indicators are disabled (devIndicators: false in next.config.ts)
- ESLint configured with Next.js Core Web Vitals rules
- Uses Geist font family for typography (automatically optimized via next/font)
- Strict TypeScript configuration with ES2017 target
- Path alias @/* configured to map to ./src/*
- No tests configured yet

## Authentication System

### Architecture
- **Context Provider**: `AuthContext.tsx` provides global authentication state
- **Storage**: localStorage for session persistence (key: 'user')
- **Protection**: `Layout.tsx` checks authentication and redirects to /login if unauthenticated
- **Routing**: useEffect-based navigation to prevent render-time routing errors

### Demo Accounts
```typescript
// Admin account
username: 'admin'
password: 'admin'
role: 'admin'
contractor: 'KCT管理者'

// Contractor accounts
username: 'chokueihan' | 'eiko' | 'thrive'
password: 'password'
role: 'contractor'
contractor: '直営班' | '栄光電気通信' | 'スライヴ'
```

### Role-Based Access Control
- **Admin role**: Access to all management pages (ダッシュボード, 工事依頼管理, 工事日程調整, 申請番号管理)
- **Contractor role**: Access only to 除外日管理 (my-exclusions page)
- **Sidebar**: Dynamically renders menu items based on user.role
- **Schedule page**: Admin can view exclusions but cannot edit them

### User Context API
```typescript
interface User {
  id: string
  name: string
  contractor: Contractor
  role: 'admin' | 'contractor'
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}
```

## Exclusion Date Management

### Overview
Contractors register dates/times when they cannot perform construction work. Admins view these exclusions in the schedule page without editing capabilities.

### Data Structure
```typescript
interface ExclusionEntry {
  id: string
  date: string              // YYYY-MM-DD format
  reason: string            // 理由 (e.g., "他現場対応", "休暇")
  contractor: string        // Contractor name (直営班, 栄光電気通信, スライヴ)
  timeType: 'all_day' | 'am' | 'pm' | 'custom'
  startTime?: string        // HH:MM format (for custom type)
  endTime?: string          // HH:MM format (for custom type)
}
```

### Time Types
- **終日 (all_day)**: Entire day blocked (9:00-18:00)
- **午前 (am)**: Morning blocked (9:00-12:00)
- **午後 (pm)**: Afternoon blocked (12:00-18:00)
- **カスタム (custom)**: User-specified time range with startTime/endTime

### Storage
- localStorage key pattern: `exclusions_${contractor}`
- Each contractor has separate storage namespace
- Data persists across sessions

### UI Components

#### My Exclusions Page (src/app/my-exclusions/page.tsx)
- **Calendar view**: Month view with existing exclusions displayed
- **Registration form**: Date picker + time type selector + reason input
- **Time type selector**: Radio buttons for 終日/午前/午後/カスタム
- **Custom time picker**: Two time inputs (startTime, endTime) when custom is selected
- **Exclusion list**: Table with date, time, reason, and delete action
- **Validation**: Prevents past date registration, ensures startTime < endTime

#### Schedule Page Integration (src/app/schedule/page.tsx)
- **Read-only display**: Exclusions shown in all calendar views (月/週/日)
- **Visual distinction**: Red dashed border (border-2 border-dashed border-red-500)
- **Icon**: 🚫 emoji for quick identification
- **Italic text**: Exclusion text displayed in italic style
- **Hover info**: Shows contractor, time, and reason on hover

### Position Calculation
```typescript
const getExclusionPosition = (exclusion: ExclusionEntry) => {
  if (exclusion.timeType === 'all_day') {
    return { top: 0, height: '100%' }
  }
  if (exclusion.timeType === 'am') {
    return { top: 0, height: '50%' }
  }
  if (exclusion.timeType === 'pm') {
    return { top: '50%', height: '50%' }
  }
  if (exclusion.timeType === 'custom') {
    // Calculate position based on 9:00-18:00 time slots (each hour = 4rem)
    const startPosition = (startHour - 9) * 4 + (startMinute / 60) * 4
    const endPosition = (endHour - 9) * 4 + (endMinute / 60) * 4
    return { top: `${startPosition}rem`, height: `${endPosition - startPosition}rem` }
  }
}
```

## Outlook-Style Overlapping Layout

### Overview
When multiple schedules and/or exclusions overlap in time, they are displayed side-by-side like Microsoft Outlook calendar, rather than stacking vertically.

### Algorithm: `calculateOverlappingLayoutWithExclusions`
Located in: `src/app/schedule/page.tsx`

#### Unified Item Processing
```typescript
type CalendarItem =
  | { type: 'schedule', data: ScheduleItem, timeSlot: string }
  | { type: 'exclusion', data: ExclusionEntry, timeSlot: string }

// Merge schedules and exclusions into single array
const items: CalendarItem[] = [
  ...schedules.map(s => ({ type: 'schedule', data: s, timeSlot: s.timeSlot })),
  ...exclusions.map(e => ({ type: 'exclusion', data: e, timeSlot: getExclusionTimeSlot(e) }))
]
```

#### Overlap Detection
```typescript
const overlaps = (a: CalendarItem, b: CalendarItem): boolean => {
  const [aStart, aEnd] = a.timeSlot.split('-').map(parseTime)
  const [bStart, bEnd] = b.timeSlot.split('-').map(parseTime)
  return aStart < bEnd && bStart < aEnd
}
```

#### Column Assignment
- Items sorted by start time, then by duration (longer first)
- For each item, find the leftmost available column that doesn't overlap
- Overlapping items assigned to different columns
- Returns: `{ column: number, totalColumns: number }` for each item

#### Visual Rendering
```typescript
// Width calculation
width: `${100 / layout.totalColumns}%`

// Horizontal position
left: `${(layout.column * 100) / layout.totalColumns}%`

// Z-index hierarchy
- Modals: z-50
- Exclusions: z-10
- Schedules: z-1 to z-5 (based on column)
```

### Display Differences

#### Schedules
- Colored background based on contractor (blue/green/amber/purple)
- White text
- Border: solid
- Hover: slight opacity change

#### Exclusions
- Red dashed border (border-2 border-dashed border-red-500)
- Light red background (bg-red-50)
- Red text (text-red-700)
- 🚫 icon prefix
- Italic font style
- Z-index: 10 (above schedules but below modals)

### Edge Cases
- Single item: full width (100%)
- Two overlapping items: each 50% width
- Three overlapping items: each 33.33% width
- Non-overlapping items: full width each, no column offset

## Important Technical Notes

### React Router Navigation
**CRITICAL**: Never call `router.push()` directly in component body during render phase.

❌ **Wrong** (causes "Cannot update component while rendering" error):
```typescript
if (!isAuthenticated) {
  router.push('/login')
  return null
}
```

✅ **Correct** (use useEffect):
```typescript
useEffect(() => {
  if (!isAuthenticated) {
    router.push('/login')
  }
}, [isAuthenticated, router])
```

### Z-Index Hierarchy
Maintain this strict hierarchy to prevent visual layering issues:
- **50**: Modals (Dialog components)
- **10**: Exclusions (visible but below modals)
- **1-5**: Schedules (based on column position)
- **0**: Background elements

### Time Slot Format
- All time slots use 24-hour format: "HH:MM-HH:MM"
- Business hours: 9:00-18:00 (9時〜18時)
- Week/Day view: 15-minute intervals (each hour = 4 grid cells of 1rem height)
- Month view: no time display, just date-level items

### Calendar View State Management
Each view (month/week/day) maintains:
- `selectedDate`: Date object for current view focus
- `schedules`: Array of ScheduleItem (mock data)
- `exclusions`: Loaded from localStorage on mount
- `isModalOpen`: Boolean for new schedule creation modal
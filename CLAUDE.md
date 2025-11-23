# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Essential Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run lint` - Check code quality

### Demo Accounts
**Admin:** `admin` / `admin` (all pages)
**Contractors:** `chokueihan`, `eiko`, `thrive` / `password` (依頼一覧, 除外日管理)

### Critical Rules (MUST FOLLOW)
1. **localStorage-only**: All data in browser localStorage (no backend). Clear with `localStorage.clear()` + `location.reload()` after type changes
2. **Path aliases**: Always use `@/*` imports (never relative paths)
3. **React routing**: NEVER `router.push()` during render - use `useEffect`
4. **Form styling**: All input/select MUST have `bg-white text-gray-900` classes
5. **Date formatting**: Use `formatDateString(date)` from `@/shared/utils/formatters` (not `toISOString()`)

## Architecture

### 3-Layer Structure
```
src/
├── shared/              # Layer 1: App-wide utilities (domain-agnostic)
│   ├── components/
│   │   ├── layout/      # Layout, Sidebar
│   │   └── ui/          # Button, Badge, Modal, Input, Textarea
│   └── utils/           # formatters, validators, password, constants
│
├── features/            # Layer 2: Domain business logic
│   ├── auth/            # Authentication (authStorage.ts)
│   ├── contractor/      # Contractors & Teams (contractorStorage.ts)
│   ├── applications/    # Application requests (applicationStorage.ts)
│   └── calendar/        # Calendar components (CalendarPicker)
│
└── app/                 # Layer 3: Page-specific code
    ├── applications/    # 申請番号管理 (3 tabs: survey/attachment/construction)
    ├── contractor-requests/  # 依頼一覧 (contractor-only)
    ├── schedule/        # 工事日程調整 (Outlook-style calendar)
    ├── orders/          # 工事依頼管理 (order management + appointment history)
    ├── my-exclusions/   # 除外日管理 (contractor-only)
    └── contractor-management/  # アカウント管理 (admin-only)
```

### Technology Stack
- Next.js 15.5.3 (App Router, all pages client-side with 'use client')
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- Headless UI, Heroicons, Lucide React
- localStorage for all data persistence

### Code Organization Rules

**Where to put code:**
```
Domain-agnostic utils → shared/utils/
Domain business logic → features/*/lib/
Page-specific logic   → app/*/lib/
```

**Component targets:**
- Component: 100-300 lines
- page.tsx: 150-250 lines
- Files >500 lines should be split

**Naming conventions:**
- Components: PascalCase (`AddScheduleModal.tsx`)
- Hooks: `useXxxData`, `useXxxState`, `useXxx`
- Utils: camelCase (`dateUtils.ts`)
- Types: `types/index.ts`

## Key Domain Concepts

### CATV Construction Management (KCT - 倉敷ケーブルテレビ)
- **クロージャ番号**: Fiber optic connection point IDs
- **共架OR添架許可申請**: Utility pole permits (中国電力・NTT)
- **宅内引込工事**: Home wiring construction
- **小川オーダー表**: Excel-based order format

### Contractors & Teams
- **直営班** (In-house): A班, B班
- **栄光電気通信**: 1班
- **スライヴ**: 第1班

Login at contractor level, team selection during exclusion registration.

## Data Storage (localStorage)

### Keys & Modules
| Key | Module | Purpose |
|-----|--------|---------|
| `user` | `features/auth/lib/authStorage.ts` | Authentication session |
| `admins`, `contractors`, `teams` | `features/contractor/lib/contractorStorage.ts` | Account management |
| `applications_survey`, `applications_attachment`, `applications_construction` | `features/applications/lib/applicationStorage.ts` | Application requests |
| `schedules` | `app/schedule/lib/scheduleStorage.ts` | Construction schedules |
| `exclusions` | `app/my-exclusions/lib/exclusionStorage.ts` | Contractor exclusion dates |
| `orders` | `app/orders/lib/orderStorage.ts` | Order data |
| `order_files` | `app/orders/lib/orderFileStorage.ts` | Map PDFs (Base64, 2MB limit) |

### Repository Pattern
All storage modules use repository pattern for future DBMS migration (PostgreSQL/MySQL in 1-3 months).

## Important Technical Patterns

### Authentication Flow
1. Login at contractor level (not team level)
2. `AuthProvider` initializes all default data on first load
3. Layout component checks auth and redirects to `/login`
4. Sidebar renders role-based menu items

### Role-Based Access
- **Admin**: ダッシュボード, 工事依頼管理, 工事日程調整, 申請番号管理, アカウント管理
- **Contractor**: 依頼一覧, 除外日管理

### Application Request System
**3 Request Types:**
1. **Survey (現地調査依頼)**: Field surveys for installation planning
2. **Attachment (共架・添架依頼)**: Utility pole attachment permits
3. **Construction (工事依頼)**: Construction work orders

**Key Features:**
- Bidirectional file attachments (admin ↔ contractor)
- Request notes (admin instructions to contractor)
- Progress tracking with append-only history
- Team assignment at request creation

**File Attachments:**
- 2-column layout (received files | sent files)
- Base64 storage in localStorage (10MB limit)
- Admin sends to contractor, contractor submits to admin

### Schedule Page Features
**Calendar Views:** 月・週・日
**Business Hours:** 9:00-18:00 (15-min intervals, each hour = 4rem)

**Outlook-style Features:**
- Overlapping layout when schedules/exclusions conflict
- Hierarchical team filtering (contractor → teams)
- Day view: Column-based layout (1 column per team)
- rem-based positioning for cross-device compatibility

**Exclusion Types:**
- 終日 (all_day): 9:00-18:00
- 午前 (am): 9:00-12:00
- 午後 (pm): 12:00-18:00
- カスタム (custom): User-specified time range

### Z-Index Hierarchy (STRICT)
```
50: Modals (Dialog components)
20: Dropdowns (filter panels)
10: Exclusions (visible but below modals)
1-5: Schedules (based on column)
0: Background
```

### Date Selection UX (Schedule Page)
**Two-step process:**
1. **Single click**: Selects date (blue highlight, shows in "新規登録" button)
2. **Double click**: Navigates to day view

**Visual indicators:**
- Selected date: `bg-blue-100 ring-2 ring-blue-500`
- Today: `ring-green-400`
- Week view selected column: `bg-blue-50`

## Common Patterns

### Password Generation
```typescript
// src/shared/utils/password.ts
generateSimplePassword(length = 10): string
// Returns: "aB3xYz7Qm1" (1+ uppercase, 1+ lowercase, 1+ number, Fisher-Yates shuffle)
```

### File Upload Specs
- Max file size: 10MB (configurable)
- Max files per upload: 10
- Supported: Images, PDF, Excel (.xlsx, .xls), Word (.doc, .docx)
- Methods: Drag & drop, click to select, multiple selection

### Record Count Display
Position badges in top-right corner of filter panels:
```typescript
<div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
  {filteredCount}/{totalCount}件
</div>
```

### Form Modal Pattern
All modals follow this pattern:
1. State: `formData`, `uploadingFiles`
2. Handlers: `handleFileUpload`, `handleFileDelete`, `handleFileDownload`
3. Components: FileAttachments, RequestNotes (for applications)
4. Save: Update localStorage via storage module, close modal

## Troubleshooting

### localStorage Errors After Type Changes
```javascript
// Browser console:
localStorage.clear()
location.reload()
```

### Common Issues
- **Render errors**: Check for `router.push()` during render → move to `useEffect`
- **Date timezone shifts**: Use `formatDateString(date)`, not `toISOString().split('T')[0]`
- **Form inputs invisible**: Add `bg-white text-gray-900` classes
- **Z-index conflicts**: Follow strict hierarchy (modals=50, exclusions=10, schedules=1-5)

## Development Notes

### Component Refactoring Status
| Page | Status | Lines | Notes |
|------|--------|-------|-------|
| applications | ✅ Complete | 222 | 13 components |
| contractor-requests | ✅ Complete | 518 | FileAttachments integration |
| schedule | ✅ Complete | 156 | Multiple components/hooks/lib |
| orders | ✅ Complete | 230 | Multiple components/hooks/lib |
| my-exclusions | ✅ Complete | 148 | Multiple components/hooks/lib |
| contractor-management | ⏳ To refactor | 1,005 | 11+ components needed |
| login | ✅ Simple | 114 | Already clean |

### Future Migration Path
- **DBMS**: PostgreSQL/MySQL (1-3 months)
- **File storage**: AWS S3 or Cloudinary
- **API layer**: Repository pattern already in place
- **Authentication**: Consider proper auth system (currently plain text passwords)

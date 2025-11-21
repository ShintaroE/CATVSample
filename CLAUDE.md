# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Essential Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run lint` - Check code quality

### Demo Accounts
**Admin Account:**
- Username: `admin`
- Password: `admin`
- Access: All management pages

**Contractor Accounts:**
- 直営班: username `chokueihan`, password `password`
- 栄光電気通信: username `eiko`, password `password`
- スライヴ: username `thrive`, password `password`
- Access: 依頼一覧 (Contractor Requests), 除外日管理 (My Exclusions)

### Critical Development Notes
- **localStorage dependency**: All data stored in browser localStorage (no backend)
- **localStorage clear**: If errors occur after type updates, clear localStorage:
  ```javascript
  localStorage.clear()
  location.reload()
  ```
- **Path aliases**: Always use `@/*` imports instead of relative paths (e.g., `@/shared/components/layout/Layout`)
- **React routing rule**: NEVER call `router.push()` during render phase - always use `useEffect`
- **Form styling**: All input/select elements MUST include `bg-white text-gray-900` classes for proper visibility
- **Date formatting**: Always use `formatDateString(date)` from `@/shared/utils/formatters` to avoid timezone issues

### Architecture Overview
This is a Next.js 15 application following a **3-layer architecture**:
1. **Layer 1 - `shared/`**: App-wide utilities and components (domain-agnostic)
2. **Layer 2 - `features/`**: Domain-specific business logic (auth, contractor, applications, calendar)
3. **Layer 3 - `app/`**: Page-specific code with components, hooks, and lib folders

## Commands

### Development
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

### Package Management
- Use `npm` for package management (package-lock.json is present)

### Troubleshooting

#### localStorage クリアが必要な場合
型定義の更新（例: ステータスの変更）後、ブラウザのlocalStorageに古いデータが残っている場合、エラーが発生する可能性があります。

**localStorageをクリアする手順**:
1. ブラウザの開発者ツールを開く（F12キーまたは右クリック → 検証）
2. コンソールタブを開く
3. 以下のコマンドを実行:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

これにより、最新のサンプルデータで初期化されます。

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

**Current structure follows Colocation Principle** - organizing code by feature with related files grouped together.

```
src/
├── shared/                          # Layer 1: App-wide shared utilities
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout/index.tsx    # Main layout with auth check
│   │   │   └── Sidebar/index.tsx   # Navigation sidebar
│   │   └── ui/                     # Shared UI component library
│   │       ├── Button.tsx          # Unified button component
│   │       ├── Badge.tsx           # Status badges
│   │       ├── Modal.tsx           # Modal wrapper
│   │       ├── Input.tsx           # Form input with label
│   │       └── Textarea.tsx        # Form textarea with label
│   └── utils/                      # Domain-agnostic utilities
│       ├── formatters.ts           # Date/number formatting
│       ├── validators.ts           # Validation functions
│       └── constants.ts            # App-wide constants
│
├── features/                        # Layer 2: Domain feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   └── AuthProvider.tsx    # Auth context provider
│   │   ├── hooks/useAuth.ts        # Authentication hook
│   │   ├── lib/authStorage.ts      # localStorage operations
│   │   └── types/index.ts          # Auth-related types
│   ├── contractor/
│   │   ├── lib/contractorStorage.ts # Contractor/Team CRUD
│   │   └── types/index.ts          # Contractor interfaces
│   ├── applications/
│   │   ├── lib/applicationStorage.ts # Application request CRUD
│   │   └── types/index.ts          # Application types
│   └── calendar/
│       ├── components/
│       │   └── CalendarPicker/     # Reusable calendar component
│       ├── lib/dateUtils.ts        # Calendar-specific date ops
│       └── types/index.ts          # Calendar types
│
└── app/                             # Layer 3: Page-specific code
    ├── applications/                # ✅ Well-structured
    │   ├── page.tsx                 # Main page (222 lines)
    │   └── components/              # 13 components + 2 folders
    │       ├── SurveyTab.tsx
    │       ├── AttachmentTab.tsx
    │       ├── ConstructionTab.tsx
    │       ├── NewRequestModal.tsx
    │       ├── EditSurveyModal.tsx
    │       ├── EditAttachmentModal.tsx
    │       ├── EditConstructionModal.tsx
    │       ├── ProgressHistory.tsx
    │       ├── FileAttachments/     # File upload/download system
    │       │   ├── index.tsx        # Main 2-column layout
    │       │   ├── FileItem.tsx     # Individual file display
    │       │   ├── FileList.tsx     # File list container
    │       │   └── FileUploadZone.tsx # Drag & drop upload
    │       └── RequestNotes/        # Admin instructions display
    │           └── index.tsx        # Role-based notes component
    │
    ├── schedule/                    # ✅ Refactored (156 lines)
    │   ├── page.tsx                 # Main page
    │   ├── components/              # Component modules
    │   ├── hooks/                   # Custom hooks
    │   ├── lib/                     # Business logic
    │   ├── types/index.ts
    │   └── data/sampleData.ts
    │
    ├── orders/                      # ✅ Refactored (230 lines)
    │   ├── page.tsx                 # Main page
    │   ├── components/              # Component modules
    │   ├── hooks/                   # Custom hooks
    │   ├── lib/                     # Business logic
    │   │   ├── orderStorage.ts      # Order data CRUD
    │   │   └── orderFileStorage.ts  # PDF file management
    │   └── types/index.ts
    │
    ├── contractor-management/       # ⏳ Refactoring planned (1,005 lines)
    │   ├── page.tsx
    │   ├── components/              # To be created
    │   └── hooks/                   # To be created
    │
    ├── contractor-requests/         # ✅ Complete (518 lines)
    │   ├── page.tsx
    │   └── components/              # Includes FileAttachments integration
    │
    ├── my-exclusions/               # ✅ Refactored (148 lines)
    │   ├── page.tsx
    │   ├── components/              # Component modules
    │   ├── hooks/                   # Custom hooks
    │   └── lib/                     # Business logic
    │       └── exclusionStorage.ts  # Exclusion CRUD operations
    │
    ├── login/page.tsx               # ✅ Simple (114 lines)
    ├── page.tsx                     # ✅ Dashboard
    ├── layout.tsx                   # Root layout
    └── globals.css

```

### Key Features
- **Authentication System**: Role-based access control (admin/contractor) with localStorage persistence
- **Responsive sidebar navigation** with hover-to-expand functionality and role-based menus
- **Multi-page CATV management system**:
  - ダッシュボード (Dashboard) - システム概要と工事進捗サマリ
  - 工事依頼管理 (Order Management) - 小川オーダー表形式の工事依頼管理 + アポイント履歴にスケジュール統合表示
  - 工事日程調整 (Schedule Management) - Outlookライクなカレンダー + 協力会社除外日表示
  - **申請番号管理 (Application Number Management)** - 3タブ構成（現地調査依頼・共架添架依頼・工事依頼）+ 進捗管理 + 協力会社への依頼機能 + 表示件数バッジ
  - **依頼一覧 (Contractor Requests)** - 協力会社専用：割り当てられた依頼の確認・進捗更新 + 表示件数バッジ
  - 除外日管理 (My Exclusions) - 協力会社専用の作業不可日時登録
  - アカウント管理 (Account Management) - 管理者・協力会社・班アカウント管理（管理者専用）
- **Exclusion Date Management**: Time-specific exclusions (終日/午前/午後/カスタム時間指定)
- **Outlook-style overlapping layout** for schedules and exclusions with collision detection
- **Progress Tracking System**: 進捗履歴の自動記録と表示（協力会社が更新、管理者が閲覧）
- **Record Count Display**: Visual badges showing filtered/total counts (e.g., "5/10件") positioned in top-right corner of filter panels
- TypeScript path aliases configured (@/* maps to ./src/*)

### Domain-Specific Functionality

This system is built for KCT (倉敷ケーブルテレビ) CATV construction management:

#### Key Business Concepts
- **クロージャ番号**: Fiber optic connection point identifiers
- **共架OR添架許可申請**: Utility pole installation permits (collaboration with 中国電力・NTT)
- **宅内引込工事**: Home wiring construction
- **現状線の種別**: Existing line types (fiber optic, coaxial, metal)
- **小川オーダー表**: Excel-based order management format

#### Contractor & Team Management
- **直営班**: In-house construction team (パワーケーブル)
  - A班, B班
- **栄光電気通信**: External contractor
  - 1班
- **スライヴ**: External contractor
  - 第1班
- **Team-based operations**: Contractors are divided into teams (班) for work assignment and exclusion management
- **Login flow**: Login at contractor level, team selection occurs during exclusion registration

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
- Custom Layout component wraps all pages with Sidebar (`src/shared/components/layout/`)
- Sidebar component manages its own expanded/collapsed state via hover
- **Shared UI Library** (`src/shared/components/ui/`):
  - `Button.tsx` - Unified button component with variants
  - `Badge.tsx` - Status badges with color variants
  - `Modal.tsx` - Modal wrapper using Headless UI Dialog
  - `Input.tsx` - Form input with label
  - `Textarea.tsx` - Form textarea with label
- Icon system uses Heroicons (@heroicons/react/24/outline) and Lucide React
- Modal-based detail editing patterns (using Headless UI Dialog)
- Drag & drop file upload components for Excel/PDF uploads
- CalendarPicker: Reusable date picker with schedule visualization and exclusion display (`src/features/calendar/components/CalendarPicker/`)

### Data Management & State
- **localStorage-first architecture**: All data persisted to browser localStorage (no backend)
- **Initialized on first load**: `AuthProvider` calls initialization functions for all features
- Excel file parsing expected but not yet implemented (orders page has upload UI)
- **localStorage Keys**:
  - `user` - Authentication session
  - `admins`, `contractors`, `teams` - Account management
  - `applications_survey`, `applications_attachment`, `applications_construction` - Application requests
  - `schedules` - Construction schedules
  - `exclusions` - Contractor exclusion dates
  - `orders` - Order data
  - `order_files` - Map PDF files (Base64, separate storage)
- **Storage Modules** (Repository pattern for DBMS migration readiness):
  - `src/features/auth/lib/authStorage.ts` - Authentication CRUD
  - `src/features/contractor/lib/contractorStorage.ts` - Contractor/Team CRUD
  - `src/features/applications/lib/applicationStorage.ts` - Application request CRUD
  - `src/app/schedule/lib/scheduleStorage.ts` - Schedule CRUD
  - `src/app/my-exclusions/lib/exclusionStorage.ts` - Exclusion CRUD
  - `src/app/orders/lib/orderStorage.ts` - Order CRUD
  - `src/app/orders/lib/orderFileStorage.ts` - PDF file management with 2MB limit

### Development Notes
- Development indicators are disabled (devIndicators: false in next.config.ts)
- ESLint configured with Next.js Core Web Vitals rules
- Uses Geist font family for typography (automatically optimized via next/font)
- Strict TypeScript configuration with ES2017 target
- Path alias @/* configured to map to ./src/*
- No tests configured yet

## Code Organization Principles

### Colocation Principle
This codebase follows the **Colocation Principle** - keeping related code together by feature rather than by file type. This improves maintainability and makes the codebase easier to navigate.

### Three-Layer Architecture for `lib/` Folders

The codebase uses a three-layer structure for organizing business logic and utilities:

#### Layer 1: `shared/utils/` - App-wide Utilities
**Purpose**: Domain-agnostic, reusable utility functions used across the entire application.

**Examples**:
```typescript
// shared/utils/formatters.ts
export const formatDateString = (date: Date): string => {
  // Used by all pages for consistent date formatting
}

// shared/utils/validators.ts
export const isValidEmail = (email: string): boolean => {
  // Generic email validation
}

// shared/utils/password.ts
export const generateSimplePassword = (length: number = 10): string => {
  // Password generation for account management
}
```

**Characteristics**:
- No domain knowledge (doesn't know about contractors, schedules, etc.)
- Pure functions with clear input/output
- Could be extracted to a shared npm package

#### Layer 2: `features/*/lib/` - Domain Business Logic
**Purpose**: Domain-specific business logic and data operations for reusable features.

**Examples**:
```typescript
// features/contractor/lib/contractorStorage.ts
export const getContractors = (): Contractor[] => {
  // Contractor-specific CRUD operations
}

// features/calendar/lib/dateUtils.ts
export const getWeekDays = (date: Date): Date[] => {
  // Calendar-specific date operations
}

// features/applications/lib/applicationStorage.ts
export const addProgressEntry = <T>(type: RequestType, id: string, entry: ProgressEntry): void => {
  // Application request progress tracking
}
```

**Characteristics**:
- Domain-aware (uses domain types like Contractor, Application)
- Reusable across multiple pages
- Contains localStorage operations and data transformations

#### Layer 3: `app/*/lib/` - Page-specific Logic
**Purpose**: Logic that is tightly coupled to a specific page's UI and workflow.

**Examples**:
```typescript
// app/schedule/lib/scheduleCalculations.ts
export const calculateOverlappingLayout = (items: CalendarItem[]) => {
  // Outlook-style overlapping layout calculation
  // Only used in schedule page
}

// app/schedule/lib/colorUtils.ts
export const getContractorColor = (contractorName: string): string => {
  // Color mapping for schedule page display
}

// app/orders/lib/fileProcessing.ts
export const processExcelFile = (file: File): Promise<OrderData[]> => {
  // Excel parsing specific to orders page
}
```

**Characteristics**:
- Page-specific (not reused elsewhere)
- Depends on page-specific types and UI structure
- Contains display logic and specialized calculations

### Decision Flow: Where to Put Code?

```
Does the logic work across multiple domains?
  ├─ YES → shared/utils/
  └─ NO → Is it specific to a domain feature?
           ├─ YES → features/*/lib/
           └─ NO → Is it only used on one page?
                    └─ YES → app/*/lib/
```

### Component Organization Guidelines

#### File Size Target
- **1 component = 100-300 lines** (ideal)
- **page.tsx = 150-250 lines** (after refactoring)
- Files over 500 lines should be split

#### Component Splitting Rules
1. **By Responsibility**: One component = one clear purpose
2. **By Reusability**: Shared components go to `shared/components/`, page-specific to `app/*/components/`
3. **By Domain**: Feature-specific components go to `features/*/components/`

#### Naming Conventions
- Components: PascalCase (e.g., `AddScheduleModal.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useScheduleData.ts`)
- Utils: camelCase (e.g., `dateUtils.ts`, `scheduleCalculations.ts`)
- Types: PascalCase interfaces in `types/index.ts`

#### Folder Patterns

**Index Pattern** (for single main component):
```typescript
// components/TeamFilter/index.tsx
export { default } from './TeamFilter'

// Usage
import TeamFilter from '@/app/schedule/components/TeamFilter'
```

**Named Exports** (for multiple related components):
```typescript
// components/ScheduleModals/index.tsx
export { AddScheduleModal } from './AddScheduleModal'
export { EditScheduleModal } from './EditScheduleModal'

// Usage
import { AddScheduleModal, EditScheduleModal } from '@/app/schedule/components/ScheduleModals'
```

### Component Refactoring Status

This project is undergoing systematic refactoring to improve maintainability:

| Page | Status | Current Lines | Components |
|------|--------|---------------|------------|
| applications | ✅ Complete | 222 | 13 components (includes FileAttachments, RequestNotes) |
| contractor-requests | ✅ Complete | 518 | Includes FileAttachments integration |
| schedule | ✅ Complete | 156 | Multiple components, hooks, and lib modules |
| orders | ✅ Complete | 230 | Multiple components, hooks, and lib modules |
| my-exclusions | ✅ Complete | 148 | Multiple components, hooks, and lib modules |
| contractor-management | ⏳ To refactor | 1,005 | 11+ components needed |
| login | ✅ Simple | 114 | Already clean |

**Remaining Work**:
1. **Phase 1**: Contractor management page refactoring (1,005 lines to be split)
2. **Phase 2**: Final integration testing and documentation

**Note**: `src/lib/` directory currently contains:
- `constants.ts` - App-wide constants (may need reorganization)
- `contractorColors.ts` - Contractor color mapping (consider moving to `src/shared/utils/`)

### Custom Hooks Patterns

Extract stateful logic from page components:

```typescript
// hooks/useScheduleData.ts
export function useScheduleData() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])

  const addSchedule = useCallback((schedule: ScheduleItem) => {
    setSchedules(prev => [...prev, schedule])
  }, [])

  return { schedules, addSchedule, updateSchedule, deleteSchedule }
}

// Usage in page.tsx
const { schedules, addSchedule } = useScheduleData()
```

**Hook Naming**:
- Data management: `useXxxData` (e.g., `useScheduleData`, `useOrders`)
- UI state: `useXxxState` (e.g., `useModalState`, `useFilterState`)
- Business logic: `useXxx` (e.g., `useTeamFilters`, `useCalendarNavigation`)

### Import Path Conventions

Always use TypeScript path aliases for cleaner imports:

```typescript
// ✅ Good: Using aliases
import Layout from '@/shared/components/layout/Layout'
import { useScheduleData } from '@/app/schedule/hooks/useScheduleData'
import { getContractors } from '@/features/contractor/lib/contractorStorage'

// ❌ Bad: Relative paths
import Layout from '../../../shared/components/layout/Layout'
```

### When Creating New Pages

Follow this structure for consistency:

```
app/new-page/
├── page.tsx                 # Main page component (target: 150-250 lines)
├── components/              # Page-specific components
│   ├── SomeFeature/
│   │   └── index.tsx
│   └── SomeModal.tsx
├── hooks/                   # Custom hooks for this page
│   ├── usePageData.ts
│   └── usePageLogic.ts
├── lib/                     # Page-specific utilities (if needed)
│   └── pageUtils.ts
├── types/                   # Page-specific types
│   └── index.ts
└── data/                    # Sample/mock data
    └── sampleData.ts
```

## Authentication System

### Architecture
- **Context Provider**: `src/features/auth/components/AuthProvider.tsx` provides global authentication state
- **Storage**: localStorage for session persistence (key: 'user')
- **Protection**: `src/shared/components/layout/Layout/index.tsx` checks authentication and redirects to /login if unauthenticated
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
- **Admin role**: Access to all management pages (ダッシュボード, 工事依頼管理, 工事日程調整, 申請番号管理, 協力会社管理)
- **Contractor role**: Access only to 除外日管理 (my-exclusions page)
- **Sidebar**: Dynamically renders menu items based on user.role
- **Schedule page**: Admin can view exclusions but cannot edit them
- **Contractor Management page**: Admin-only access for managing contractor accounts and teams

### User Context API
```typescript
interface User {
  id: string
  name: string
  contractor: string      // Contractor name
  contractorId: string    // Contractor ID for data filtering
  role: 'admin' | 'contractor'
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}
```

### Authentication Flow
1. User enters username and password
2. System checks if admin (username='admin', password='admin')
3. If not admin, lookup contractor by username using `getContractorByUsername()`
4. Verify password and active status
5. Create User object with contractor information (no team selection at login)
6. Save to localStorage and set in AuthContext
7. Team selection happens later during exclusion registration

## Account Management System

### Overview (src/app/contractor-management/page.tsx)
Admin-only page with tabbed interface for managing:
1. **管理者アカウント (Admin Accounts)** - System administrators who can access all features
2. **協力会社・班管理 (Contractors & Teams)** - External contractors and their team divisions

This is the foundation of the role-based access control and team-based work assignment system.

### Data Model

#### Admin Interface
```typescript
interface Admin {
  id: string              // Unique ID (e.g., "admin-1")
  name: string            // Display name (e.g., "KCT管理者")
  username: string        // Login username (e.g., "admin")
  password: string        // Plain text password (generated or manual)
  createdAt: string       // ISO 8601 timestamp
  isActive: boolean       // Enable/disable admin account
}
```

#### Contractor Interface
```typescript
interface Contractor {
  id: string              // Unique ID (e.g., "contractor-1")
  name: string            // Display name (e.g., "直営班")
  username: string        // Login username (e.g., "chokueihan")
  password: string        // Plain text password (generated or manual)
  createdAt: string       // ISO 8601 timestamp
  isActive: boolean       // Enable/disable contractor account
}
```

#### Team Interface
```typescript
interface Team {
  id: string              // Unique ID (e.g., "team-1")
  contractorId: string    // Parent contractor ID
  teamName: string        // Team name (e.g., "A班", "1班")
  members?: string[]      // Optional: list of team members
  createdAt: string       // ISO 8601 timestamp
  isActive: boolean       // Enable/disable team
}
```

### Key Features

#### Admin Account Management
- **Add new admin**: Create new admin accounts with manual or auto-generated passwords
- **Password mode toggle**: Choose between auto-generated or manual password entry
  - Auto-generate mode: Displays read-only password with regenerate button
  - Manual mode: Text input for custom password
- **Edit admin**: Update name and username (password change via regenerate button)
- **Password management**:
  - Show/hide password toggle in table view
  - Regenerate password button (updates password immediately)
  - Passwords displayed to admin for sharing
- **Activate/deactivate**: Toggle `isActive` flag without deleting
- **Delete admin**: Remove admin account from system

#### Contractor Management
- **Add new contractor**: Generates unique username and password automatically
- **Edit contractor**: Update name, username, password
- **Password management**:
  - Auto-generate secure password using `generateSimplePassword()` (10 chars, mixed case + numbers)
  - Show/hide password toggle
  - Regenerate password button
  - Passwords displayed to admin for sharing with contractors
- **Activate/deactivate**: Toggle `isActive` flag without deleting
- **Delete contractor**: Cascades to delete all associated teams

#### Team Management
- **Nested display**: Teams shown under their parent contractor (accordion style)
- **Add team**: Create new team under specific contractor
- **Edit team**: Update team name
- **Activate/deactivate**: Toggle `isActive` flag
- **Delete team**: Remove team from contractor

### UI Components

#### Contractor List
- Accordion-style expandable sections per contractor
- Displays: Name, Username, Password (with show/hide), Created date, Active status
- Actions: Edit, Regenerate Password, Toggle Active, Delete
- Color-coded active status: Green (active), Red (inactive)

#### Team List (nested under contractor)
- Table layout with: Team Name, Created Date, Active Status
- Actions: Edit, Toggle Active, Delete
- Empty state message when contractor has no teams

#### Modal Forms
1. **Add Contractor Modal**: Name input (username/password auto-generated)
2. **Edit Contractor Modal**: Name, Username, Password inputs
3. **Add Team Modal**: Team name input, contractor pre-selected
4. **Edit Team Modal**: Team name input

### localStorage Operations (src/features/contractor/lib/contractorStorage.ts)

```typescript
// Admin CRUD
getAdmins(): Admin[]
saveAdmins(admins: Admin[]): void
addAdmin(admin: Admin): void
updateAdmin(id: string, updates: Partial<Admin>): void
deleteAdmin(id: string): void
getAdminById(id: string): Admin | undefined
getAdminByUsername(username: string): Admin | undefined

// Contractor CRUD
getContractors(): Contractor[]
saveContractors(contractors: Contractor[]): void
addContractor(contractor: Contractor): void
updateContractor(id: string, updates: Partial<Contractor>): void
deleteContractor(id: string): void  // Also deletes associated teams
getContractorById(id: string): Contractor | undefined
getContractorByUsername(username: string): Contractor | undefined

// Team CRUD
getTeams(): Team[]
saveTeams(teams: Team[]): void
addTeam(team: Team): void
updateTeam(id: string, updates: Partial<Team>): void
deleteTeam(id: string): void
getTeamsByContractorId(contractorId: string): Team[]
getTeamById(id: string): Team | undefined

// Initialization
initializeDefaultData(): void  // Creates default admins/contractors/teams if none exist
```

### Password Generation (src/shared/utils/password.ts)

```typescript
generateSimplePassword(length: number = 10): string
```

**Algorithm**:
1. Ensures at least 1 uppercase letter
2. Ensures at least 1 lowercase letter
3. Ensures at least 1 number
4. Fills remaining characters randomly from all three character sets
5. Shuffles the result using Fisher-Yates algorithm
6. Returns 10-character password (e.g., "aB3xYz7Qm1")

### Default Data

Initialized on first load by `AuthContext` calling `initializeDefaultData()`:

```typescript
Admins:
- KCT管理者 (username: admin, password: admin)

Contractors:
- 直営班 (username: chokueihan, password: password)
- 栄光電気通信 (username: eiko, password: password)
- スライヴ (username: thrive, password: password)

Teams:
- 直営班 → A班, B班
- 栄光電気通信 → 1班
- スライヴ → 第1班
```

### localStorage Keys
- `admins` - Admin account data
- `contractors` - Contractor account data
- `teams` - Team data
- `user` - Currently logged in user session

### Integration with Other Systems

#### Exclusion Registration (src/app/my-exclusions/page.tsx)
- Contractor logs in → `user.contractorId` set
- On exclusion page load → `getTeamsByContractorId(user.contractorId)` fetches available teams
- User selects team from dropdown when registering exclusion
- Exclusion saved with both `contractorId` and `teamId`

#### Schedule Display
- Schedules and exclusions show: "Contractor Name - Team Name"
- Example: "直営班 - A班", "栄光電気通信 - 1班"
- Team information helps identify which specific crew is working/unavailable

### Important Notes

1. **Login Level**: Authentication happens at contractor level, NOT team level
2. **Team Selection**: Teams are selected when registering exclusions, not at login
3. **Data Persistence**: All contractor/team data stored in localStorage (keys: 'admins', 'contractors', 'teams')
4. **Cascade Delete**: Deleting a contractor removes all its teams
5. **Password Security**: Passwords stored in plain text (suitable for demo, not production)
6. **Password Generation**: Uses `generateSimplePassword()` from `src/shared/utils/password.ts`
7. **Form Styling**: All input/select elements MUST include `bg-white text-gray-900` classes

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
  contractorId: string      // Contractor ID for filtering
  teamId: string            // Team ID
  teamName: string          // Team name (A班, 1班, etc.)
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
- **localStorage key**: `exclusions` (single key for all contractors)
- **Persistence**: All exclusion data persisted via `src/app/my-exclusions/lib/exclusionStorage.ts`
- **Initialization**: Default exclusions created on first load by `initializeExclusionData()`
- **CRUD operations**: `add()`, `update()`, `delete()`, `getByContractorId()`, `getByTeamId()`, `getByDate()`

### UI Components

#### My Exclusions Page (src/app/my-exclusions/page.tsx)
- **Team loading**: On page load, fetches teams for logged-in contractor using `getTeamsByContractorId()`
- **Team selection**: Dropdown to select which team the exclusion applies to
- **Calendar view**: Month view with existing exclusions displayed (shows team name)
- **Registration form**: Team selector + date picker + time type selector + reason input
- **Time type selector**: Radio buttons for 終日/午前/午後/カスタム
- **Custom time picker**: Two time inputs (startTime, endTime) when custom is selected
- **Exclusion list**: Table with team name, date, time, reason, and delete action
- **Validation**: Prevents past date registration, ensures startTime < endTime, requires team selection
- **Data filtering**: Only shows exclusions for the logged-in contractor (filters by `contractorId`)

#### Schedule Page Integration (src/app/schedule/page.tsx)
- **Read-only display**: Exclusions shown in all calendar views (月/週/日)
- **Visual distinction**: Red dashed border (border-2 border-dashed border-red-500)
- **Icon**: 🚫 emoji for quick identification
- **Italic text**: Exclusion text displayed in italic style
- **Team display**: Shows "Contractor - Team" format (e.g., "直営班 - A班")
- **Hover info**: Shows contractor, team, time, and reason on hover
- **Data loading**: Loads exclusions from localStorage via `exclusionStorage.getAll()` on mount

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
- `schedules`: Array of ScheduleItem (loaded from localStorage)
- `exclusions`: Array of ExclusionEntry (loaded from localStorage)
- `isModalOpen`: Boolean for new schedule creation modal

## Schedule Page: Data Flow & Integration

### Exclusion Data Loading (src/app/schedule/page.tsx)
Loads all exclusions from localStorage via `exclusionStorage`:

```typescript
useEffect(() => {
  setExclusions(exclusionStorage.getAll())
}, [])
```

### Schedule and Exclusion Rendering
Both are rendered using `calculateOverlappingLayoutWithExclusions` for Outlook-style side-by-side layout when time slots overlap.

### Date Selection UX (Month & Week Views)

**Important**: The schedule page uses a two-step selection process to prevent accidental view changes:

1. **Single Click**: Selects the date (highlighted with blue background `bg-blue-100 ring-2 ring-blue-500`)
   - Selected date is stored in `selectedDateForAdd` state
   - Does NOT change the view mode
   - New registration button shows selected date: "新規登録 (9/15)"
   - Selection can be cleared with "選択解除" button

2. **Double Click**: Navigates to day view for the clicked date
   - Sets `selectedDate` and `currentDate`
   - Changes `viewMode` to 'day'

**Critical**: Always use `formatDateString(date)` instead of `date.toISOString().split('T')[0]` to avoid timezone-related date shifts. The `formatDateString` function ensures correct local date formatting:

```typescript
const formatDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

**New Registration Flow**:
1. User clicks a date in month/week view → Date highlighted
2. User clicks "新規登録" button → Modal opens with selected date pre-filled
3. After saving/canceling → Selection state cleared automatically

**Visual Indicators**:
- **Selected date**: Blue background (`bg-blue-100`) with blue ring (`ring-2 ring-blue-500`)
- **Today's date**: Green ring (`ring-green-400`)
- **Week view selected column**: Entire column highlighted with `bg-blue-50`
- **Week view selected header**: Dark blue background (`bg-blue-200`)

## Order Management: Appointment History System

### Overview (src/app/orders/page.tsx)
The Order Management page includes a comprehensive appointment history tracking system that integrates schedule visibility directly into the appointment modal.

### Appointment History Data Structure
```typescript
interface AppointmentHistory {
  id: string
  date: string                    // ISO 8601 format (YYYY-MM-DDTHH:MM)
  endTime?: string                // HH:MM format for appointment end time
  status: '工事決定' | '保留' | '不通'
  content: string                 // Conversation details/notes
}
```

### Key Features
1. **Appointment List Display**: Shows all appointments with date, time, status, and content
2. **CRUD Operations**: Add, edit, and delete appointment entries
3. **Status Management**: Three status types with color-coded badges
   - 工事決定 (Confirmed): Green badge
   - 保留 (Pending): Yellow badge
   - 不通 (Unreachable): Red badge
4. **Integrated Schedule View**: Calendar showing existing schedules and exclusions to avoid conflicts
5. **Time Range Selection**: Start time and end time pickers for appointment duration

### Appointment Modal Components

#### Customer Information Section
Displays read-only customer details (name, address, phone number) from the selected order.

#### Schedule Calendar Integration
- **Month view calendar**: Shows all scheduled work and exclusions for the selected month
- **Navigation**: Previous/next month buttons
- **Date selection**: Click any date to view detailed schedules for that day
- **Visual indicators**:
  - Schedules: Colored boxes by contractor (blue/green/purple)
  - Exclusions: Red border with 🚫 icon
  - Today's date: Blue ring border
  - Selected date: Blue background
- **Detailed view**: When date is clicked, shows all schedules and exclusions for that date with:
  - Time slots
  - Contractor names
  - Customer information (for schedules)
  - Exclusion reasons (for exclusions)

#### Appointment History List
- Displays all past appointments in chronological order
- Each entry shows:
  - Date and time range (start-end)
  - Status badge (color-coded)
  - Conversation content
  - Edit and delete buttons
- Inline editing: Click "編集" to edit appointment in place
- New appointment form: Click "新規追加" to add new appointment

#### Form Fields
- **Date picker**: Select appointment date (type="date")
- **Start time**: Select appointment start time (type="time")
- **End time**: Select appointment end time (type="time")
- **Status dropdown**: Choose from 工事決定/保留/不通
- **Content textarea**: Enter conversation notes/details

### Sample Data
The page includes sample schedules (`sampleSchedules`) and exclusions (`sampleExclusions`) for demonstration. These are displayed in the appointment modal calendar to help users avoid scheduling conflicts.

### State Management
```typescript
const [appointmentOrder, setAppointmentOrder] = useState<OrderData | null>(null)
const [showAppointmentModal, setShowAppointmentModal] = useState(false)
const [editingAppointment, setEditingAppointment] = useState<AppointmentHistory | null>(null)
const [isAddingAppointment, setIsAddingAppointment] = useState(false)
const [appointmentDate, setAppointmentDate] = useState<string>('')
const [appointmentTime, setAppointmentTime] = useState<string>('')
const [appointmentEndTime, setAppointmentEndTime] = useState<string>('')
const [selectedScheduleDate, setSelectedScheduleDate] = useState<string | null>(null)
const [scheduleCalendarDate, setScheduleCalendarDate] = useState<Date>(new Date())
```

### Key Functions
- `handleViewAppointmentHistory(order)`: Opens appointment modal for selected order
- `handleAddAppointment()`: Initiates new appointment entry
- `handleEditAppointment(appointment)`: Loads existing appointment for editing
- `handleSaveAppointment()`: Saves new or edited appointment to order's appointmentHistory
- `handleDeleteAppointment(appointmentId)`: Removes appointment from history
- `handleScheduleDateClick(date)`: Selects date in calendar to view details
- `navigateScheduleMonth(direction)`: Moves calendar to previous/next month

## CalendarPicker Component

### Overview (src/features/calendar/components/CalendarPicker/index.tsx)
Reusable calendar component used in the appointment history modal for date selection with integrated schedule and exclusion visibility.

### Props Interface
```typescript
interface CalendarPickerProps {
  selectedDate: string                    // Current selected date (YYYY-MM-DD)
  onDateSelect: (date: string) => void    // Callback when date is selected
  onClose: () => void                     // Callback to close picker
  existingSchedules: ScheduleItem[]       // Schedules to display
  exclusions: ExclusionEntry[]            // Exclusions to display
}
```

### Features
- Month view calendar with day-of-week headers (日月火水木金土)
- Displays existing schedules and exclusions on each date
- Color-coded schedule indicators by contractor
- Exclusion indicators with 🚫 emoji
- Today's date highlighting
- Navigation between months
- Selected date highlighting
- Overflow indicator (+N) when multiple items exist

### Visual Design
- **Current month dates**: Full opacity, white background
- **Other month dates**: Gray background, reduced opacity
- **Today**: Blue ring border
- **Selected date**: Blue background
- **Hover effect**: Blue-tinted background on hover
- **Schedule boxes**: Small colored boxes (10px text) with contractor name
- **Exclusion boxes**: Red border with 🚫 icon and contractor name
- **Overflow**: Shows "+N" when more than 2 items on a date

## Schedule Page: Advanced Filtering & Column Layout

### Checkbox-based Team Filtering (Outlook-style)

The schedule page uses a hierarchical checkbox filtering system inspired by Microsoft Outlook:

#### Filter Data Structure
```typescript
interface TeamFilter {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  isVisible: boolean
  color: string          // 'blue' | 'green' | 'purple'
}
```

#### Filter Panel Features
- **Hierarchical checkboxes**: Contractors as parent, teams as children
- **Indeterminate state**: Parent checkbox shows "partially checked" when some teams are selected
- **Multi-selection**: Multiple teams can be displayed simultaneously
- **Visual indicators**: Colored dots next to contractor names
- **Selection counter**: Shows "N/M" (selected/total) in filter button badge
- **Dropdown panel**: Positioned absolutely, z-index 20, max-height with scroll

#### Filter Logic
```typescript
// Filter schedules based on visible teams
const filteredSchedules = useMemo(() => {
  return schedules.filter(schedule => {
    if (teamFilters.length === 0) return true

    // If schedule has teamId, match by teamId
    if (schedule.teamId) {
      return teamFilters.some(f => f.teamId === schedule.teamId && f.isVisible)
    }

    // If no teamId, match by contractor name
    return teamFilters.some(f =>
      f.contractorName === schedule.contractor && f.isVisible
    )
  })
}, [schedules, teamFilters])
```

#### Checkbox State Functions
- `getContractorCheckState(contractorId)`: Returns 'all' | 'some' | 'none'
- `handleToggleAll(checked)`: Toggle all teams
- `handleToggleContractor(contractorId, checked)`: Toggle all teams under contractor
- `handleToggleTeam(teamId, checked)`: Toggle individual team

### Day View: Column-based Layout

When viewing a single day, schedules are displayed in columns by team rather than overlapping.

#### Design Principles
- **Time column**: Fixed on left (3.75rem width, sticky positioning)
- **Team columns**: One column per visible team
- **Responsive width**:
  - 1-5 columns: Flex layout fills screen width
  - 6+ columns: Fixed 180px width with horizontal scroll
- **rem-based units**: All measurements in rem for cross-device compatibility

#### Constants
```typescript
const HOUR_HEIGHT = 4           // 1 hour = 4rem (64px at default font size)
const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR = 18
```

#### Column Width Configuration
```typescript
const getColumnWidthConfig = useMemo(() => {
  const columnCount = visibleColumns.length
  if (columnCount === 0) {
    return { useFlex: false, minWidth: '180px' }
  }
  if (columnCount <= 5) {
    // 1-5 columns: Flex layout fills screen
    return { useFlex: true, minWidth: '200px' }
  } else {
    // 6+ columns: Fixed width with horizontal scroll
    return { useFlex: false, minWidth: '180px' }
  }
}, [visibleColumns.length])
```

#### Column Definition
```typescript
interface ColumnDefinition {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  color: string
  displayName: string      // "Contractor - Team"
  isVisible: boolean
}

// Generate visible columns from filters
const visibleColumns = useMemo(() => {
  return teamFilters
    .filter(f => f.isVisible)
    .map(f => ({
      contractorId: f.contractorId,
      contractorName: f.contractorName,
      teamId: f.teamId,
      teamName: f.teamName,
      color: f.color,
      displayName: `${f.contractorName} - ${f.teamName}`,
      isVisible: true
    }))
}, [teamFilters])
```

#### Position Calculation (rem-based)
```typescript
// Calculate top position in rem
const calculateScheduleTop = (timeSlot: string): string => {
  if (timeSlot === '終日') return '0rem'

  const [startTime] = timeSlot.split('-')
  const [hour, minute] = startTime.split(':').map(Number)
  const minutesFromStart = (hour - BUSINESS_START_HOUR) * 60 + minute

  return `${(minutesFromStart / 60) * HOUR_HEIGHT}rem`
}

// Calculate height in rem
const calculateScheduleHeight = (timeSlot: string): string => {
  if (timeSlot === '終日') {
    return `${(BUSINESS_END_HOUR - BUSINESS_START_HOUR) * HOUR_HEIGHT}rem`
  }

  const [startTime, endTime] = timeSlot.split('-')
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  const durationMinutes = endMinutes - startMinutes

  return `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 2)}rem`
}
```

#### Layout Structure
```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ Time (3.75) │ Team 1 (flex)│ Team 2 (flex)│ Team 3 (flex)│
│   (fixed)   │              │              │              │
├─────────────┼──────────────┼──────────────┼──────────────┤
│   9:00      │  Schedule A  │              │  Exclusion X │
│   10:00     │              │  Schedule B  │              │
│   11:00     │  Schedule C  │              │              │
│   ...       │              │              │              │
└─────────────┴──────────────┴──────────────┴──────────────┘
```

#### Data Organization
```typescript
// Group schedules by team
const schedulesByColumn = useMemo(() => {
  const grouped: Record<string, ScheduleItem[]> = {}

  visibleColumns.forEach(col => {
    grouped[col.teamId] = filteredSchedules.filter(s =>
      s.teamId === col.teamId ||
      (!s.teamId && s.contractor === col.contractorName)
    ).filter(s => s.assignedDate === formatDateString(currentDate))
  })

  return grouped
}, [visibleColumns, filteredSchedules, currentDate])

// Group exclusions by team
const exclusionsByColumn = useMemo(() => {
  const grouped: Record<string, ExclusionEntry[]> = {}

  visibleColumns.forEach(col => {
    grouped[col.teamId] = exclusions.filter(e =>
      e.teamId === col.teamId &&
      e.date === formatDateString(currentDate)
    )
  })

  return grouped
}, [visibleColumns, exclusions, currentDate])
```

#### Styling Notes
- **Time column**: `sticky left-0 z-20`, gray background, 2px right border
- **Team columns**: Relative positioning, border-right for grid lines
- **Grid lines**: Absolute positioned divs with `border-b border-gray-100`
- **Schedule bars**: Absolute positioned with calculated top/height in rem
- **Z-index**: Exclusions at z-10+, schedules at z-1+

### Cross-Device Compatibility

#### Why rem units?
- **Respects user browser settings**: Users who increase default font size get proportionally larger UI
- **Consistent across zoom levels**: UI maintains correct proportions when zooming
- **Predictable scaling**: 1rem = user's browser font size (typically 16px)
- **Avoids SSR issues**: No need for window.innerWidth or resize listeners

#### Conversion Reference
At default browser font size (16px):
- `3.75rem` = 60px (time column width)
- `4rem` = 64px (one hour height)
- `200px` min-width for flex columns
- `180px` min-width for fixed columns

### Integration with Filtering
- **Filter changes**: Automatically update `visibleColumns` via useMemo
- **Column removal**: Unchecking team removes its column immediately
- **Column addition**: Checking team adds column to the right
- **Empty state**: Shows message when all teams are filtered out
- **Persistence**: Filter state maintained in component state (not localStorage yet)

## Application Request Management System

### Overview (src/app/applications/)

The application management system handles three types of requests with unified progress tracking:
1. **Survey Requests (現地調査依頼)** - Field surveys for CATV installation planning
2. **Attachment Requests (共架・添架依頼)** - Utility pole attachment permit applications
3. **Construction Requests (工事依頼)** - Construction work orders

### Data Model (src/features/applications/types/index.ts)

#### Request Types
```typescript
type RequestType = 'survey' | 'attachment' | 'construction'
type AssigneeType = 'internal' | 'contractor'
```

#### Base Structure
All requests extend `RequestBase`:
- Basic info: serialNumber, orderNumber, contractNo, customerCode, customerName, address, phoneNumber
- Assignment: assigneeType, contractorId, contractorName, teamId, teamName
- Dates: requestedAt, scheduledDate, completedAt
- Progress tracking: progressHistory, lastUpdatedBy, lastUpdatedByName

#### Progress History
```typescript
interface ProgressEntry {
  id: string
  timestamp: string              // ISO 8601
  updatedBy: string              // User/contractor ID
  updatedByName: string          // Display name
  updatedByTeam?: string         // Team name
  status: string                 // Updated status
  comment?: string               // Progress comment
  photos?: string[]              // Attached photos
}
```

#### Type-Specific Fields

**Survey Request:**
- Status: '未着手' | '調査中' | '完了' | 'キャンセル'
- surveyItems: Checklist of survey tasks
- surveyResult: Findings (closure number, line type, notes, photos)
- intermediateReport: Mid-progress report with rate, findings, issues

**Attachment Request:**
- Status: '受付' | '調査済み' | '完了'
- submittedAt, approvedAt: Application dates
- withdrawNeeded, withdrawCreated: Withdrawal flags
- postConstructionReport: boolean (true: 必要, false: 不要)
- detail: Application details (line type, mount height, photos)
- preparationStatus: Document/photo readiness, expected submit date

**Construction Request:**
- Status: '未着手' | '施工中' | '完了' | '保留'
- constructionType: Work category
- constructionDate: Scheduled work date
- constructionResult: Completion details (actual date, work hours, materials, photos)
- workProgress: Mid-work status (progress rate, current phase, completion estimate, issues)

### Admin Flow (src/app/applications/page.tsx)

#### Creating Requests
1. Click "新規依頼" button
2. Select request type tab (survey/attachment/construction)
3. Fill in customer information
4. **Assignment Selection**:
   - Radio: "自社（直営班）" or "協力会社"
   - If 自社: Select team from 直営班's teams
   - If 協力会社: Select contractor → select team (2-stage dropdown)
5. Add type-specific details
6. Save creates request with initial status

#### Viewing Progress
- Edit any request to see progress history at bottom
- Progress history shows:
  - Timestamp with user/contractor/team name
  - Status changes
  - Comments from contractors
  - Photos (if any)

#### Components Structure
```
applications/
├── page.tsx                    # Main page with tab navigation
└── components/
    ├── SurveyTab.tsx          # Survey requests table
    ├── AttachmentTab.tsx      # Attachment requests table
    ├── ConstructionTab.tsx    # Construction requests table
    ├── NewRequestModal.tsx    # Create new request with contractor selection
    ├── EditSurveyModal.tsx    # Edit survey + view progress history
    ├── EditAttachmentModal.tsx
    ├── EditConstructionModal.tsx
    └── ProgressHistory.tsx    # Displays progress entries with timeline
```

### Contractor Flow (src/app/contractor-requests/page.tsx)

#### Access Control
- Only accessible by users with `role: 'contractor'`
- Automatically filters to show only requests assigned to logged-in contractor
- Team filter dropdown if contractor has multiple teams

#### Updating Progress
1. View assigned requests in table (filtered by contractorId + teamId)
2. Click "進捗更新" button
3. Modal shows:
   - Request basic info (read-only)
   - Status dropdown (type-specific options)
   - Progress comment textarea (required)
   - Photo upload (future feature)
4. On save:
   - Updates request status
   - Adds progress entry via `addProgressEntry()`
   - Entry includes: timestamp, updatedBy (contractorId), updatedByName, updatedByTeam, status, comment

#### Progress Entry Creation
Automatically records:
- Who updated (contractor name + team name)
- When (ISO timestamp)
- New status
- Comment explaining the progress

### localStorage Operations (src/features/applications/lib/applicationStorage.ts)

#### Storage Keys
- `applications_survey` - Survey requests
- `applications_attachment` - Attachment requests
- `applications_construction` - Construction requests

#### Key Functions
```typescript
// CRUD operations
getApplications<T>(type): T[]
saveApplications<T>(type, applications): void
addApplication<T>(application): void
updateApplication<T>(type, id, updates): void
deleteApplication(type, id): void
getNextSerialNumber(type): number

// Progress tracking
addProgressEntry<T>(type, id, entry): void
  - Adds new progress entry to progressHistory array
  - Updates lastUpdatedBy and lastUpdatedByName
  - Updates updatedAt timestamp

getProgressHistory(type, id): ProgressEntry[]
  - Returns all progress entries for a request
```

#### Data Initialization
`initializeApplicationData()` creates sample data for all three request types on first load.

### Role-Based Menu Items

**Admin:**
- ダッシュボード, 工事依頼管理, 工事日程調整, **申請番号管理**, アカウント管理

**Contractor:**
- **依頼一覧** (new), 除外日管理

### Workflow Example

1. **Admin creates survey request**:
   - Assigns to 栄光電気通信 - 1班
   - Status: 未着手
   - Request stored in `applications_survey`

2. **Contractor (栄光電気通信) logs in**:
   - Views request in 依頼一覧 page
   - Clicks 進捗更新
   - Changes status to 調査中
   - Adds comment: "現地調査開始しました"
   - Progress entry created with contractor/team info

3. **Contractor updates progress**:
   - Later updates status to 完了
   - Adds comment: "調査完了。報告書提出済み。"
   - New progress entry added

4. **Admin reviews**:
   - Opens request in 申請番号管理
   - Sees progress history with all contractor updates
   - Can see who did what and when

### Important Implementation Notes

1. **Progress History is Append-Only**: Never modify existing entries, always add new ones
2. **Team Selection at Request Creation**: Unlike exclusions (where team is selected at registration), requests have teamId set during creation
3. **Contractor Filtering**: Contractor users see only requests where `contractorId` matches their ID AND `teamId` matches selected team
4. **Status Auto-completion**: When status changes to "完了", `completedAt` is auto-set to current date
5. **Progress Comments are Required**: Contractors must provide context when updating status
6. **Type Safety**: Use type-specific functions when possible (getSurveyRequests, getAttachmentRequests, getConstructionRequests)

## File Attachments & Request Notes System

### Overview
Bidirectional file attachment and request notes functionality for application management system. Allows admins and contractors to exchange files and communicate instructions.

### Data Model

#### AttachedFile Interface
```typescript
interface AttachedFile {
  id: string                    // Unique file ID
  fileName: string              // Original filename
  fileSize: number              // File size in bytes
  fileType: string              // MIME type (e.g., "application/pdf")
  fileData: string              // Base64 encoded file data
  uploadedBy: string            // User/contractor ID
  uploadedByName: string        // Display name
  uploadedByRole: 'admin' | 'contractor'
  uploadedAt: string            // ISO 8601 timestamp
  description?: string          // Optional file description
}

interface FileAttachments {
  fromAdmin: AttachedFile[]     // Files uploaded by admin
  fromContractor: AttachedFile[] // Files uploaded by contractor
}

interface RequestNotes {
  adminNotes?: string           // Admin instructions to contractor
  contractorNotes?: string      // Contractor notes (future use)
}
```

### Key Components

#### FileAttachments Component
Location: `src/app/applications/components/FileAttachments/`

**2-Column Layout**:
- **Left (blue background)**: Received files (read-only)
  - Admin sees: Files from contractor
  - Contractor sees: Files from admin
- **Right (green background)**: Sent files (with upload/delete)
  - Admin sends to: Contractor
  - Contractor submits to: Admin

**Sub-components**:
- `FileItem.tsx`: Individual file display with icons, size, date, download/delete actions
- `FileList.tsx`: List container with empty state
- `FileUploadZone.tsx`: Drag & drop upload area with validation
- `index.tsx`: Main component with 2-column layout

#### RequestNotes Component
Location: `src/app/applications/components/RequestNotes/`

**Role-based Display**:
- **Admin**: Editable textarea for entering instructions
- **Contractor**: Yellow box with read-only admin instructions

### Storage Operations

Located in: `src/features/applications/lib/applicationStorage.ts`

```typescript
// File operations
uploadFileToRequest(type, requestId, file, uploadedBy, uploadedByName, uploadedByRole): Promise<void>
  - Converts File to Base64
  - Creates AttachedFile object
  - Adds to appropriate array (fromAdmin or fromContractor)
  - Saves to localStorage

deleteFileFromRequest(type, requestId, fileId, source): void
  - Removes file from specified source array
  - Updates localStorage

downloadFile(file: AttachedFile): void
  - Creates download link from Base64 data
  - Triggers browser download

updateRequestNotes(type, requestId, adminNotes): void
  - Updates request notes
  - Admin-only operation
```

### Integration Points

**Modals with File Attachments** (5 locations):
1. `NewRequestModal.tsx` - Create request with initial files
2. `EditSurveyModal.tsx` - Survey request editing
3. `EditAttachmentModal.tsx` - Attachment request editing
4. `EditConstructionModal.tsx` - Construction request editing
5. `ContractorRequestsPage.tsx` - Progress update modal

**Common Implementation Pattern**:
```typescript
const [formData, setFormData] = useState<ApplicationRequest>(item)
const [uploadingFiles, setUploadingFiles] = useState(false)
const { user } = useAuth()

const handleFileUpload = async (files: File[]) => {
  // Convert files to Base64
  // Add to formData.attachments
  // Update state
}

const handleFileDelete = (fileId: string) => {
  // Remove from appropriate array
  // Update state
}

const handleFileDownload = (file: AttachedFile) => {
  downloadFile(file)
}
```

### File Upload Specifications

**Validation**:
- Max file size: 10MB (default, configurable)
- Max files per upload: 10 (default, configurable)
- Supported types: Images, PDF, Excel (.xlsx, .xls), Word (.doc, .docx)

**Upload Methods**:
- Drag & drop
- Click to select files
- Multiple file selection supported

**Visual Feedback**:
- Upload progress indicator
- Drag-over state highlighting
- File type icons (PDF, image, Excel, Word)
- File size formatting (KB/MB)

### Workflow Examples

#### Admin → Contractor File Send
1. Admin creates/edits request in applications page
2. Uploads files via FileAttachments component
3. Files saved to `fromAdmin` array
4. Contractor views request in contractor-requests page
5. Sees files in left column (received files, blue background)
6. Can download but not delete admin files

#### Contractor → Admin File Submit
1. Contractor opens progress update modal
2. Uploads files via FileAttachments component
3. Files saved to `fromContractor` array
4. Admin views request in applications page
5. Sees files in left column (received files from contractor)
6. Can download but not delete contractor files

#### Request Notes Usage
1. Admin creates request
2. Fills in RequestNotes textarea with instructions
3. Example: "クロージャ番号CL-123付近を重点的に確認してください"
4. Contractor opens progress update modal
5. Sees yellow box with admin instructions at top
6. Follows instructions and submits progress

### localStorage Storage

**File Storage**:
- Files stored as Base64 strings in `attachments.fromAdmin` and `attachments.fromContractor`
- Stored within request objects in `applications_survey`, `applications_attachment`, `applications_construction` keys
- No separate file storage keys

**Size Considerations**:
- localStorage limit: ~5-10MB per domain (browser-dependent)
- Base64 encoding increases file size by ~33%
- Consider file size limits to avoid localStorage quota errors
- 10MB original file → ~13.3MB Base64 → may exceed localStorage limits

### Important Notes

1. **Base64 Encoding**: All files converted to Base64 for localStorage storage
2. **Bidirectional Access**: Each party can only delete their own files
3. **Read-Only Received Files**: Files from other party are read-only
4. **Role-Based UI**: Component automatically adjusts based on user.role
5. **Modal Integration**: All 5 modals follow same pattern for consistency
6. **localStorage Limits**: Monitor file sizes to avoid quota issues
7. **No Backend**: All file data stored client-side in Base64 format

## Record Count Display System

### Overview
Visual badges showing filtered and total record counts, positioned consistently in the top-right corner of filter panels.

### Design Specifications

**Visual Style**:
- Badge component with Info icon style (blue background, white text)
- Format: "N/M件" (N = filtered count, M = total count)
- Positioned absolutely in top-right corner of parent container
- Styling: `bg-blue-600 text-white text-xs px-2 py-1 rounded-full`

**Positioning Pattern**:
```typescript
// Parent container
<div className="relative">
  {/* Filter controls */}

  {/* Record count badge - top-right */}
  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
    {filteredCount}/{totalCount}件
  </div>
</div>
```

### Implementation Locations

1. **Application Management Page** (`src/app/applications/page.tsx`)
   - 3 tabs (Survey, Attachment, Construction)
   - Each tab displays filtered/total count in top-right
   - Updates dynamically with filter changes

2. **Contractor Requests Page** (`src/app/contractor-requests/page.tsx`)
   - Shows assigned requests count
   - Filters by team selection
   - Badge updates when team filter changes

### Usage Guidelines

**When to use**:
- Tables with filtering functionality
- Lists that can be filtered by multiple criteria
- Any data view where users need to understand filtered results

**What to display**:
- Filtered count (left): Number of visible records after filters applied
- Total count (right): Total number of records in dataset
- Example: "5/10件" means 5 visible out of 10 total

**Positioning**:
- Always top-right corner of filter panel or table header
- Use absolute positioning within relative parent
- Ensure badge doesn't overlap with interactive elements

## Order Management: localStorage Persistence

### Overview
工事依頼データと地図PDFファイルをlocalStorageで管理。ファイルサイズ制限（2MB）とファイル分離パターンを採用。

### Storage Architecture

#### Order Data Storage (`src/app/orders/lib/orderStorage.ts`)
- **localStorage key**: `orders`
- **CRUD operations**: `getAll()`, `add()`, `update()`, `delete()`, `getByOrderNumber()`
- **Appointment history**: `addAppointmentHistory()`, `updateAppointmentHistory()`, `deleteAppointmentHistory()`
- **Default data**: 3 sample orders initialized on first load via `initializeOrderData()`

#### File Storage (`src/app/orders/lib/orderFileStorage.ts`)
- **localStorage key**: `order_files` (separate from order data)
- **File format**: Base64 encoded PDF
- **Size limits**:
  - Maximum: 2MB (`FILE_SIZE_LIMITS.MAX_SIZE`)
  - Warning: 1.5MB (`FILE_SIZE_LIMITS.WARNING_SIZE`)
- **Validation**: `validateFileSize()` checks before upload
- **Operations**: `uploadFile()`, `downloadFile()`, `delete()`, `getByOrderNumber()`

#### Data Model Changes
- `OrderData.mapPdfPath` → `OrderData.mapPdfId` (file reference by ID)
- `OrderFile` interface for file metadata
- Files stored separately to prevent order data bloat

### File Separation Pattern
注文データとPDFファイルを別々のlocalStorageキーで管理する理由：
- **データサイズの肥大化を防止**: 注文データはテキスト情報のみ、PDFは別管理
- **ファイル操作の独立性向上**: ファイルCRUDが注文データに影響しない
- **将来のDBMS移行時の柔軟性確保**: ファイルストレージとデータストレージを分離できる

### DBMS Migration Readiness
- **Repository pattern採用**: ストレージ層を抽象化
- **1-3ヶ月後の移行を想定**: PostgreSQL/MySQL移行時にAPI呼び出しに切り替えやすい設計
- **ファイルストレージ**: 将来はAWS S3やCloudinaryなどに移行可能
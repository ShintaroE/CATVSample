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
│   ├── contractor-management/ # 協力会社・班管理ページ（管理者専用）
│   ├── login/              # ログインページ
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # ダッシュボードページ（KPI表示）
│   └── globals.css         # Global styles (Tailwind)
├── components/
│   ├── Layout.tsx          # Main layout wrapper with sidebar & auth check
│   ├── Sidebar.tsx         # Navigation sidebar with role-based menus
│   └── CalendarPicker.tsx  # Reusable calendar component
├── contexts/
│   └── AuthContext.tsx     # Authentication context provider
├── lib/
│   ├── contractors.ts      # Contractor & team CRUD operations (localStorage)
│   └── password-generator.ts # Password generation utility
└── types/
    └── contractor.ts       # TypeScript interfaces for contractor system
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
  - アカウント管理 (Account Management) - 管理者・協力会社・班アカウント管理（管理者専用）
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
- Custom Layout component wraps all pages with Sidebar
- Sidebar component manages its own expanded/collapsed state via hover
- Icon system uses Heroicons (@heroicons/react/24/outline) for UI
- Modal-based detail editing patterns (using Headless UI Dialog)
- Drag & drop file upload components for Excel/PDF uploads
- CalendarPicker: Reusable date picker with schedule visualization and exclusion display (used in orders page appointment modal)

### Data Management & State
- All data is stored in component state (useState) - no backend/database yet
- Sample/mock data initialized in each page component
- Excel file parsing expected but not yet implemented (orders page has upload UI)
- PDF uploads stored as data URLs in state
- Authentication data persisted in localStorage (key: 'user', client-side only)
- **Contractor & Team data**: Persisted to localStorage (keys: 'contractors', 'teams')
  - Initialized with default data on first load via `initializeDefaultData()`
  - Full CRUD operations available through `src/lib/contractors.ts`
- **Exclusion data**: Currently stored only in component state (not persisted to localStorage yet)

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

### localStorage Operations (src/lib/contractors.ts)

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

### Password Generation (src/lib/password-generator.ts)

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
3. **Data Persistence**: All contractor/team data stored in localStorage (keys: 'contractors', 'teams')
4. **Cascade Delete**: Deleting a contractor removes all its teams
5. **Password Security**: Passwords stored in plain text (suitable for demo, not production)
6. **Form Styling**: All input/select elements MUST include `bg-white text-gray-900` classes

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
- **Not yet implemented**: Exclusion data is currently stored only in component state (useState)
- Refreshing the page will lose all exclusion entries
- Future implementation will use localStorage with pattern: `exclusions_${contractor}`

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
- **Data loading**: Loads exclusions from localStorage on mount (future implementation)

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
- `exclusions`: Array of ExclusionEntry (sample data, not persisted)
- `isModalOpen`: Boolean for new schedule creation modal

## Schedule Page: Data Flow & Integration

### Exclusion Data Loading (src/app/schedule/page.tsx)
Currently uses sample data (`sampleExclusions`) in component state. Future implementation will load from localStorage:

```typescript
// Current: Sample data
const [exclusions] = useState<ExclusionEntry[]>(sampleExclusions)

// Future: Load from all contractors
useEffect(() => {
  const allExclusions = contractors.flatMap(contractor => {
    const data = localStorage.getItem(`exclusions_${contractor}`)
    return data ? JSON.parse(data) : []
  })
  setExclusions(allExclusions)
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

### Overview (src/components/CalendarPicker.tsx)
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
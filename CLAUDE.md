# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

### Initial Setup
```bash
npm install              # Install dependencies
npm run dev              # Start development server (http://localhost:3000)
```

On first launch, sample data is automatically initialized in localStorage via `AuthProvider`.

### Essential Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server (requires `npm run build` first)
- `npm run lint` - Check code quality with ESLint

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
│   ├── data/            # Sample/demo data (single source of truth)
│   │   ├── accounts.ts  # Admin/contractor/team demo accounts
│   │   ├── applications.ts  # Sample application requests
│   │   ├── orders.ts    # Sample order data
│   │   └── schedules.ts # Sample schedule/exclusion data
│   ├── database/        # PostgreSQL schema definitions (migration ready)
│   │   ├── README.md    # Detailed migration guide
│   │   ├── create_all_tables.sql  # All tables creation script
│   │   └── tables/      # Individual table DDL files (01-12)
│   └── utils/           # formatters, validators, password, constants
│
├── features/            # Layer 2: Domain business logic
│   ├── auth/            # Authentication (authStorage.ts)
│   ├── contractor/      # Contractors & Teams (contractorStorage.ts)
│   ├── applications/    # Application requests (applicationStorage.ts)
│   ├── admin/           # Admin-specific features
│   │   └── contractor-management/  # Account management components & hooks
│   └── calendar/        # Calendar type definitions & components
│       ├── types/       # ALL calendar-related types (ScheduleItem, ExclusionEntry, ViewMode, etc.)
│       └── components/  # CalendarPicker component
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
Shared hooks         → app/*/hooks/ (when used across multiple tabs/components)
Calendar types       → features/calendar/types/ (NEVER create app/*/types for calendar types)
```

**CRITICAL: Type Definition Location Rules**
- **All calendar-related types** (ScheduleItem, ExclusionEntry, ViewMode, TeamFilter, etc.) → `features/calendar/types/index.ts`
- **Never** create `app/schedule/types` or any app-level types directory for calendar types
- All app layers import from `@/features/calendar/types` (not relative paths like `../types`)
- This prevents app-layer cross-dependencies and maintains clean architecture

**Component targets:**
- Component: 100-300 lines
- page.tsx: 150-250 lines
- Files >500 lines should be split

**Naming conventions:**
- Components: PascalCase (`AddScheduleModal.tsx`)
- Hooks: `useXxxData`, `useXxxState`, `useXxx`, `useXxxFilters`
- Utils: camelCase (`dateUtils.ts`, `filterUtils.ts`)
- Types: `types/index.ts`

**Performance Guidelines:**
- **useMemo**: Use ONLY for heavy operations (array filtering O(n), localStorage I/O, complex calculations)
- **No useMemo**: For lightweight calculations (O(1) operations, simple conditionals, variable assignments)
- **useEffect**: Required for data fetching, subscriptions, authentication checks, and props synchronization
- **Avoid useEffect**: For derived state that can be computed directly from props/state

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

## Database Schema (PostgreSQL Migration Ready)

### Schema Definition Location
All database table definitions are in `src/shared/database/`:
```
src/shared/database/
├── README.md              # Detailed migration guide
├── create_all_tables.sql  # Single script to create all tables
└── tables/                # Individual table DDL files
    ├── 01_admins.sql
    ├── 02_contractors.sql
    ├── 03_teams.sql
    ├── 04_orders.sql
    ├── 05_order_files.sql
    ├── 06_appointment_histories.sql
    ├── 07_application_requests.sql
    ├── 08_progress_histories.sql
    ├── 09_attached_files.sql
    ├── 10_schedules.sql
    ├── 11_exclusions.sql
    └── 12_assigned_teams.sql
```

### Database Setup (PostgreSQL)
```bash
# Create database
createdb catv_management

# Connect and create all tables
psql catv_management -f src/shared/database/create_all_tables.sql

# Or create tables individually
psql catv_management -f src/shared/database/tables/01_admins.sql
```

### Key Design Decisions

**1. Unified Application Requests Table**
- All 3 request types (survey/attachment/construction) in single `application_requests` table
- `type` column distinguishes request types
- Shared columns for common data, type-specific columns nullable

**2. JSONB for Dynamic Data**
- `orders.additional_costs`, `additional_notes`, `collective_construction_info`
- `application_requests.feasibility_result`, `application_report`
- `appointment_histories.schedule_info`

**3. File Storage Evolution**
- **Phase 1 (Current)**: Base64 in DB (`order_files.file_data` max 2MB, `attached_files.file_data` max 10MB)
- **Phase 2 (Future)**: AWS S3/Cloudinary URLs

**4. Multi-Team Assignment**
- `schedules` (1) ↔ (many) `assigned_teams` relationship
- Supports multiple teams per schedule

**5. Append-Only Progress History**
- `progress_histories` table never updates/deletes, only inserts
- Complete audit trail preservation

### localStorage → PostgreSQL Mapping

| localStorage Key | PostgreSQL Table | Notes |
|-----------------|------------------|-------|
| `user` | `admins` or `contractors` | Session stored separately |
| `admins` | `admins` | Admin accounts |
| `contractors` | `contractors` | Contractor accounts |
| `teams` | `teams` | Team master data |
| `applications_survey` | `application_requests` | `type='survey'` |
| `applications_attachment` | `application_requests` | `type='attachment'` |
| `applications_construction` | `application_requests` | `type='construction'` |
| `schedules` | `schedules` + `assigned_teams` | Multi-team support |
| `exclusions` | `exclusions` | Contractor exclusion dates |
| `orders` | `orders` | Order master |
| `order_files` | `order_files` | Map PDFs (Base64 → URL in Phase 2) |

### Migration Strategy
**Phase 1**: DB schema definition (✅ Complete)
**Phase 2**: Backend API + Repository pattern (⏳ Planned in 1-3 months)
**Phase 3**: File storage externalization (S3/Cloudinary)

**Security Requirements for Phase 2:**
- Password hashing with bcrypt (currently plain text)
- Prepared statements for SQL injection prevention
- Input validation and sanitization

See [src/shared/database/README.md](src/shared/database/README.md) for detailed schema documentation.

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
   - Statuses: 依頼済み, 調査日決定, 完了, キャンセル
2. **Attachment (共架・添架依頼)**: Utility pole attachment permits
   - Statuses: 依頼済み, 調査済み, **依頼完了**, 申請中, 申請許可, 申請不許可, キャンセル
   - **Contractor survey status tracking:** Contractors can mark survey status (未調査/調査済み) which affects final status
3. **Construction (工事依頼)**: Construction work orders
   - Statuses: 未着手, 依頼済み, 工事日決定, 完了, 工事返却, 工事キャンセル

**Key Features:**
- Bidirectional file attachments (admin ↔ contractor)
- Request notes (admin instructions to contractor)
- Progress tracking with append-only history
- **Team assignment:** Survey/Construction require team selection; Attachment is contractor-level only (no team filter)

**Attachment Request Workflow:**
- Contractor selects survey status (未調査/調査済み) + progress status (未完了/完了)
- Status logic: 調査済み + 完了 → 依頼完了 | 調査済み + 未完了 → 調査済み | 未調査 → 依頼済み
- UI constraint: Cannot select "完了" when survey status is "未調査"

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

### Kana Search & Filtering
- **Hiragana to Katakana conversion**: `hiraganaToKatakana()` in `src/shared/utils/formatters.ts`
- Allows users to search katakana fields (顧客名カナ, 集合住宅名カナ) using hiragana input
- **Implementation**: Convert search input to katakana before filtering
- **Example**: User types "たなか" → automatically matches "タナカ"
- **Usage in filters**: Applications page (PR#65), Orders page phoneNumber/customerNameKana filters

### File Upload Specs
- Max file size: 10MB (configurable)
- Max files per upload: 10
- Supported: Images, PDF, Excel (.xlsx, .xls), Word (.doc, .docx)
- Methods: Drag & drop, click to select, multiple selection

### CSV Export Pattern (Orders Page)
Orders page includes comprehensive CSV export functionality with application data aggregation:
- **Encoding**: UTF-8 with BOM (Excel-compatible, prevents garbled characters)
- **Format**: 54 columns total (21 + 1 + 10 + 1 + 10 + 1 + 10)
  - Base order info (21 columns): 受注番号, 受注元, 個別/集合, 工事種別, 顧客コード, 顧客名, 顧客名（カナ）, 顧客タイプ, 電話番号, 住所, 工事日, クロージャ番号, 集合コード, 集合住宅名, 集合住宅名（カナ）, 現地調査ステータス, 共架・添架ステータス, 工事ステータス, 受注ステータス, キャンセル日, キャンセル理由
  - Section separator (1 column)
  - Survey requests (10 columns): 申請番号, ステータス, 協力会社, 班名, 調査予定日, 調査完了日, 工事可否判定, 判定報告日時, 依頼日, 進捗履歴最終更新日時
  - Section separator (1 column)
  - Attachment requests (10 columns): 申請番号, ステータス, 協力会社, 班名, 依頼日, 申請提出日, 許可日, 調査完了日, 申請有無報告日時, 進捗履歴最終更新日時
  - Section separator (1 column)
  - Construction requests (10 columns): 申請番号, ステータス, 協力会社, 班名, 工事種別, 工事依頼日, 工事予定日, 工事完了日, 工事日設定日時, 進捗履歴最終更新日時
- **Multiple applications handling**: When an order has multiple applications of the same type, creates separate rows
- **Filename**: `工事依頼_YYYYMMDD_HHMMSS.csv`
- **Implementation**:
  - `src/app/orders/lib/csvExport.ts` - Core CSV generation with application aggregation logic
  - `src/app/orders/components/CsvExportButton.tsx` - Export button component
  - Automatically disabled when filtered data is empty
  - Shows loading state during export
  - Aggregates data from `applications_survey`, `applications_attachment`, `applications_construction` localStorage keys

**Known Issue**: React hydration warning due to nested buttons in FilterPanel (button inside accordion button). Functionality works correctly but violates HTML spec. Fix planned for future PR.

### Search Button Pattern (Unified)
All filter panels use a search button pattern with input/search state separation:

**Pattern 1: FilterableTableLayout (Applications pages)**
```typescript
import { useApplicationFilters } from '@/app/applications/hooks/useApplicationFilters'

const {
  inputFilters,        // Input state (not applied until search)
  searchFilters,       // Applied filters (used in useMemo)
  updateInputFilter,   // Update input state
  executeSearch,       // Apply filters (inputFilters → searchFilters)
  clearInputFilters,   // Clear input only
  isSearching,         // Loading state
  baseFilteredData,    // Pre-filtered data
  activeFilterCount,   // Count of active filters
} = useApplicationFilters(data)

// FilterableTableLayout includes search/clear buttons
return (
  <FilterableTableLayout
    totalCount={data.length}
    filteredCount={filtered.length}
    activeFilterCount={activeFilterCount}
    onSearch={executeSearch}      // Search button handler
    onClear={clearInputFilters}   // Clear button handler
    isSearching={isSearching}     // Loading state
    filters={filterUI}            // Input fields only (no buttons)
  >
    {/* Table content */}
  </FilterableTableLayout>
)
```

**Pattern 2: OrderSearchModal (Order search modal)**
```typescript
import { useOrderSearch } from '@/shared/hooks/useOrderSearch'

const {
  inputFilters,
  setInputFilters,
  executeSearch,
  clearInputFilters,
  isSearching,
  filteredOrders,
} = useOrderSearch()

// Modal includes search/clear buttons below filters
<OrderSearchFilters filters={inputFilters} onFilterChange={setInputFilters} />
<div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
  <Button onClick={executeSearch} disabled={isSearching}>検索</Button>
  <Button onClick={clearInputFilters}>クリア</Button>
</div>
```

**Key Principles:**
- Input state (`inputFilters`) separate from search state (`searchFilters`)
- Filtering only executes on search button click (not on input change)
- Clear button only clears input fields (search results unchanged)
- Search/clear buttons always right-aligned
- Consistent UX across all pages

**Key Features:**
- Default state: Open
- Smooth slide animation (300ms)
- Active filter count badge
- Display count and total count badges
- ChevronDownIcon/ChevronUpIcon for open/close state

### Record Count Display
Position badges in filter panel headers:
```typescript
<Badge variant={filteredCount !== totalCount ? 'info' : 'default'} size="sm">
  表示: {filteredCount}件
</Badge>
<Badge variant="default" size="sm">
  全: {totalCount}件
</Badge>
```

### Modal Pattern (Headless UI)
All modals use Headless UI Dialog with consistent structure:

**Required Structure:**
```tsx
<Dialog.Panel className="mx-auto max-w-5xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
  {/* Header - sticky top */}
  <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-200 z-10">
    <Dialog.Title>タイトル</Dialog.Title>
    <button onClick={onClose}><XMarkIcon /></button>
  </div>

  {/* Content - scrollable */}
  <div className="px-6 py-4">
    {/* Form content */}
  </div>

  {/* Footer - sticky bottom */}
  <div className="sticky bottom-0 bg-white flex justify-end px-6 py-4 border-t border-gray-200 z-10">
    <Button onClick={onClose}>キャンセル</Button>
    <Button onClick={onSave}>保存</Button>
  </div>
</Dialog.Panel>
```

**Critical Requirements:**
- `max-h-[90vh]` - Limit modal height to 90% of viewport
- `overflow-y-auto` - Enable vertical scrolling
- `sticky top-0/bottom-0` - Keep header/footer visible while scrolling
- `bg-white` on sticky elements - Prevent content showing through
- `z-10` on sticky elements - Layer above scrolling content

**Form Modal Pattern:**
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
| applications | ✅ Complete | 222 | 13 components, FilterableTableLayout pattern |
| contractor-requests | ⚠️ Needs work | 610 | 3 modal components, accordion filter UI pending |
| schedule | ✅ Complete | 156 | Multiple components/hooks/lib |
| orders | ✅ Complete | 230 | FilterPanel with accordion UI |
| my-exclusions | ✅ Complete | 148 | Multiple components/hooks/lib |
| contractor-management | ✅ Complete | 161 | Refactored into features/admin/contractor-management |
| login | ✅ Simple | 114 | Already clean |

### Filter Implementation Status
| Page | Filter UI | Search Button | Accordion | Pattern | Shared Hook | Notes |
|------|-----------|---------------|-----------|---------|-------------|-------|
| applications (Survey) | ✅ | ✅ | ✅ | FilterableTableLayout | useApplicationFilters | Search button in layout |
| applications (Attachment) | ✅ | ✅ | ✅ | FilterableTableLayout | useApplicationFilters | Search button in layout |
| applications (Construction) | ✅ | ✅ | ✅ | FilterableTableLayout | useApplicationFilters | Search button in layout |
| OrderSearchModal | ✅ | ✅ | N/A | Custom modal | useOrderSearch | Search button below filters |
| orders | ✅ | ✅ | ✅ | Custom FilterPanel | useOrderFilters | Accordion pattern |
| contractor-requests | ✅ | ✅ | ❌ | Legacy inline | useMemo inline | 610 lines, needs refactoring |
| schedule | N/A | N/A | N/A | Team filter only | useFilters | Hierarchical team filter |
| my-exclusions | N/A | N/A | N/A | Schedule type filter | - | Simple select dropdown |

### Architecture Refactoring History
| PR | Change | Files | Impact |
|----|--------|-------|--------|
| #67 | Search button and clear button unification | 7 files | Integrated search/clear buttons into FilterableTableLayout; added search button pattern to OrderSearchModal; fixed modal scroll issues |
| #66 | Enhanced CSV export with application data | 3 files | CSV now includes survey/attachment/construction data (54 columns total) |
| #65 | Added kana fields to appointment history | 4 files | Added customerCode and customerNameKana display; hiragana search support |
| #60 | Unified application form structure | 3 files | Removed team selection from Attachment requests; Attachment is now contractor-level only |
| #59 | Added CSV export to orders page | 3 files | CSV export with UTF-8 BOM, initial 19 columns, Excel-compatible |
| #58 | Added phone number filter and layout improvements | Multiple files | Phone number search, improved order page layout |
| #57 | Application fields update and serialNumber hide | 6 files | Removed '未着手' from construction edit modal, added withdrawNeeded field to attachment requests, hidden serialNumber in survey edit modal |
| #56 | Centralized sample data to src/shared/data | 8 files | Single source of truth for demo data, easier maintenance |
| #54 | Removed app/schedule/types completely | 16 files | All imports unified to features/calendar/types |
| #53 | Moved calendar types to features/calendar/types | 16 files | Fixed app-layer cross-dependencies |
| #47 | Removed unnecessary useMemo | 6 files, 8 useMemos | Reduced memoization overhead for O(1) calculations |
| #46 | Unified application filters | useApplicationFilters.ts, filterUtils.ts | DRY principle, consistent filtering logic |

### Future Migration Path
- **DBMS**: PostgreSQL (1-3 months)
  - ✅ Schema definition complete (`src/shared/database/`)
  - ✅ Repository pattern in place
  - ⏳ Backend API implementation (Node.js + Express)
  - ⏳ Data migration scripts
- **File storage**: AWS S3 or Cloudinary
  - Current: Base64 in localStorage/DB
  - Future: External storage with URL references
- **Authentication**: Implement proper security
  - Current: Plain text passwords
  - Required: bcrypt password hashing
  - Required: JWT or session-based auth

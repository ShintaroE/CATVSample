# CLAUDE_DETAILED.md

This file provides detailed technical documentation for Claude Code when working with this repository. For quick start and essential information, see CLAUDE.md first.

## Advanced Technical Details

### Filter Panel with Accordion UI Pattern - Detailed Implementation

#### Pattern 1: FilterableTableLayout Component
Location: `src/app/applications/components/common/FilterableTableLayout.tsx`

**Component Props:**
```typescript
interface FilterableTableLayoutProps {
  totalCount: number
  filteredCount: number
  activeFilterCount: number
  onClearFilters: () => void
  filters: React.ReactNode
  children: React.ReactNode
}
```

**Key Features:**
- Accordion animation with smooth 300ms transition
- Active filter count badge (e.g., "3件のフィルター適用中")
- Display count vs total count badges
- ChevronDownIcon/ChevronUpIcon state indicator
- Default open state

**Usage Pattern:**
```typescript
import { useApplicationFilters } from '@/app/applications/hooks/useApplicationFilters'
import FilterableTableLayout from '../common/FilterableTableLayout'

const { filters, setFilters, activeFilterCount, clearFilters } = useApplicationFilters(data)

const filterUI = (
  <>
    <Input value={filters.orderNumber} onChange={(e) => setFilters({...filters, orderNumber: e.target.value})} />
    {/* More filter inputs */}
  </>
)

return (
  <FilterableTableLayout
    totalCount={data.length}
    filteredCount={filtered.length}
    activeFilterCount={activeFilterCount}
    onClearFilters={clearFilters}
    filters={filterUI}
  >
    {/* Table content */}
  </FilterableTableLayout>
)
```

#### Pattern 2: Custom FilterPanel (Orders Page)
Location: `src/app/orders/components/FilterPanel.tsx`

**Implementation Details:**
```typescript
const [isOpen, setIsOpen] = useState(true)

return (
  <div className="mb-6 bg-white rounded-lg shadow">
    {/* Header with accordion button */}
    <button onClick={() => setIsOpen(!isOpen)} className="w-full">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          <span className="font-medium">フィルター</span>
          {activeFilterCount > 0 && (
            <Badge variant="info" size="sm">{activeFilterCount}件のフィルター適用中</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={filteredCount !== totalCount ? 'info' : 'default'} size="sm">
            表示: {filteredCount}件
          </Badge>
          <Badge variant="default" size="sm">全: {totalCount}件</Badge>
        </div>
      </div>
    </button>

    {/* Collapsible filter content */}
    <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
      {/* Filter inputs */}
    </div>
  </div>
)
```

### Shared Hooks: useApplicationFilters

Location: `src/app/applications/hooks/useApplicationFilters.ts`

**Purpose:** DRY principle for application filter logic across Survey/Attachment/Construction tabs

**Hook Interface:**
```typescript
interface UseApplicationFiltersReturn {
  filters: ApplicationFilters
  setFilters: (filters: ApplicationFilters) => void
  activeFilterCount: number
  hasActiveFilters: boolean
  clearFilters: () => void
  filteredData: T[]
}

interface ApplicationFilters {
  orderNumber: string
  customerName: string
  address: string
  phoneNumber: string
  contractor: string
  status: string
}
```

**Active Filter Count Calculation:**
```typescript
// Lightweight O(1) calculation - no useMemo needed
let count = 0
if (filters.orderNumber) count++
if (filters.customerName) count++
if (filters.address) count++
if (filters.phoneNumber) count++
if (filters.contractor && filters.contractor !== 'all') count++
if (filters.status && filters.status !== 'all') count++
return count
```

**Filter Logic:**
```typescript
const filteredData = data.filter(item => {
  if (filters.orderNumber && !item.orderNumber.includes(filters.orderNumber)) return false
  if (filters.customerName && !item.customerName.includes(filters.customerName)) return false
  if (filters.address && !item.address.includes(filters.address)) return false
  if (filters.phoneNumber && !item.phoneNumber.includes(filters.phoneNumber)) return false
  if (filters.contractor && filters.contractor !== 'all' && item.contractorName !== filters.contractor) return false
  if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false
  return true
})
```

### Outlook-Style Overlapping Layout - Algorithm Details

Location: `src/app/schedule/lib/scheduleCalculations.ts`

#### Detailed Algorithm: calculateOverlappingLayoutWithExclusions

**Step 1: Unified Item Processing**
```typescript
type CalendarItem =
  | { type: 'schedule', data: ScheduleItem, timeSlot: string }
  | { type: 'exclusion', data: ExclusionEntry, timeSlot: string }

// Convert exclusion to time slot format
const getExclusionTimeSlot = (exclusion: ExclusionEntry): string => {
  if (exclusion.timeType === 'all_day') return '09:00-18:00'
  if (exclusion.timeType === 'am') return '09:00-12:00'
  if (exclusion.timeType === 'pm') return '12:00-18:00'
  if (exclusion.timeType === 'custom' && exclusion.startTime && exclusion.endTime) {
    return `${exclusion.startTime}-${exclusion.endTime}`
  }
  return '09:00-18:00'
}

const items: CalendarItem[] = [
  ...schedules.map(s => ({ type: 'schedule' as const, data: s, timeSlot: s.timeSlot })),
  ...exclusions.map(e => ({ type: 'exclusion' as const, data: e, timeSlot: getExclusionTimeSlot(e) }))
]
```

**Step 2: Time Parsing**
```typescript
const parseTime = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes // Convert to minutes from midnight
}
```

**Step 3: Overlap Detection**
```typescript
const overlaps = (a: CalendarItem, b: CalendarItem): boolean => {
  const [aStart, aEnd] = a.timeSlot.split('-').map(parseTime)
  const [bStart, bEnd] = b.timeSlot.split('-').map(parseTime)

  // Two intervals overlap if: start1 < end2 AND start2 < end1
  return aStart < bEnd && bStart < aEnd
}
```

**Step 4: Column Assignment Algorithm**
```typescript
// Sort items: earlier start time first, then longer duration first
items.sort((a, b) => {
  const [aStart, aEnd] = a.timeSlot.split('-').map(parseTime)
  const [bStart, bEnd] = b.timeSlot.split('-').map(parseTime)

  if (aStart !== bStart) return aStart - bStart
  return (bEnd - bStart) - (aEnd - aStart) // Longer duration first
})

const layouts = new Map<string, { column: number, totalColumns: number }>()
const columns: CalendarItem[][] = []

for (const item of items) {
  // Find the leftmost column where this item doesn't overlap with existing items
  let columnIndex = 0
  while (columnIndex < columns.length) {
    const columnHasOverlap = columns[columnIndex].some(existingItem =>
      overlaps(item, existingItem)
    )
    if (!columnHasOverlap) break
    columnIndex++
  }

  // If no suitable column found, create new column
  if (columnIndex === columns.length) {
    columns.push([])
  }

  columns[columnIndex].push(item)

  const itemId = item.type === 'schedule' ? item.data.id : item.data.id
  layouts.set(itemId, { column: columnIndex, totalColumns: columns.length })
}

// Update totalColumns for all items after processing
layouts.forEach((layout, id) => {
  layout.totalColumns = columns.length
})

return layouts
```

**Step 5: Visual Rendering**
```typescript
const layout = layouts.get(item.id)
const width = `${100 / layout.totalColumns}%`
const left = `${(layout.column * 100) / layout.totalColumns}%`
const zIndex = item.type === 'exclusion' ? 10 : layout.column + 1

<div
  style={{
    position: 'absolute',
    width,
    left,
    top: calculateTop(item),
    height: calculateHeight(item),
    zIndex
  }}
  className={item.type === 'exclusion' ? 'border-2 border-dashed border-red-500' : 'border border-gray-200'}
>
  {/* Item content */}
</div>
```

### Day View Column Layout - Detailed Implementation

#### Responsive Column Width Logic

```typescript
const getColumnWidthConfig = useMemo(() => {
  const columnCount = visibleColumns.length

  if (columnCount === 0) {
    return { useFlex: false, minWidth: '180px' }
  }

  if (columnCount <= 5) {
    // 1-5 columns: Flex layout fills screen width
    // Each column gets equal space, minimum 200px
    return { useFlex: true, minWidth: '200px' }
  } else {
    // 6+ columns: Fixed width with horizontal scroll
    // Each column is exactly 180px, container scrolls horizontally
    return { useFlex: false, minWidth: '180px' }
  }
}, [visibleColumns.length])

// Apply in JSX
<div className={`flex ${getColumnWidthConfig.useFlex ? '' : 'overflow-x-auto'}`}>
  {visibleColumns.map(col => (
    <div
      key={col.teamId}
      style={{
        minWidth: getColumnWidthConfig.minWidth,
        flex: getColumnWidthConfig.useFlex ? 1 : 'none'
      }}
    >
      {/* Column content */}
    </div>
  ))}
</div>
```

#### rem-based Position Calculation

**Constants:**
```typescript
const HOUR_HEIGHT = 4           // 1 hour = 4rem = 64px at 16px base font
const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR = 18
const MINUTES_PER_REM = 15      // 1rem = 15 minutes
```

**Top Position Calculation:**
```typescript
const calculateScheduleTop = (timeSlot: string): string => {
  if (timeSlot === '終日') return '0rem'

  const [startTime] = timeSlot.split('-')
  const [hour, minute] = startTime.split(':').map(Number)

  // Calculate minutes from business start (9:00)
  const minutesFromStart = (hour - BUSINESS_START_HOUR) * 60 + minute

  // Convert to rem (60 minutes = 4rem, so 1 minute = 4/60 rem)
  return `${(minutesFromStart / 60) * HOUR_HEIGHT}rem`
}

// Examples:
// 09:00 → 0rem
// 09:15 → 1rem (15 min = 1/4 hour = 1rem)
// 10:00 → 4rem
// 12:30 → 14rem (3.5 hours * 4rem)
```

**Height Calculation:**
```typescript
const calculateScheduleHeight = (timeSlot: string): string => {
  if (timeSlot === '終日') {
    return `${(BUSINESS_END_HOUR - BUSINESS_START_HOUR) * HOUR_HEIGHT}rem` // 36rem
  }

  const [startTime, endTime] = timeSlot.split('-')
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  const durationMinutes = endMinutes - startMinutes

  // Convert to rem, minimum 2rem for visibility
  return `${Math.max((durationMinutes / 60) * HOUR_HEIGHT, 2)}rem`
}

// Examples:
// 09:00-10:00 → 4rem (1 hour)
// 09:00-09:15 → 2rem (minimum, actual would be 1rem)
// 14:00-17:30 → 14rem (3.5 hours)
```

#### Time Grid Lines

```typescript
const timeSlots = Array.from({ length: BUSINESS_END_HOUR - BUSINESS_START_HOUR }, (_, i) => {
  const hour = BUSINESS_START_HOUR + i
  return {
    time: `${hour.toString().padStart(2, '0')}:00`,
    topPosition: `${i * HOUR_HEIGHT}rem`
  }
})

// Render grid
{timeSlots.map(slot => (
  <div
    key={slot.time}
    className="absolute w-full border-b border-gray-100"
    style={{ top: slot.topPosition }}
  />
))}
```

### Hierarchical Team Filtering - Checkbox State Management

Location: `src/app/schedule/components/TeamFilterPanel.tsx`

#### Data Structure

```typescript
interface TeamFilter {
  contractorId: string
  contractorName: string
  teamId: string
  teamName: string
  isVisible: boolean
  color: string          // 'blue' | 'green' | 'purple'
}

// Initialize from contractors and teams
const initializeFilters = (): TeamFilter[] => {
  const contractors = getContractors()
  const teams = getTeams()

  return contractors.flatMap(contractor => {
    const contractorTeams = teams.filter(t => t.contractorId === contractor.id)
    return contractorTeams.map(team => ({
      contractorId: contractor.id,
      contractorName: contractor.name,
      teamId: team.id,
      teamName: team.teamName,
      isVisible: true, // Default: all visible
      color: getContractorColor(contractor.name)
    }))
  })
}
```

#### Checkbox State Functions

**Get Contractor Checkbox State:**
```typescript
type CheckState = 'all' | 'some' | 'none'

const getContractorCheckState = (contractorId: string): CheckState => {
  const contractorTeams = teamFilters.filter(f => f.contractorId === contractorId)
  const visibleCount = contractorTeams.filter(f => f.isVisible).length

  if (visibleCount === 0) return 'none'
  if (visibleCount === contractorTeams.length) return 'all'
  return 'some'
}

// Apply to checkbox
const checkState = getContractorCheckState(contractor.id)
<input
  type="checkbox"
  checked={checkState === 'all'}
  ref={el => {
    if (el) el.indeterminate = checkState === 'some'
  }}
  onChange={(e) => handleToggleContractor(contractor.id, e.target.checked)}
/>
```

**Toggle Functions:**
```typescript
const handleToggleAll = (checked: boolean) => {
  setTeamFilters(prev => prev.map(f => ({ ...f, isVisible: checked })))
}

const handleToggleContractor = (contractorId: string, checked: boolean) => {
  setTeamFilters(prev => prev.map(f =>
    f.contractorId === contractorId ? { ...f, isVisible: checked } : f
  ))
}

const handleToggleTeam = (teamId: string, checked: boolean) => {
  setTeamFilters(prev => prev.map(f =>
    f.teamId === teamId ? { ...f, isVisible: checked } : f
  ))
}
```

#### Filter Count Badge

```typescript
const selectedCount = teamFilters.filter(f => f.isVisible).length
const totalCount = teamFilters.length

<button onClick={() => setShowPanel(!showPanel)}>
  <FunnelIcon className="w-5 h-5" />
  <span>フィルター</span>
  {selectedCount < totalCount && (
    <Badge variant="info" size="sm">{selectedCount}/{totalCount}</Badge>
  )}
</button>
```

### Application Request Status Workflow - Attachment Type

#### Contractor Progress Modal Logic

Location: `src/app/contractor-requests/components/AttachmentProgressModal.tsx`

**Status Determination Algorithm:**
```typescript
interface AttachmentProgressState {
  surveyStatus: 'not_surveyed' | 'surveyed'
  progressStatus: 'incomplete' | 'complete'
}

const determineFinalStatus = (state: AttachmentProgressState): AttachmentStatus => {
  // Rule 1: If not surveyed, always return '依頼済み'
  if (state.surveyStatus === 'not_surveyed') {
    return '依頼済み'
  }

  // Rule 2: If surveyed + complete → '依頼完了'
  if (state.surveyStatus === 'surveyed' && state.progressStatus === 'complete') {
    return '依頼完了'
  }

  // Rule 3: If surveyed + incomplete → '調査済み'
  if (state.surveyStatus === 'surveyed' && state.progressStatus === 'incomplete') {
    return '調査済み'
  }

  // Fallback
  return '依頼済み'
}
```

**UI Constraint:**
```typescript
// Disable "完了" option when survey status is "未調査"
<select
  value={progressStatus}
  onChange={(e) => setProgressStatus(e.target.value)}
  disabled={surveyStatus === 'not_surveyed'}
>
  <option value="incomplete">未完了</option>
  <option value="complete" disabled={surveyStatus === 'not_surveyed'}>完了</option>
</select>

// Show warning message
{surveyStatus === 'not_surveyed' && (
  <p className="text-sm text-yellow-600">
    ※ 調査状況が「未調査」の場合、進捗を「完了」にすることはできません
  </p>
)}
```

### CalendarPicker Component - Detailed Implementation

Location: `src/features/calendar/components/CalendarPicker/index.tsx`

#### Month Grid Generation

```typescript
const generateMonthGrid = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const firstDayOfWeek = firstDay.getDay() // 0 = Sunday
  const lastDate = lastDay.getDate()

  const grid: Date[] = []

  // Previous month's trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    grid.push(new Date(year, month - 1, prevMonthLastDay - i))
  }

  // Current month's days
  for (let date = 1; date <= lastDate; date++) {
    grid.push(new Date(year, month, date))
  }

  // Next month's leading days (fill to 42 cells = 6 rows)
  const remainingCells = 42 - grid.length
  for (let date = 1; date <= remainingCells; date++) {
    grid.push(new Date(year, month + 1, date))
  }

  return grid
}
```

#### Schedule/Exclusion Display on Calendar Cells

```typescript
const getItemsForDate = (date: Date): { schedules: ScheduleItem[], exclusions: ExclusionEntry[] } => {
  const dateStr = formatDateString(date)

  const schedules = existingSchedules.filter(s => s.assignedDate === dateStr)
  const exclusions = existingExclusions.filter(e => e.date === dateStr)

  return { schedules, exclusions }
}

// Render in cell
{dates.map(date => {
  const { schedules, exclusions } = getItemsForDate(date)
  const totalItems = schedules.length + exclusions.length
  const displayItems = totalItems > 2 ? [...schedules, ...exclusions].slice(0, 2) : [...schedules, ...exclusions]
  const overflow = totalItems - displayItems.length

  return (
    <div key={date.toISOString()} className="calendar-cell">
      {/* Date number */}
      <span>{date.getDate()}</span>

      {/* Schedule/Exclusion indicators */}
      <div className="space-y-1">
        {displayItems.map(item => (
          <div
            key={item.id}
            className={
              'type' in item && item.type === 'exclusion'
                ? 'text-xs border border-dashed border-red-500 text-red-700'
                : 'text-xs bg-blue-500 text-white'
            }
          >
            {'type' in item ? `🚫 ${item.contractor}` : item.contractor}
          </div>
        ))}

        {/* Overflow indicator */}
        {overflow > 0 && (
          <div className="text-xs text-gray-500">+{overflow}</div>
        )}
      </div>
    </div>
  )
})}
```

### Order File Storage - Size Validation Details

Location: `src/app/orders/lib/orderFileStorage.ts`

#### Size Limit Constants

```typescript
export const FILE_SIZE_LIMITS = {
  MAX_SIZE: 2 * 1024 * 1024,      // 2MB (hard limit)
  WARNING_SIZE: 1.5 * 1024 * 1024  // 1.5MB (warning threshold)
} as const
```

#### Validation Function

```typescript
interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
  sizeInMB: number
}

export const validateFileSize = (file: File): ValidationResult => {
  const sizeInMB = file.size / (1024 * 1024)

  if (file.size > FILE_SIZE_LIMITS.MAX_SIZE) {
    return {
      isValid: false,
      error: `ファイルサイズが大きすぎます（最大2MB）。現在: ${sizeInMB.toFixed(2)}MB`,
      sizeInMB
    }
  }

  if (file.size > FILE_SIZE_LIMITS.WARNING_SIZE) {
    return {
      isValid: true,
      warning: `ファイルサイズが大きめです（${sizeInMB.toFixed(2)}MB）。アップロードに時間がかかる場合があります。`,
      sizeInMB
    }
  }

  return {
    isValid: true,
    sizeInMB
  }
}
```

#### Upload with Validation

```typescript
export const uploadFile = async (orderNumber: string, file: File): Promise<void> => {
  // Step 1: Validate file size
  const validation = validateFileSize(file)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  // Step 2: Show warning if needed
  if (validation.warning) {
    console.warn(validation.warning)
  }

  // Step 3: Convert to Base64
  const base64Data = await fileToBase64(file)

  // Step 4: Create OrderFile object
  const orderFile: OrderFile = {
    id: generateId(),
    orderNumber,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    fileData: base64Data,
    uploadedAt: new Date().toISOString()
  }

  // Step 5: Save to localStorage
  const files = getOrderFiles()
  files.push(orderFile)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
```

### CSV Export Implementation - Technical Details

Location: `src/app/orders/lib/csvExport.ts`

#### UTF-8 BOM Explanation

**Why BOM?**
- Excel on Windows doesn't auto-detect UTF-8 without BOM
- BOM (Byte Order Mark) signals to Excel: "This file is UTF-8"
- Without BOM: Japanese characters appear garbled (文字化け)
- BOM character: `\uFEFF` (zero-width non-breaking space)

**Implementation:**
```typescript
export const exportToCSV = (orders: OrderData[]): void => {
  const BOM = '\uFEFF'
  const csvContent = generateCSVContent(orders)
  const csvWithBOM = BOM + csvContent

  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, generateFilename())
}
```

#### Field Mapping

```typescript
const mapOrderToCSVRow = (order: OrderData): string[] => {
  return [
    order.orderNumber,
    order.source,
    order.housingType,
    order.constructionType,
    order.customerCode,
    order.customerName,
    order.customerType,
    order.phoneNumber || '',
    order.address,
    order.constructionDate || '',
    order.closureNumber || '',
    order.collectiveCode || '',
    order.collectiveHousingName || '',
    order.surveyStatus,
    order.permitStatus,
    order.constructionStatus,
    order.orderStatus,
    order.cancelDate || '',
    order.cancelReason || ''
  ]
}

// Handle CSV escaping
const escapeCSVField = (field: string): string => {
  // If field contains comma, newline, or quote, wrap in quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    // Escape existing quotes by doubling them
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}
```

#### Filename Generation

```typescript
const generateFilename = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')

  return `工事依頼_${year}${month}${day}_${hours}${minutes}${seconds}.csv`
}
```

### Performance Guidelines - Detailed Decision Matrix

#### useMemo Decision Tree

```
Is the calculation result used in JSX rendering?
├─ NO → Don't use useMemo
└─ YES → How expensive is the calculation?
         ├─ O(1) operations (property access, simple math) → Don't use useMemo
         ├─ O(n) operations (array filter, map) → Use useMemo
         └─ localStorage I/O or complex calculations → Use useMemo
```

#### Examples: Don't Use useMemo

```typescript
// ❌ Unnecessary useMemo - O(1) calculation
const activeFilterCount = useMemo(() => {
  let count = 0
  if (filters.name) count++
  if (filters.status !== 'all') count++
  return count
}, [filters])

// ✅ Direct calculation - simpler and faster
let activeFilterCount = 0
if (filters.name) activeFilterCount++
if (filters.status !== 'all') activeFilterCount++
```

#### Examples: Use useMemo

```typescript
// ✅ Use useMemo - O(n) array filtering
const filteredOrders = useMemo(() => {
  return orders.filter(order => {
    if (filters.orderNumber && !order.orderNumber.includes(filters.orderNumber)) return false
    if (filters.customerName && !order.customerName.includes(filters.customerName)) return false
    return true
  })
}, [orders, filters])

// ✅ Use useMemo - localStorage I/O
const contractors = useMemo(() => {
  return getContractors() // Reads from localStorage
}, [])
```

#### useEffect vs Direct Calculation

```typescript
// ❌ Unnecessary useEffect - can be computed directly
const [displayName, setDisplayName] = useState('')
useEffect(() => {
  setDisplayName(`${user.contractor} - ${user.team}`)
}, [user])

// ✅ Direct calculation - no state needed
const displayName = `${user.contractor} - ${user.team}`
```

```typescript
// ✅ Necessary useEffect - side effect (data fetching)
useEffect(() => {
  const schedules = scheduleStorage.getAll()
  setSchedules(schedules)
}, [])

// ✅ Necessary useEffect - navigation (routing)
useEffect(() => {
  if (!isAuthenticated) {
    router.push('/login')
  }
}, [isAuthenticated, router])
```

## Component Refactoring Patterns

### Modal Component Extraction Pattern

**Before (inline modal):**
```typescript
// page.tsx - 600 lines
const [isModalOpen, setIsModalOpen] = useState(false)
const [formData, setFormData] = useState<FormData>(initialData)

return (
  <div>
    {/* 50+ lines of table code */}

    {/* 200+ lines of modal code */}
    {isModalOpen && (
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* Complex form with validation, file upload, etc. */}
      </Dialog>
    )}
  </div>
)
```

**After (extracted modal):**
```typescript
// page.tsx - 150 lines
import AddItemModal from './components/AddItemModal'

const [isModalOpen, setIsModalOpen] = useState(false)

return (
  <div>
    {/* Table code */}
    <AddItemModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSave={handleSave}
    />
  </div>
)

// components/AddItemModal.tsx - 200 lines
export default function AddItemModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState<FormData>(initialData)
  // All modal logic here
  return <Dialog>...</Dialog>
}
```

### Custom Hook Extraction Pattern

**Before (logic in page):**
```typescript
// page.tsx
const [schedules, setSchedules] = useState<ScheduleItem[]>([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  const data = scheduleStorage.getAll()
  setSchedules(data)
  setLoading(false)
}, [])

const addSchedule = (schedule: ScheduleItem) => {
  scheduleStorage.add(schedule)
  setSchedules(prev => [...prev, schedule])
}

const updateSchedule = (id: string, updates: Partial<ScheduleItem>) => {
  scheduleStorage.update(id, updates)
  setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
}
```

**After (extracted hook):**
```typescript
// hooks/useScheduleData.ts
export function useScheduleData() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const data = scheduleStorage.getAll()
    setSchedules(data)
    setLoading(false)
  }, [])

  const addSchedule = useCallback((schedule: ScheduleItem) => {
    scheduleStorage.add(schedule)
    setSchedules(prev => [...prev, schedule])
  }, [])

  const updateSchedule = useCallback((id: string, updates: Partial<ScheduleItem>) => {
    scheduleStorage.update(id, updates)
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [])

  return { schedules, loading, addSchedule, updateSchedule }
}

// page.tsx
const { schedules, loading, addSchedule, updateSchedule } = useScheduleData()
```

## Architecture Migration Path

### Current State: localStorage-first

**Data Flow:**
```
Component → Storage Module → localStorage
           ← Storage Module ←
```

**Example:**
```typescript
// Current: Direct localStorage access
export const getContractors = (): Contractor[] => {
  const data = localStorage.getItem('contractors')
  return data ? JSON.parse(data) : []
}
```

### Future State: DBMS with Repository Pattern

**Data Flow:**
```
Component → Repository → API Client → Backend API → Database
           ← Repository ← API Client ←
```

**Migration Strategy:**
```typescript
// Step 1: Create repository interface
interface ContractorRepository {
  getAll(): Promise<Contractor[]>
  getById(id: string): Promise<Contractor | undefined>
  add(contractor: Contractor): Promise<void>
  update(id: string, updates: Partial<Contractor>): Promise<void>
  delete(id: string): Promise<void>
}

// Step 2: Implement localStorage version
class LocalStorageContractorRepository implements ContractorRepository {
  async getAll(): Promise<Contractor[]> {
    const data = localStorage.getItem('contractors')
    return data ? JSON.parse(data) : []
  }
  // ... other methods
}

// Step 3: Implement API version (future)
class APIContractorRepository implements ContractorRepository {
  async getAll(): Promise<Contractor[]> {
    const response = await fetch('/api/contractors')
    return response.json()
  }
  // ... other methods
}

// Step 4: Use dependency injection
const contractorRepo: ContractorRepository =
  process.env.USE_API
    ? new APIContractorRepository()
    : new LocalStorageContractorRepository()

// Components use the interface, not specific implementation
const contractors = await contractorRepo.getAll()
```

### File Storage Migration

**Current: Base64 in localStorage**
```typescript
interface OrderFile {
  fileData: string // Base64 encoded
}
```

**Future: URL references to external storage**
```typescript
interface OrderFile {
  fileUrl: string // S3/Cloudinary URL
  thumbnailUrl?: string
}

// Upload flow
const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData
  })

  const { fileUrl } = await response.json()
  return fileUrl
}
```

## Troubleshooting Guide - Extended

### localStorage Quota Exceeded Error

**Symptoms:**
```
DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'applications_survey' exceeded the quota.
```

**Causes:**
- Too many large Base64 files in attachments
- localStorage limit: ~5-10MB total per domain
- Base64 encoding increases file size by ~33%

**Solutions:**
```typescript
// 1. Check current usage
const getLocalStorageSize = (): number => {
  let total = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }
  return total // bytes
}

console.log(`localStorage usage: ${(getLocalStorageSize() / 1024 / 1024).toFixed(2)}MB`)

// 2. Reduce file size limits
export const FILE_SIZE_LIMITS = {
  MAX_SIZE: 1 * 1024 * 1024,  // Reduce to 1MB
  WARNING_SIZE: 0.5 * 1024 * 1024
}

// 3. Implement file cleanup
const cleanupOldFiles = () => {
  const applications = getApplications('survey')
  applications.forEach(app => {
    if (app.attachments.fromAdmin.length > 10) {
      // Keep only 10 most recent files
      app.attachments.fromAdmin = app.attachments.fromAdmin
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 10)
    }
  })
  saveApplications('survey', applications)
}
```

### React Hydration Mismatch Warnings

**Symptoms:**
```
Warning: Expected server HTML to contain a matching <div> in <div>
```

**Common Causes in This Project:**
1. Date formatting with timezone differences (server vs client)
2. Conditional rendering based on localStorage (not available on server)
3. Random IDs generated differently on server and client

**Solutions:**
```typescript
// 1. Use suppressHydrationWarning for date displays
<div suppressHydrationWarning>
  {new Date().toLocaleDateString('ja-JP')}
</div>

// 2. Delay rendering until client-side
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null

// 3. Use consistent ID generation
// ❌ Don't use Math.random() or Date.now()
const id = Math.random().toString()

// ✅ Use deterministic IDs
const id = `${type}-${index}`
```

### Form Input Styling Issues

**Problem:** Form inputs appear with dark background and invisible text

**Cause:** Tailwind CSS default styles may apply dark mode or inherit background

**Solution:** Always add explicit background and text color classes
```typescript
// ❌ Invisible text issue
<input className="border rounded px-3 py-2" />

// ✅ Correct styling
<input className="border rounded px-3 py-2 bg-white text-gray-900" />

// ✅ Select element
<select className="border rounded px-3 py-2 bg-white text-gray-900">

// ✅ Textarea
<textarea className="border rounded px-3 py-2 bg-white text-gray-900" />
```

## Testing Strategy (Future Implementation)

### Unit Testing Pattern

```typescript
// hooks/useScheduleData.test.ts
import { renderHook, act } from '@testing-library/react'
import { useScheduleData } from './useScheduleData'

describe('useScheduleData', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should load schedules from localStorage', () => {
    const { result } = renderHook(() => useScheduleData())
    expect(result.current.schedules).toEqual([])
  })

  it('should add new schedule', () => {
    const { result } = renderHook(() => useScheduleData())

    act(() => {
      result.current.addSchedule({
        id: '1',
        contractor: 'Test Contractor',
        timeSlot: '09:00-10:00'
      })
    })

    expect(result.current.schedules).toHaveLength(1)
  })
})
```

### Integration Testing Pattern

```typescript
// pages/applications.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import ApplicationsPage from './page'

describe('Applications Page', () => {
  it('should display survey requests', () => {
    render(<ApplicationsPage />)
    expect(screen.getByText('現地調査依頼')).toBeInTheDocument()
  })

  it('should filter by order number', () => {
    render(<ApplicationsPage />)

    const input = screen.getByPlaceholderText('受注番号')
    fireEvent.change(input, { target: { value: 'ORD-001' } })

    // Should show only matching orders
    expect(screen.getAllByText(/ORD-001/)).toHaveLength(1)
  })
})
```

## Code Style Guide

### Import Order

```typescript
// 1. React and Next.js imports
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

// 3. Shared components and utilities
import Layout from '@/shared/components/layout/Layout'
import Button from '@/shared/components/ui/Button'
import { formatDateString } from '@/shared/utils/formatters'

// 4. Feature modules
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getContractors } from '@/features/contractor/lib/contractorStorage'

// 5. Local components and hooks
import TeamFilter from './components/TeamFilter'
import { useScheduleData } from './hooks/useScheduleData'

// 6. Types
import type { ScheduleItem, ExclusionEntry } from '@/features/calendar/types'
```

### Component Structure

```typescript
'use client'

// 1. Imports
import { useState } from 'react'
import type { FC } from 'react'

// 2. Type definitions
interface MyComponentProps {
  title: string
  onSave: () => void
}

// 3. Component definition
const MyComponent: FC<MyComponentProps> = ({ title, onSave }) => {
  // 3.1. Hooks (custom hooks first, then built-in hooks)
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // 3.2. Computed values (useMemo if needed)
  const displayTitle = `${title} - ${user.name}`

  // 3.3. Event handlers
  const handleClick = () => {
    onSave()
    setIsOpen(false)
  }

  // 3.4. Effects
  useEffect(() => {
    // Side effects
  }, [])

  // 3.5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}

// 4. Export
export default MyComponent
```

### Naming Conventions

```typescript
// Components: PascalCase
AddScheduleModal.tsx
TeamFilterPanel.tsx

// Hooks: camelCase with 'use' prefix
useScheduleData.ts
useApplicationFilters.ts

// Utils: camelCase
dateUtils.ts
scheduleCalculations.ts

// Types: PascalCase interfaces
interface ScheduleItem {}
type RequestType = 'survey' | 'attachment'

// Constants: SCREAMING_SNAKE_CASE for truly constant values
const FILE_SIZE_LIMITS = { MAX_SIZE: 2048 }

// Variables: camelCase
const filteredSchedules = []
const isModalOpen = true
```

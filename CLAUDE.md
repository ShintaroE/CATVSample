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
│   ├── applications/        # 申請番号管理ページ
│   ├── orders/             # 工事依頼管理ページ
│   ├── schedule/           # 工事日程調整ページ
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # ダッシュボードページ
│   └── globals.css         # Global styles
└── components/
    ├── Layout.tsx          # Main layout wrapper with sidebar
    └── Sidebar.tsx         # Navigation sidebar component
```

### Key Features
- Responsive sidebar navigation with hover-to-expand functionality
- Multi-page CATV management system:
  - ダッシュボード (Dashboard) - システム概要と工事進捗サマリ
  - 工事依頼管理 (Order Management) - 小川オーダー表形式の工事依頼管理
  - 工事日程調整 (Schedule Management) - Outlookライクなカレンダーインターフェース
  - 申請番号管理 (Application Number Management) - 中電/NTT申請の受付〜許可管理
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
- アポイント履歴管理 for appointment history
- Multi-view calendar (月・週・日) with time slots (9:00-18:00)
- Status-based filtering and color coding

### Component Architecture
- Uses 'use client' directive for interactive components
- Custom Layout component wraps all pages with Sidebar
- Sidebar component manages its own expanded/collapsed state
- Icon system uses Heroicons for consistent visual design
- Modal-based detail editing patterns
- Drag & drop file upload components

### Development Notes
- Development indicators are disabled (devIndicators: false)
- ESLint configured with Next.js Core Web Vitals rules
- Uses Geist font family for typography
- Strict TypeScript configuration with ES2017 target
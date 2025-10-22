'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  HomeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  DocumentCheckIcon,
  ComputerDesktopIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const adminMenuItems: MenuItem[] = [
  {
    name: 'ダッシュボード',
    href: '/',
    icon: HomeIcon,
  },
  {
    name: '工事依頼管理',
    href: '/orders',
    icon: DocumentTextIcon,
  },
  {
    name: '工事日程調整',
    href: '/schedule',
    icon: CalendarDaysIcon,
  },
  {
    name: '申請番号管理',
    href: '/applications',
    icon: DocumentCheckIcon,
  },
  {
    name: 'アカウント管理',
    href: '/contractor-management',
    icon: UserGroupIcon,
  },
]

const contractorMenuItems: MenuItem[] = [
  {
    name: '依頼一覧',
    href: '/contractor-requests',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: '除外日管理',
    href: '/my-exclusions',
    icon: CalendarDaysIcon,
  },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const menuItems = user?.role === 'admin' ? adminMenuItems : contractorMenuItems

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-gray-900 flex flex-col py-4 z-50 transition-all duration-300 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* ロゴ・タイトル */}
      <div className="mb-8 flex items-center px-4">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
          <ComputerDesktopIcon className="h-6 w-6 text-white" />
        </div>
        {isExpanded && (
          <span className="ml-3 text-white font-semibold text-lg whitespace-nowrap">
            CATV管理システム
          </span>
        )}
      </div>

      {/* メニューアイテム */}
      <nav className="flex flex-col space-y-2 w-full px-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-2 py-3 rounded-lg transition-colors duration-200
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <div className="flex items-center justify-center w-8 h-8">
                <Icon className="h-6 w-6" />
              </div>
              {isExpanded && (
                <span className="ml-3 text-sm font-medium whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ユーザー情報とログアウト */}
      {user && (
        <div className="mt-auto px-2 pt-4 border-t border-gray-700 space-y-2">
          {/* ユーザー情報 */}
          <div className="flex items-center px-2 py-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8">
              <UserCircleIcon className="h-6 w-6 text-blue-400" />
            </div>
            {isExpanded && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white whitespace-nowrap">
                  {user.name}
                </p>
                <p className="text-xs text-gray-400">
                  {user.role === 'admin' ? '管理者アカウント' : '協力会社アカウント'}
                </p>
              </div>
            )}
          </div>

          {/* ログアウトボタン */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-2 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:bg-opacity-20 hover:text-red-300 transition-colors duration-200"
            title="ログアウト"
          >
            <div className="flex items-center justify-center w-8 h-8">
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </div>
            {isExpanded && (
              <span className="ml-3 text-sm font-medium whitespace-nowrap">
                ログアウト
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
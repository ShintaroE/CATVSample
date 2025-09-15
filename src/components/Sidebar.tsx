'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  DocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const menuItems: MenuItem[] = [
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
    name: 'アポイント記録',
    href: '/appointments',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: '工事業者管理',
    href: '/contractors',
    icon: UserGroupIcon,
  },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

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
      <nav className="flex flex-col space-y-2 w-full px-2">
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

    </div>
  )
}
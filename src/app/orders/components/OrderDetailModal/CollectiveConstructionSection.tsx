'use client'

import React, { useState } from 'react'
import { CollectiveConstructionInfo } from '../../types'

interface CollectiveConstructionSectionProps {
  data: CollectiveConstructionInfo
  onChange: (data: CollectiveConstructionInfo) => void
}

export default function CollectiveConstructionSection({
  data,
  onChange,
}: CollectiveConstructionSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-2 hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
      >
        <h4 className="text-md font-medium text-gray-900">集合工事情報</h4>
        <span className="text-gray-500 text-lg">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {isOpen && (
        <div className="bg-gray-50 p-4 rounded-md mt-2">
          <div className="grid grid-cols-3 gap-4 text-sm">
            {/* 階数 */}
            <div>
              <label className="block font-medium text-gray-900 mb-1">
                階数
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={data.floors || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      floors: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="flex-1 bg-white text-gray-900 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5"
                />
                <span className="text-gray-600">階建て</span>
              </div>
            </div>

            {/* 世帯数 */}
            <div>
              <label className="block font-medium text-gray-900 mb-1">
                世帯数
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={data.units || ''}
                  onChange={(e) =>
                    onChange({
                      ...data,
                      units: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="flex-1 bg-white text-gray-900 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                />
                <span className="text-gray-600">世帯</span>
              </div>
            </div>

            {/* 先行資料印刷要否 */}
            <div>
              <label className="block font-medium text-gray-900 mb-1">
                先行資料印刷要否
              </label>
              <select
                value={data.advanceMaterialPrinting}
                onChange={(e) =>
                  onChange({
                    ...data,
                    advanceMaterialPrinting: e.target.value as 'required' | 'not_required',
                  })
                }
                className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="not_required">否</option>
                <option value="required">要</option>
              </select>
            </div>

            {/* ブースター型 */}
            <div>
              <label className="block font-medium text-gray-900 mb-1">
                ブースター型
              </label>
              <input
                type="text"
                value={data.boosterType || ''}
                onChange={(e) =>
                  onChange({ ...data, boosterType: e.target.value })
                }
                className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="型番を入力..."
              />
            </div>

            {/* 分配器交換 */}
            <div>
              <label className="block font-medium text-gray-900 mb-1">
                分配器交換
              </label>
              <input
                type="text"
                value={data.distributorReplacement || ''}
                onChange={(e) =>
                  onChange({ ...data, distributorReplacement: e.target.value })
                }
                className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="詳細を入力..."
              />
            </div>

            {/* ドロップ先行 */}
            <div>
              <label className="block font-medium text-gray-900 mb-1">
                ドロップ先行
              </label>
              <input
                type="text"
                value={data.dropAdvance || ''}
                onChange={(e) =>
                  onChange({ ...data, dropAdvance: e.target.value })
                }
                className="w-full bg-white text-gray-900 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="詳細を入力..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'

type Status = '受付' | '提出済' | '許可' | '取下げ'

interface ApplicationRecord {
  id: string
  serialNumber: number
  contractNo?: string
  applicationNo: string
  customerCode?: string
  submittedAt?: string // YYYY-MM-DD
  approvedAt?: string // YYYY-MM-DD
  status: Status
  withdrawNeeded?: boolean
  withdrawCreated?: boolean
  notes?: string
}

const initialData: ApplicationRecord[] = [
  {
    id: 'a1',
    serialNumber: 2164,
    contractNo: '101080601',
    applicationNo: '24-2503A',
    customerCode: '123456789',
    submittedAt: '2025-02-07',
    approvedAt: '2025-03-10',
    status: '許可',
    notes: '',
  },
  {
    id: 'a2',
    serialNumber: 2165,
    contractNo: '101784701',
    applicationNo: '24-2531A',
    customerCode: '223456789',
    submittedAt: '2025-02-07',
    approvedAt: '2025-02-13',
    status: '許可',
    notes: '契約キャンセルの為、廃止申請要',
  },
  {
    id: 'a3',
    serialNumber: 2166,
    contractNo: '101999501',
    applicationNo: '24-2555A',
    customerCode: '345678901',
    submittedAt: '2025-02-07',
    approvedAt: '2025-04-30',
    status: '許可',
  },
  {
    id: 'a4',
    serialNumber: 2167,
    contractNo: '102001201',
    applicationNo: '24-2566A',
    customerCode: '456789012',
    submittedAt: '2025-02-07',
    approvedAt: '2025-05-14',
    status: '提出済',
    notes: '許可待ち',
  },
]

export default function ApplicationsPage() {
  const [records, setRecords] = useState<ApplicationRecord[]>(initialData)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'全て' | Status>('全て')
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<ApplicationRecord | null>(null)

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const hit =
        r.applicationNo.includes(keyword) ||
        (r.contractNo || '').includes(keyword) ||
        (r.customerCode || '').includes(keyword) ||
        (r.notes || '').includes(keyword)
      const statusOk = statusFilter === '全て' || r.status === statusFilter
      return hit && statusOk
    })
  }, [records, keyword, statusFilter])

  const nextSerial = useMemo(
    () => (records.length ? Math.max(...records.map((r) => r.serialNumber)) + 1 : 1),
    [records]
  )

  const onSubmit = (data: Partial<ApplicationRecord>) => {
    if (editing) {
      setRecords((prev) => prev.map((p) => (p.id === editing.id ? { ...editing, ...data } as ApplicationRecord : p)))
      setEditing(null)
      setIsOpen(false)
      return
    }
    const newRec: ApplicationRecord = {
      id: String(Date.now()),
      serialNumber: nextSerial,
      applicationNo: data.applicationNo || '',
      contractNo: data.contractNo || '',
      customerCode: data.customerCode || '',
      submittedAt: data.submittedAt || undefined,
      approvedAt: data.approvedAt || undefined,
      status: (data.status as Status) || '受付',
      withdrawNeeded: !!data.withdrawNeeded,
      withdrawCreated: !!data.withdrawCreated,
      notes: data.notes || '',
    }
    setRecords((prev) => [newRec, ...prev])
    setIsOpen(false)
  }

  return (
    <Layout>
      <div className="px-6 py-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">申請番号管理</h1>
            <p className="text-sm text-gray-500 mt-1">中電/NTT 申請の受付〜許可までを管理します（モック）。</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditing(null)
                setIsOpen(true)
              }}
              className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5 mr-1" /> 新規登録
            </button>
          </div>
        </div>

        {/* フィルタ */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="申請番号 / 契約No. / 顧客コード / 備考"
              className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as '全て' | Status)}
                className="px-2 py-2 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="全て">全て</option>
                <option value="受付">受付</option>
                <option value="提出済">提出済</option>
                <option value="許可">許可</option>
                <option value="取下げ">取下げ</option>
              </select>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div className="mt-4 bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-left text-xs text-gray-600">
                  <th className="px-3 py-2 font-medium whitespace-nowrap">整理番号</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">申請番号</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">受注番号</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">顧客コード</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">提出日</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">許可日</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">状態</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">取下げ</th>
                  <th className="px-3 py-2 font-medium whitespace-nowrap">備考</th>
                  <th className="px-3 py-2 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t text-sm odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2 tabular-nums text-gray-900">{r.serialNumber}</td>
                    <td className="px-3 py-2 font-medium text-blue-700">{r.applicationNo}</td>
                    <td className="px-3 py-2 text-gray-900">{r.contractNo}</td>
                    <td className="px-3 py-2 text-gray-900">{r.customerCode}</td>
                    <td className="px-3 py-2 text-gray-900">{r.submittedAt || '-'}</td>
                    <td className="px-3 py-2 text-gray-900">{r.approvedAt || '-'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ' +
                          (r.status === '許可'
                            ? 'bg-green-100 text-green-800'
                            : r.status === '提出済'
                            ? 'bg-yellow-100 text-yellow-800'
                            : r.status === '取下げ'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-blue-100 text-blue-800')
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {r.withdrawNeeded ? (
                        <span className="text-red-600 text-xs font-semibold">要</span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 max-w-[20rem] truncate text-gray-900" title={r.notes}>{r.notes || '-'}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="inline-flex items-center px-2 py-1 rounded border text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setEditing(r)
                          setIsOpen(true)
                        }}
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-1" /> 編集
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr className="bg-white">
                    <td colSpan={10} className="px-3 py-10 text-center text-sm text-gray-500">
                      条件に一致するデータがありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 text-xs text-gray-500 border-t">
            表示件数: {filtered.length} / 総件数: {records.length}
          </div>
        </div>

        {/* モーダル */}
        {isOpen && (
          <EditDialog
            initial={editing || { serialNumber: nextSerial, status: '受付', applicationNo: '' } as Partial<ApplicationRecord>}
            onClose={() => {
              setEditing(null)
              setIsOpen(false)
            }}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </Layout>
  )
}

function EditDialog({
  initial,
  onClose,
  onSubmit,
}: {
  initial: Partial<ApplicationRecord>
  onClose: () => void
  onSubmit: (data: Partial<ApplicationRecord>) => void
}) {
  const [form, setForm] = useState<Partial<ApplicationRecord>>(initial)

  const set = (key: keyof ApplicationRecord) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-[min(880px,92vw)] max-h-[90vh] overflow-auto rounded-lg shadow-xl">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">申請情報 {form.serialNumber ? `（整理番号: ${form.serialNumber}）` : ''}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
        >
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormRow label="申請番号" required>
              <input
                value={form.applicationNo || ''}
                onChange={set('applicationNo')}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="例: 24-2503A"
                required
              />
            </FormRow>
            <FormRow label="契約No.">
              <input
                value={form.contractNo || ''}
                onChange={set('contractNo')}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="例: 101080601"
              />
            </FormRow>
            <FormRow label="顧客コード">
              <input
                value={form.customerCode || ''}
                onChange={set('customerCode')}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400"
                placeholder="例: 45695"
              />
            </FormRow>
            <FormRow label="状態">
              <select
                value={(form.status as Status) || '受付'}
                onChange={set('status')}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              >
                <option value="受付">受付</option>
                <option value="提出済">提出済</option>
                <option value="許可">許可</option>
                <option value="取下げ">取下げ</option>
              </select>
            </FormRow>
            <FormRow label="提出日">
              <input
                type="date"
                value={form.submittedAt || ''}
                onChange={set('submittedAt')}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormRow>
            <FormRow label="許可日">
              <input
                type="date"
                value={form.approvedAt || ''}
                onChange={set('approvedAt')}
                className="w-full px-3 py-2 border rounded-md bg-white text-gray-900"
              />
            </FormRow>
            <FormRow label="取下げ必要">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={!!form.withdrawNeeded} onChange={set('withdrawNeeded')} />
                必要
              </label>
            </FormRow>
            <FormRow label="取下げ作成">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={!!form.withdrawCreated} onChange={set('withdrawCreated')} />
                作成済
              </label>
            </FormRow>
            <div className="sm:col-span-2">
              <FormRow label="備考">
                <textarea
                  value={form.notes || ''}
                  onChange={set('notes')}
                  className="w-full px-3 py-2 border rounded-md bg-white text-gray-900 placeholder:text-gray-400 min-h-[72px]"
                />
              </FormRow>
            </div>
          </div>
          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50">キャンセル</button>
            <button type="submit" className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">保存</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Layout from '@/components/Layout'
import { PlusIcon } from '@heroicons/react/24/outline'
import {
  RequestType,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  SurveyStatus,
  AttachmentStatus,
  ConstructionStatus,
  AssigneeType,
} from '@/types/application'
import {
  getApplications,
  addApplication,
  updateApplication,
  getNextSerialNumber,
  initializeApplicationData,
} from '@/lib/applications'
import { getContractors, getTeams } from '@/lib/contractors'
import SurveyTab from './components/SurveyTab'
import AttachmentTab from './components/AttachmentTab'
import ConstructionTab from './components/ConstructionTab'
import NewRequestModal from './components/NewRequestModal'
import EditSurveyModal from './components/EditSurveyModal'
import EditAttachmentModal from './components/EditAttachmentModal'
import EditConstructionModal from './components/EditConstructionModal'

type TabType = 'survey' | 'attachment' | 'construction'

const TAB_LABELS: Record<TabType, string> = {
  survey: '現地調査依頼',
  attachment: '共架・添架依頼',
  construction: '工事依頼',
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('survey')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<
    SurveyRequest | AttachmentRequest | ConstructionRequest | null
  >(null)

  // データ読み込み
  const [surveyData, setSurveyData] = useState<SurveyRequest[]>([])
  const [attachmentData, setAttachmentData] = useState<AttachmentRequest[]>([])
  const [constructionData, setConstructionData] = useState<ConstructionRequest[]>([])

  const contractors = getContractors()
  const teams = getTeams()

  // 初期化
  useEffect(() => {
    initializeApplicationData()
    loadData()
  }, [])

  const loadData = () => {
    setSurveyData(getApplications<SurveyRequest>('survey'))
    setAttachmentData(getApplications<AttachmentRequest>('attachment'))
    setConstructionData(getApplications<ConstructionRequest>('construction'))
  }

  // 新規作成
  const handleCreate = (
    type: RequestType,
    data: Partial<SurveyRequest | AttachmentRequest | ConstructionRequest>
  ) => {
    const baseData = {
      id: `${type}-${Date.now()}`,
      type,
      serialNumber: getNextSerialNumber(type),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    }

    if (type === 'survey') {
      const newItem: SurveyRequest = {
        ...baseData,
        type: 'survey',
        status: (data as Partial<SurveyRequest>).status || '未着手',
      } as SurveyRequest
      addApplication(newItem)
    } else if (type === 'attachment') {
      const newItem: AttachmentRequest = {
        ...baseData,
        type: 'attachment',
        status: (data as Partial<AttachmentRequest>).status || '受付',
      } as AttachmentRequest
      addApplication(newItem)
    } else if (type === 'construction') {
      const newItem: ConstructionRequest = {
        ...baseData,
        type: 'construction',
        status: (data as Partial<ConstructionRequest>).status || '未着手',
      } as ConstructionRequest
      addApplication(newItem)
    }

    loadData()
    setIsNewModalOpen(false)
  }

  // 更新
  const handleUpdate = (
    type: RequestType,
    id: string,
    updates: Partial<SurveyRequest | AttachmentRequest | ConstructionRequest>
  ) => {
    updateApplication(type, id, updates)
    loadData()
    setEditingItem(null)
  }

  // 編集開始
  const handleEdit = (
    item: SurveyRequest | AttachmentRequest | ConstructionRequest
  ) => {
    setEditingItem(item)
  }

  return (
    <Layout>
      <div className="px-6 py-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">申請番号管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              現地調査、共架・添架申請、工事依頼を一元管理します。
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-1" /> 新規依頼
          </button>
        </div>

        {/* タブ */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        <div className="mt-4">
          {activeTab === 'survey' && (
            <SurveyTab data={surveyData} onEdit={handleEdit} />
          )}
          {activeTab === 'attachment' && (
            <AttachmentTab data={attachmentData} onEdit={handleEdit} />
          )}
          {activeTab === 'construction' && (
            <ConstructionTab data={constructionData} onEdit={handleEdit} />
          )}
        </div>

        {/* 新規作成モーダル */}
        {isNewModalOpen && (
          <NewRequestModal
            defaultTab={activeTab}
            contractors={contractors}
            teams={teams}
            onClose={() => setIsNewModalOpen(false)}
            onCreate={handleCreate}
          />
        )}

        {/* 編集モーダル */}
        {editingItem && editingItem.type === 'survey' && (
          <EditSurveyModal
            item={editingItem as SurveyRequest}
            contractors={contractors}
            teams={teams}
            onClose={() => setEditingItem(null)}
            onSave={(updates) => handleUpdate('survey', editingItem.id, updates)}
          />
        )}
        {editingItem && editingItem.type === 'attachment' && (
          <EditAttachmentModal
            item={editingItem as AttachmentRequest}
            contractors={contractors}
            teams={teams}
            onClose={() => setEditingItem(null)}
            onSave={(updates) =>
              handleUpdate('attachment', editingItem.id, updates)
            }
          />
        )}
        {editingItem && editingItem.type === 'construction' && (
          <EditConstructionModal
            item={editingItem as ConstructionRequest}
            contractors={contractors}
            teams={teams}
            onClose={() => setEditingItem(null)}
            onSave={(updates) =>
              handleUpdate('construction', editingItem.id, updates)
            }
          />
        )}
      </div>
    </Layout>
  )
}

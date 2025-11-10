import {
  ApplicationRequest,
  SurveyRequest,
  AttachmentRequest,
  ConstructionRequest,
  RequestType,
  ProgressEntry,
  AttachedFile,
  SurveyFeasibility,
  SurveyFeasibilityResult,
  AttachmentNeeded,
  AttachmentApplicationReport,
} from '../types'

// ローカルストレージのキー
const STORAGE_KEYS = {
  survey: 'applications_survey',
  attachment: 'applications_attachment',
  construction: 'applications_construction',
} as const

// ========== 汎用CRUD操作 ==========

// データ取得
export const getApplications = <T extends ApplicationRequest>(
  type: RequestType
): T[] => {
  if (typeof window === 'undefined') return []
  try {
    const key = STORAGE_KEYS[type]
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error(`Failed to load ${type} applications:`, error)
    return []
  }
}

// データ保存
export const saveApplications = <T extends ApplicationRequest>(
  type: RequestType,
  applications: T[]
): void => {
  if (typeof window === 'undefined') return
  try {
    const key = STORAGE_KEYS[type]
    localStorage.setItem(key, JSON.stringify(applications))
  } catch (error) {
    console.error(`Failed to save ${type} applications:`, error)
  }
}

// データ追加
export const addApplication = <T extends ApplicationRequest>(
  application: T
): void => {
  const applications = getApplications<T>(application.type)
  applications.push(application)
  saveApplications(application.type, applications)
}

// データ更新
export const updateApplication = <T extends ApplicationRequest>(
  type: RequestType,
  id: string,
  updates: Partial<T>
): void => {
  const applications = getApplications<T>(type)
  const index = applications.findIndex((a) => a.id === id)
  if (index !== -1) {
    applications[index] = {
      ...applications[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveApplications(type, applications)
  }
}

// データ削除
export const deleteApplication = (type: RequestType, id: string): void => {
  const applications = getApplications(type)
  const filtered = applications.filter((a) => a.id !== id)
  saveApplications(type, filtered)
}

// IDでデータ取得
export const getApplicationById = <T extends ApplicationRequest>(
  type: RequestType,
  id: string
): T | undefined => {
  const applications = getApplications<T>(type)
  return applications.find((a) => a.id === id)
}

// 次の整理番号を取得
export const getNextSerialNumber = (type: RequestType): number => {
  const applications = getApplications(type)
  if (applications.length === 0) return 1
  const maxSerial = Math.max(...applications.map((a) => a.serialNumber))
  return maxSerial + 1
}

// ========== 型別アクセサ（型安全性向上） ==========

export const getSurveyRequests = (): SurveyRequest[] =>
  getApplications<SurveyRequest>('survey')

export const getAttachmentRequests = (): AttachmentRequest[] =>
  getApplications<AttachmentRequest>('attachment')

export const getConstructionRequests = (): ConstructionRequest[] =>
  getApplications<ConstructionRequest>('construction')

// ========== 進捗履歴管理 ==========

// 進捗履歴を追加
export const addProgressEntry = <T extends ApplicationRequest>(
  type: RequestType,
  id: string,
  entry: Omit<ProgressEntry, 'id'>
): void => {
  const applications = getApplications<T>(type)
  const index = applications.findIndex((a) => a.id === id)

  if (index !== -1) {
    const newEntry = {
      id: `progress-${Date.now()}`,
      ...entry,
    }

    const progressHistory = applications[index].progressHistory || []
    applications[index] = {
      ...applications[index],
      progressHistory: [...progressHistory, newEntry],
      lastUpdatedBy: entry.updatedBy,
      lastUpdatedByName: entry.updatedByName,
      updatedAt: new Date().toISOString(),
    }

    saveApplications(type, applications)
  }
}

// 進捗履歴を取得
export const getProgressHistory = (
  type: RequestType,
  id: string
): ProgressEntry[] => {
  const application = getApplicationById(type, id)
  return application?.progressHistory || []
}

// ========== ファイル添付管理 ==========

// FileをBase64文字列に変換
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

// Base64文字列からダウンロード可能なリンクを生成してダウンロード
export const downloadFile = (file: AttachedFile): void => {
  try {
    const link = document.createElement('a')
    link.href = file.fileData
    link.download = file.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Failed to download file:', error)
  }
}

// ファイルを依頼に添付
export const uploadFileToRequest = async <T extends ApplicationRequest>(
  type: RequestType,
  requestId: string,
  file: File,
  uploadedBy: string,
  uploadedByName: string,
  uploadedByRole: 'admin' | 'contractor',
  description?: string
): Promise<void> => {
  try {
    const applications = getApplications<T>(type)
    const index = applications.findIndex((a) => a.id === requestId)

    if (index === -1) {
      throw new Error('Application not found')
    }

    // FileをBase64に変換
    const fileData = await fileToBase64(file)

    // AttachedFileオブジェクト作成
    const attachedFile: AttachedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileData,
      uploadedBy,
      uploadedByName,
      uploadedByRole,
      uploadedAt: new Date().toISOString(),
      description,
    }

    // 既存のattachmentsを取得または初期化
    const currentAttachments = applications[index].attachments || {
      fromAdmin: [],
      fromContractor: [],
    }

    // ロールに応じて適切な配列に追加
    if (uploadedByRole === 'admin') {
      currentAttachments.fromAdmin = [
        ...currentAttachments.fromAdmin,
        attachedFile,
      ]
    } else {
      currentAttachments.fromContractor = [
        ...currentAttachments.fromContractor,
        attachedFile,
      ]
    }

    // 更新
    applications[index] = {
      ...applications[index],
      attachments: currentAttachments,
      updatedAt: new Date().toISOString(),
    }

    saveApplications(type, applications)
  } catch (error) {
    console.error('Failed to upload file:', error)
    throw error
  }
}

// ファイルを削除
export const deleteFileFromRequest = <T extends ApplicationRequest>(
  type: RequestType,
  requestId: string,
  fileId: string,
  source: 'admin' | 'contractor'
): void => {
  try {
    const applications = getApplications<T>(type)
    const index = applications.findIndex((a) => a.id === requestId)

    if (index === -1) {
      throw new Error('Application not found')
    }

    const currentAttachments = applications[index].attachments
    if (!currentAttachments) {
      return
    }

    // ソースに応じて該当ファイルを削除
    if (source === 'admin') {
      currentAttachments.fromAdmin = currentAttachments.fromAdmin.filter(
        (f) => f.id !== fileId
      )
    } else {
      currentAttachments.fromContractor = currentAttachments.fromContractor.filter(
        (f) => f.id !== fileId
      )
    }

    // 更新
    applications[index] = {
      ...applications[index],
      attachments: currentAttachments,
      updatedAt: new Date().toISOString(),
    }

    saveApplications(type, applications)
  } catch (error) {
    console.error('Failed to delete file:', error)
    throw error
  }
}

// 依頼時の備考を更新（管理者のみ）
export const updateRequestNotes = <T extends ApplicationRequest>(
  type: RequestType,
  requestId: string,
  adminNotes: string
): void => {
  try {
    const applications = getApplications<T>(type)
    const index = applications.findIndex((a) => a.id === requestId)

    if (index === -1) {
      throw new Error('Application not found')
    }

    const currentNotes = applications[index].requestNotes || {}

    applications[index] = {
      ...applications[index],
      requestNotes: {
        ...currentNotes,
        adminNotes,
      },
      updatedAt: new Date().toISOString(),
    }

    saveApplications(type, applications)
  } catch (error) {
    console.error('Failed to update request notes:', error)
    throw error
  }
}

// ========== 協力会社報告機能 ==========

/**
 * 工事可否判定を登録（現地調査依頼）
 */
export const updateSurveyFeasibility = (
  requestId: string,
  feasibility: SurveyFeasibility,
  reportedBy: string,
  reportedByName: string,
  reportedByTeam?: string
): void => {
  try {
    const applications = getApplications<SurveyRequest>('survey')
    const index = applications.findIndex((a) => a.id === requestId)

    if (index === -1) {
      throw new Error('Survey request not found')
    }

    const feasibilityResult: SurveyFeasibilityResult = {
      reportedAt: new Date().toISOString(),
      reportedBy,
      reportedByName,
      reportedByTeam,
      feasibility,
    }

    applications[index] = {
      ...applications[index],
      feasibilityResult,
      updatedAt: new Date().toISOString(),
    }

    saveApplications('survey', applications)
  } catch (error) {
    console.error('Failed to update survey feasibility:', error)
    throw error
  }
}

/**
 * 申請有無を登録（共架・添架依頼）
 */
export const updateAttachmentApplication = (
  requestId: string,
  applicationNeeded: AttachmentNeeded,
  reportedBy: string,
  reportedByName: string,
  reportedByTeam?: string
): void => {
  try {
    const applications = getApplications<AttachmentRequest>('attachment')
    const index = applications.findIndex((a) => a.id === requestId)

    if (index === -1) {
      throw new Error('Attachment request not found')
    }

    const applicationReport: AttachmentApplicationReport = {
      reportedAt: new Date().toISOString(),
      reportedBy,
      reportedByName,
      reportedByTeam,
      applicationNeeded,
    }

    applications[index] = {
      ...applications[index],
      applicationReport,
      updatedAt: new Date().toISOString(),
    }

    saveApplications('attachment', applications)
  } catch (error) {
    console.error('Failed to update attachment application:', error)
    throw error
  }
}

/**
 * 工事予定日を設定（管理者のみ）
 */
export const updateConstructionDate = (
  requestId: string,
  constructionDate: string,
  setBy: string,
  setByName: string
): void => {
  try {
    const applications = getApplications<ConstructionRequest>('construction')
    const index = applications.findIndex((a) => a.id === requestId)

    if (index === -1) {
      throw new Error('Construction request not found')
    }

    applications[index] = {
      ...applications[index],
      constructionDate,
      constructionDateSetBy: setBy,
      constructionDateSetByName: setByName,
      constructionDateSetAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveApplications('construction', applications)
  } catch (error) {
    console.error('Failed to update construction date:', error)
    throw error
  }
}


// ========== 初期データセットアップ ==========

export const initializeApplicationData = (): void => {
  // 現地調査依頼のサンプルデータ
  const existingSurvey = getSurveyRequests()
  if (existingSurvey.length === 0) {
    const sampleSurvey: SurveyRequest[] = [
      // 個別の例1
      {
        id: 'survey-1',
        type: 'survey',
        serialNumber: 1,
        orderNumber: '2024031500001',
        propertyType: '個別',
        customerCode: 'C123456',
        customerName: '山田太郎',
        address: '岡山県倉敷市中央1-2-3',
        phoneNumber: '086-123-4567',
        assigneeType: 'internal',
        contractorId: 'contractor-1',
        contractorName: '直営班',
        teamId: 'team-1',
        teamName: 'A班',
        status: '完了',
        kctReceivedDate: '2025-01-08',
        requestedAt: '2025-01-10',
        scheduledDate: '2025-01-15',
        completedAt: '2025-01-16',
        feasibilityResult: {
          reportedAt: '2025-01-16T14:30:00Z',
          reportedBy: 'contractor-1',
          reportedByName: '直営班',
          reportedByTeam: 'A班',
          feasibility: '可能',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 集合の例1
      {
        id: 'survey-2',
        type: 'survey',
        serialNumber: 2,
        orderNumber: '2024031600002',
        propertyType: '集合',
        collectiveCode: 'K001',
        collectiveHousingName: 'サンハイツ倉敷',
        address: '101号室 佐藤花子',
        phoneNumber: '086-234-5678',
        assigneeType: 'contractor',
        contractorId: 'contractor-2',
        contractorName: '栄光電気通信',
        teamId: 'team-3',
        teamName: '1班',
        status: '調査中',
        kctReceivedDate: '2025-01-18',
        requestedAt: '2025-01-20',
        scheduledDate: '2025-01-25',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 個別の例2
      {
        id: 'survey-3',
        type: 'survey',
        serialNumber: 3,
        orderNumber: '2024031700003',
        propertyType: '個別',
        customerCode: 'C789012',
        customerName: '鈴木一郎',
        address: '岡山県倉敷市水島7-8-9',
        phoneNumber: '086-345-6789',
        assigneeType: 'contractor',
        contractorId: 'contractor-3',
        contractorName: 'スライヴ',
        teamId: 'team-4',
        teamName: '第1班',
        status: '未着手',
        kctReceivedDate: '2025-01-22',
        requestedAt: '2025-01-23',
        scheduledDate: '2025-01-30',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 集合の例2
      {
        id: 'survey-4',
        type: 'survey',
        serialNumber: 4,
        orderNumber: '2024031800004',
        propertyType: '集合',
        collectiveCode: 'K002',
        collectiveHousingName: 'コーポ田中',
        address: '205号室 田中美咲',
        phoneNumber: '086-456-7890',
        assigneeType: 'internal',
        contractorId: 'contractor-1',
        contractorName: '直営班',
        teamId: 'team-2',
        teamName: 'B班',
        status: '調査中',
        kctReceivedDate: '2025-01-25',
        requestedAt: '2025-01-26',
        scheduledDate: '2025-02-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    saveApplications('survey', sampleSurvey)
  }

  // 共架・添架依頼のサンプルデータ
  const existingAttachment = getAttachmentRequests()
  if (existingAttachment.length === 0) {
    const sampleAttachment: AttachmentRequest[] = [
      // 個別の例1
      {
        id: 'attachment-1',
        type: 'attachment',
        serialNumber: 2164,
        orderNumber: '2024031500001',
        propertyType: '個別',
        customerCode: '123456789',
        customerName: '山田太郎',
        address: '岡山県倉敷市○○町1-2-3',
        assigneeType: 'internal',
        contractorId: 'contractor-1',
        contractorName: '直営班',
        teamId: 'team-1',
        teamName: 'A班',
        status: '許可',
        submittedAt: '2025-02-07',
        approvedAt: '2025-03-10',
        withdrawNeeded: false,
        postConstructionReport: true,
        requestedAt: '2025-02-05',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 個別の例2
      {
        id: 'attachment-2',
        type: 'attachment',
        serialNumber: 2165,
        orderNumber: '2024031800004',
        propertyType: '個別',
        customerCode: '456789012',
        customerName: '鈴木一郎',
        address: '岡山県倉敷市□□町7-8-9',
        assigneeType: 'contractor',
        contractorId: 'contractor-3',
        contractorName: 'スライヴ',
        teamId: 'team-4',
        teamName: '第1班',
        status: '提出済',
        submittedAt: '2025-02-07',
        withdrawNeeded: true,
        postConstructionReport: false,
        requestedAt: '2025-02-01',
        notes: '許可待ち',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 集合の例1
      {
        id: 'attachment-3',
        type: 'attachment',
        serialNumber: 2166,
        orderNumber: '2024031900005',
        propertyType: '集合',
        collectiveCode: 'K001',
        collectiveHousingName: 'サンハイツ倉敷',
        customerCode: '789012345',
        customerName: '田中花子',
        address: '101号室 田中花子',
        assigneeType: 'contractor',
        contractorId: 'contractor-2',
        contractorName: '栄光電気通信',
        teamId: 'team-3',
        teamName: '1班',
        status: '受付',
        withdrawNeeded: false,
        postConstructionReport: true,
        requestedAt: '2025-02-10',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // 集合の例2
      {
        id: 'attachment-4',
        type: 'attachment',
        serialNumber: 2167,
        orderNumber: '2024032000006',
        propertyType: '集合',
        collectiveCode: 'K002',
        collectiveHousingName: 'マンション桜',
        customerCode: '234567890',
        customerName: '佐藤健',
        address: '305号室 佐藤健',
        assigneeType: 'internal',
        contractorId: 'contractor-1',
        contractorName: '直営班',
        teamId: 'team-2',
        teamName: 'B班',
        status: '提出済',
        submittedAt: '2025-02-15',
        withdrawNeeded: true,
        postConstructionReport: false,
        requestedAt: '2025-02-12',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    saveApplications('attachment', sampleAttachment)
  }

  // 工事依頼のサンプルデータ
  const existingConstruction = getConstructionRequests()
  if (existingConstruction.length === 0) {
    const sampleConstruction: ConstructionRequest[] = [
      {
        id: 'construction-1',
        type: 'construction',
        serialNumber: 1,
        orderNumber: '2024031500001',
        propertyType: '個別',
        customerCode: '123456789',
        customerName: '山田太郎',
        address: '岡山県倉敷市○○町1-2-3',
        phoneNumber: '086-123-4567',
        assigneeType: 'internal',
        contractorId: 'contractor-1',
        contractorName: '直営班',
        teamId: 'team-2',
        teamName: 'B班',
        status: '完了',
        kctReceivedDate: '2025-02-28',
        constructionRequestedDate: '2025-03-01',
        constructionCompletedDate: '2025-03-15',
        postConstructionReport: '完了',
        constructionType: '宅内引込',
        constructionDate: '2025-03-15',
        requestedAt: '2025-03-01',
        completedAt: '2025-03-15',
        constructionResult: {
          actualDate: '2025-03-15',
          workHours: 3.5,
          materials: '光ケーブル50m、クランプ3個',
          notes: '問題なく完了',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'construction-2',
        type: 'construction',
        serialNumber: 2,
        orderNumber: '2024031700003',
        customerCode: '345678901',
        propertyType: '個別',
        customerName: '高橋次郎',
        address: '岡山県倉敷市◇◇町10-11-12',
        phoneNumber: '086-345-6789',
        assigneeType: 'contractor',
        contractorId: 'contractor-2',
        contractorName: '栄光電気通信',
        kctReceivedDate: '2025-03-05',
        constructionRequestedDate: '2025-03-10',
        postConstructionReport: '未完了',
        teamId: 'team-3',
        teamName: '1班',
        status: '未着手',
        constructionType: '宅内引込',
        requestedAt: '2025-03-10',
        scheduledDate: '2025-04-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    saveApplications('construction', sampleConstruction)
  }
}

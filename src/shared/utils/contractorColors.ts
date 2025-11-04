import { CONTRACTOR_COLORS } from './constants'

/**
 * 協力会社名から色名（blue, green, purple, gray）を取得
 */
export function getContractorColorName(contractorName: string): string {
  // CONTRACTOR_COLORSから直接取得を試みる
  if (contractorName in CONTRACTOR_COLORS) {
    return CONTRACTOR_COLORS[contractorName as keyof typeof CONTRACTOR_COLORS]
  }
  
  // 部分一致で検索（「栄光電気通信」→「栄光電気」など）
  const matchedKey = Object.keys(CONTRACTOR_COLORS).find(key => 
    contractorName.includes(key) || key.includes(contractorName)
  )
  
  if (matchedKey) {
    return CONTRACTOR_COLORS[matchedKey as keyof typeof CONTRACTOR_COLORS]
  }
  
  return 'gray'
}

/**
 * 協力会社名から背景色・ボーダー色・テキスト色のCSSクラスを取得（スケジュールバー用）
 */
export function getContractorColorClasses(contractorName: string): string {
  const colorName = getContractorColorName(contractorName)
  
  switch (colorName) {
    case 'blue':
      return 'bg-blue-200 border-blue-300 text-blue-900'
    case 'green':
      return 'bg-green-200 border-green-300 text-green-900'
    case 'purple':
      return 'bg-purple-200 border-purple-300 text-purple-900'
    default:
      return 'bg-gray-200 border-gray-300 text-gray-900'
  }
}

/**
 * 協力会社名から背景色のCSSクラスを取得（軽量な背景色用）
 */
export function getContractorBackgroundColorClass(contractorName: string): string {
  const colorName = getContractorColorName(contractorName)
  
  switch (colorName) {
    case 'blue':
      return 'bg-blue-50'
    case 'green':
      return 'bg-green-50'
    case 'purple':
      return 'bg-purple-50'
    default:
      return 'bg-gray-50'
  }
}

/**
 * 協力会社名から濃い背景色のCSSクラスを取得（バッジなど用）
 */
export function getContractorBadgeColorClasses(contractorName: string): string {
  const colorName = getContractorColorName(contractorName)
  
  switch (colorName) {
    case 'blue':
      return 'bg-blue-100 text-blue-800'
    case 'green':
      return 'bg-green-100 text-green-800'
    case 'purple':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * 協力会社名から濃い背景色のCSSクラスを取得（ヘッダーなど用）
 */
export function getContractorHeaderColorClasses(contractorName: string): string {
  const colorName = getContractorColorName(contractorName)
  
  switch (colorName) {
    case 'blue':
      return 'bg-blue-100 text-blue-900'
    case 'green':
      return 'bg-green-100 text-green-900'
    case 'purple':
      return 'bg-purple-100 text-purple-900'
    default:
      return 'bg-gray-100 text-gray-900'
  }
}

/**
 * 協力会社名から濃い色のCSSクラスを取得（週表示のスケジュールバーなど用）
 */
export function getContractorSolidColorClass(contractorName: string): string {
  const colorName = getContractorColorName(contractorName)
  
  switch (colorName) {
    case 'blue':
      return 'bg-blue-500'
    case 'green':
      return 'bg-green-500'
    case 'purple':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * 色名から背景色のCSSクラスを取得
 */
export function getColorBackgroundClass(colorName: string): string {
  switch (colorName) {
    case 'blue':
      return 'bg-blue-50'
    case 'green':
      return 'bg-green-50'
    case 'purple':
      return 'bg-purple-50'
    default:
      return 'bg-gray-50'
  }
}

/**
 * 色名から濃い背景色のCSSクラスを取得
 */
export function getColorHeaderClass(colorName: string): string {
  switch (colorName) {
    case 'blue':
      return 'bg-blue-100 text-blue-900'
    case 'green':
      return 'bg-green-100 text-green-900'
    case 'purple':
      return 'bg-purple-100 text-purple-900'
    default:
      return 'bg-gray-100 text-gray-900'
  }
}


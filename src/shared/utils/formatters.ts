/**
 * 日付フォーマットユーティリティ
 */

/**
 * DateオブジェクトをYYYY-MM-DD形式の文字列に変換
 * タイムゾーンの影響を受けないローカル日付を返す
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * YYYY-MM-DD形式の文字列をDateオブジェクトに変換
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * 日付を日本語形式でフォーマット (例: 2025年10月30日)
 */
export function formatDateJapanese(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

/**
 * 日付を曜日付きでフォーマット (例: 10/30(水))
 */
export function formatDateWithDayOfWeek(date: Date): string {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
  return `${month}/${day}(${dayOfWeek})`
}

/**
 * 時刻をHH:MM形式でフォーマット
 */
export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

/**
 * 数値を3桁カンマ区切りでフォーマット
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ja-JP')
}

/**
 * 電話番号をフォーマット (例: 086-123-4567)
 */
export function formatPhoneNumber(phone: string): string {
  // ハイフンを除去
  const cleaned = phone.replace(/-/g, '')

  // 10桁または11桁の場合のみフォーマット
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }

  return phone // フォーマットできない場合はそのまま返す
}

/**
 * ひらがなをカタカナに変換
 *
 * Unicode範囲:
 * - ひらがな: U+3041 ～ U+3096 (ぁ～ゖ)
 * - カタカナ: U+30A1 ～ U+30F6 (ァ～ヶ)
 * - 差分: 0x60 (96)
 *
 * 濁音・半濁音・小文字を含む全てのひらがなに対応
 *
 * @example
 * hiraganaToKatakana('たなか') // => 'タナカ'
 * hiraganaToKatakana('やまだ たろう') // => 'ヤマダ タロウ'
 * hiraganaToKatakana('ぱぴぷぺぽ') // => 'パピプペポ'
 * hiraganaToKatakana('サンハイツ') // => 'サンハイツ' (カタカナはそのまま)
 * hiraganaToKatakana('さんハイツ') // => 'サンハイツ' (混在OK)
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const code = match.charCodeAt(0) + 0x60
    return String.fromCharCode(code)
  })
}

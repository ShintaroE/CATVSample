/**
 * バリデーションユーティリティ
 */

/**
 * 必須チェック
 */
export function isRequired(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value != null
}

/**
 * 電話番号の形式チェック（日本の電話番号）
 */
export function isValidPhoneNumber(phone: string): boolean {
  // ハイフンを除去
  const cleaned = phone.replace(/-/g, '')
  // 10桁または11桁の数字のみ
  return /^0\d{9,10}$/.test(cleaned)
}

/**
 * メールアドレスの形式チェック
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 日付文字列の形式チェック (YYYY-MM-DD)
 */
export function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 時刻文字列の形式チェック (HH:MM)
 */
export function isValidTimeString(timeStr: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return regex.test(timeStr)
}

/**
 * 時刻の範囲チェック（開始 < 終了）
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return false
  }

  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  return startMinutes < endMinutes
}

/**
 * 過去の日付チェック
 */
export function isPastDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date < today
}

/**
 * 未来の日付チェック
 */
export function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return date > today
}

/**
 * パスワードの強度チェック
 * 最低8文字、英数字を含む
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password)
  )
}

/**
 * 数値範囲チェック
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

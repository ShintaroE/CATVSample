/**
 * ランダムなパスワードを生成する
 * @param length パスワードの長さ（デフォルト: 12）
 * @returns 生成されたパスワード
 */
export const generatePassword = (length: number = 12): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + symbols

  let password = ''

  // 最低1文字ずつ各カテゴリから選択
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // 残りの文字をランダムに選択
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // パスワードをシャッフル
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * シンプルなパスワードを生成する（記号なし）
 * @param length パスワードの長さ（デフォルト: 10）
 * @returns 生成されたパスワード
 */
export const generateSimplePassword = (length: number = 10): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'

  const allChars = uppercase + lowercase + numbers

  let password = ''

  // 最低1文字ずつ各カテゴリから選択
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]

  // 残りの文字をランダムに選択
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // パスワードをシャッフル
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

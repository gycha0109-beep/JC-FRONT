export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'
export const LOGIN_USER_KEY = 'loginUser'

function storageOrNull(storage) {
  return storage && typeof storage.getItem === 'function' ? storage : null
}

export function getAccessToken(storage = globalThis.localStorage) {
  const target = storageOrNull(storage)
  if (!target) return ''

  try {
    const token = target.getItem(ACCESS_TOKEN_KEY)
    return typeof token === 'string' ? token.trim() : ''
  } catch {
    return ''
  }
}

export function clearStoredAuth(storage = globalThis.localStorage) {
  const target = storageOrNull(storage)
  if (!target || typeof target.removeItem !== 'function') return

  try {
    target.removeItem(ACCESS_TOKEN_KEY)
    target.removeItem(REFRESH_TOKEN_KEY)
    target.removeItem(LOGIN_USER_KEY)
  } catch {
    return
  }
}

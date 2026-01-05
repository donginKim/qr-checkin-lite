// 관리자 PIN 검증
export async function verifyAdminPin(pin: string): Promise<boolean> {
  try {
    const resp = await fetch('/api/admin/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    return resp.ok
  } catch {
    return false
  }
}

// 인증 상태 저장 (세션 스토리지)
const AUTH_KEY = 'admin_authenticated'
const AUTH_EXPIRY_KEY = 'admin_auth_expiry'
const AUTH_DURATION = 60 * 60 * 1000 // 1시간

export function setAuthenticated() {
  sessionStorage.setItem(AUTH_KEY, 'true')
  sessionStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() + AUTH_DURATION))
}

export function isAuthenticated(): boolean {
  const auth = sessionStorage.getItem(AUTH_KEY)
  const expiry = sessionStorage.getItem(AUTH_EXPIRY_KEY)
  
  if (auth !== 'true' || !expiry) return false
  
  if (Date.now() > parseInt(expiry)) {
    clearAuthentication()
    return false
  }
  
  return true
}

export function clearAuthentication() {
  sessionStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(AUTH_EXPIRY_KEY)
}


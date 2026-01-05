// 성당 이름 조회
export async function getChurchName(): Promise<string> {
  try {
    const resp = await fetch('/api/settings/church-name')
    if (!resp.ok) return '성당'
    const data = await resp.json()
    return data.churchName || '성당'
  } catch {
    return '성당'
  }
}

// 간편 체크인 모드 조회
export async function getSimpleCheckinMode(): Promise<boolean> {
  try {
    const resp = await fetch('/api/settings/simple-checkin-mode')
    if (!resp.ok) return false
    const data = await resp.json()
    return data.enabled === true
  } catch {
    return false
  }
}

// 모든 설정 조회
export async function getAllSettings(): Promise<Record<string, string>> {
  const resp = await fetch('/api/admin/settings')
  if (!resp.ok) return {}
  return resp.json()
}

// 설정 변경
export async function updateSetting(key: string, value: string): Promise<void> {
  const resp = await fetch(`/api/admin/settings/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
  
  if (!resp.ok) {
    throw new Error('설정 저장 실패')
  }
}


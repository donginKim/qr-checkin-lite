// 세션 응답
export type SessionResponse = {
  id: string
  title: string
  sessionDate: string
  startsAt: string
  endsAt: string
  status: string
  createdAt: string
  shortCode: string
  qrUrl: string
}

// 공개용 세션 정보
export type SessionPublicInfo = {
  id: string
  title: string
  sessionDate: string
  status: string
  shortCode: string
}

// 세션 생성 요청
export type SessionCreateRequest = {
  title: string
  sessionDate: string
}

// 세션 목록 조회
export async function getSessions(): Promise<SessionResponse[]> {
  const resp = await fetch('/api/admin/sessions')
  if (!resp.ok) return []
  return resp.json()
}

// 세션 생성
export async function createSession(req: SessionCreateRequest): Promise<SessionResponse> {
  const resp = await fetch('/api/admin/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ message: '세션 생성 실패' }))
    throw new Error(error.message || '세션 생성 실패')
  }
  
  return resp.json()
}

// 세션 상세 (QR용 토큰 포함)
export async function getSessionWithToken(id: string): Promise<SessionResponse> {
  const resp = await fetch(`/api/admin/sessions/${encodeURIComponent(id)}/qr`)
  
  if (!resp.ok) {
    throw new Error('세션을 찾을 수 없습니다')
  }
  
  return resp.json()
}

// 세션 삭제
export async function deleteSession(id: string): Promise<void> {
  const resp = await fetch(`/api/admin/sessions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  
  if (!resp.ok) {
    throw new Error('세션 삭제 실패')
  }
}

// 세션 종료
export async function closeSession(id: string): Promise<void> {
  const resp = await fetch(`/api/admin/sessions/${encodeURIComponent(id)}/close`, {
    method: 'POST',
  })
  
  if (!resp.ok) {
    throw new Error('세션 종료 실패')
  }
}

// 짧은 코드로 세션 정보 조회 (공개 API)
export async function getSessionByCode(shortCode: string): Promise<SessionPublicInfo> {
  const resp = await fetch(`/api/sessions/code/${encodeURIComponent(shortCode)}`)
  
  if (!resp.ok) {
    throw new Error('유효하지 않은 코드입니다')
  }
  
  return resp.json()
}


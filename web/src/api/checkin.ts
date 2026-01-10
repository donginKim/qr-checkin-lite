// 참가자 검색 결과
export type ParticipantSearchItem = {
  id: number
  name: string
  phoneLast4: string
  baptismalName: string
  district: string
}

// 체크인 요청
export type CheckinRequest = {
  sessionId: string
  token: string
  participantId: number
  phone: string
}

export type CheckinResult = {
  ok: boolean
  message: string
}

// 이름으로 참가자 검색
export async function searchParticipants(query: string): Promise<ParticipantSearchItem[]> {
  if (!query.trim()) return []
  
  const resp = await fetch(`/api/participants/search?q=${encodeURIComponent(query)}&limit=10`)
  if (!resp.ok) return []
  
  return resp.json()
}

// 체크인 요청
export async function submitCheckin(req: CheckinRequest): Promise<CheckinResult> {
  const resp = await fetch('/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  const data = await resp.json().catch(() => ({}))

  if (!resp.ok) {
    const msg = data?.message ?? '요청 실패'
    return { ok: false, message: msg }
  }

  return data as CheckinResult
}

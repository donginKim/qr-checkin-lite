// 참가자 정보
export type Participant = {
  id: number
  name: string
  phone: string
  phoneLast4: string
  baptismalName: string
  district: string
}

// 참가자 목록 조회
export async function getParticipants(): Promise<Participant[]> {
  const resp = await fetch('/api/admin/participants')
  if (!resp.ok) return []
  return resp.json()
}

// 참가자 수 조회
export async function getParticipantCount(): Promise<number> {
  const resp = await fetch('/api/admin/participants/count')
  if (!resp.ok) return 0
  return resp.json()
}

// 참가자 추가
export type ParticipantCreateRequest = {
  name: string
  phone: string
  baptismalName?: string
  district?: string
}

export async function addParticipant(req: ParticipantCreateRequest): Promise<Participant> {
  const resp = await fetch('/api/admin/participants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ message: '등록 실패' }))
    throw new Error(error.message || '등록 실패')
  }
  
  return resp.json()
}

// 참가자 삭제
export async function deleteParticipant(id: number): Promise<void> {
  const resp = await fetch(`/api/admin/participants/${id}`, {
    method: 'DELETE',
  })
  
  if (!resp.ok) {
    throw new Error('삭제 실패')
  }
}

// Excel 파일 업로드
export type ImportResult = {
  totalRows: number
  inserted: number
  skipped: number
}

export async function uploadParticipantsExcel(
  file: File, 
  replaceAll: boolean = false
): Promise<ImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  
  const url = `/api/admin/participants/import?replaceAll=${replaceAll}`
  const resp = await fetch(url, {
    method: 'POST',
    body: formData,
  })
  
  if (!resp.ok) {
    const error = await resp.json().catch(() => ({ message: '업로드 실패' }))
    throw new Error(error.message || '업로드 실패')
  }
  
  return resp.json()
}

// 구역별 통계 조회
export async function getDistrictStats(): Promise<Record<string, number>> {
  const resp = await fetch('/api/admin/participants/stats/by-district')
  if (!resp.ok) return {}
  return resp.json()
}

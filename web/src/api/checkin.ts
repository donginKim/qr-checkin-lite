export type CheckinRequest = {
  sessionId: string
  token: string
  name: string
  phone: string
}

export type CheckinResult = {
  ok: boolean
  message: string
}

export async function submitCheckin(req: CheckinRequest): Promise<CheckinResult> {
  const resp = await fetch('/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })

  // 백엔드 GlobalExceptionHandler가 JSON 형태로 준다고 가정
  const data = await resp.json().catch(() => ({}))

  if (!resp.ok) {
    // 서버 에러 포맷이 {message: "..."} 또는 {code,message} 등일 수 있음
    const msg = data?.message ?? '요청 실패'
    return { ok: false, message: msg }
  }

  return data as CheckinResult
}
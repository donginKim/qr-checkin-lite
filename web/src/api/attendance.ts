import * as XLSX from 'xlsx'

// 출석 기록
export type AttendanceRecord = {
  id: number
  sessionId: string
  sessionTitle: string
  participantId: number
  name: string
  phone: string
  phoneLast4: string
  district: string
  checkedInAt: string
}

// 전체 출석 기록 조회
export async function getAttendances(sessionId?: string): Promise<AttendanceRecord[]> {
  const url = sessionId 
    ? `/api/admin/attendances?sessionId=${encodeURIComponent(sessionId)}`
    : '/api/admin/attendances'
  
  const resp = await fetch(url)
  if (!resp.ok) return []
  
  return resp.json()
}

// 엑셀 다운로드 (xlsx 형식)
export function downloadAttendancesExcel(attendances: AttendanceRecord[], filename?: string) {
  // 데이터 준비
  const data = attendances.map((att, idx) => ({
    '번호': idx + 1,
    '이름': att.name,
    '구역': att.district || '-',
    '전화번호': formatPhone(att.phone),
    '출석 시간': att.checkedInAt,
    '세션': att.sessionTitle,
  }))

  // 워크시트 생성
  const ws = XLSX.utils.json_to_sheet(data)

  // 컬럼 너비 설정
  ws['!cols'] = [
    { wch: 6 },   // 번호
    { wch: 12 },  // 이름
    { wch: 10 },  // 구역
    { wch: 15 },  // 전화번호
    { wch: 18 },  // 출석 시간
    { wch: 20 },  // 세션
  ]

  // 워크북 생성
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '출석내역')

  // 파일 다운로드
  const defaultFilename = `출석내역_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, filename || defaultFilename)
}

// 전화번호 포맷팅
function formatPhone(phone: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// 출석 내역 삭제 결과
export type DeleteAttendancesResult = {
  success: boolean
  deleted: number
  message: string
}

// 기간별 출석 내역 삭제
export async function deleteAttendancesByDateRange(startDate: string, endDate: string): Promise<DeleteAttendancesResult> {
  const resp = await fetch(`/api/admin/attendances?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, {
    method: 'DELETE',
  })
  
  if (!resp.ok) {
    return { success: false, deleted: 0, message: '삭제 실패' }
  }
  
  return resp.json()
}

// 세션별 출석 내역 삭제
export async function deleteAttendancesBySession(sessionId: string): Promise<DeleteAttendancesResult> {
  const resp = await fetch(`/api/admin/attendances?sessionId=${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
  })
  
  if (!resp.ok) {
    return { success: false, deleted: 0, message: '삭제 실패' }
  }
  
  return resp.json()
}

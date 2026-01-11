import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAttendances, downloadAttendancesExcel } from '../../api/attendance'
import type { AttendanceRecord } from '../../api/attendance'
import { getParticipants } from '../../api/participants'
import type { Participant } from '../../api/participants'
import { getSessions } from '../../api/sessions'
import type { SessionResponse } from '../../api/sessions'
import Logo from '../../components/Logo'

// 전화번호 포맷팅
function formatPhoneDisplay(phone: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

type ViewMode = 'list' | 'district'

// 구역별 출석 현황 타입
type DistrictStatus = {
  district: string
  total: number
  attended: number
  members: {
    id: number
    name: string
    baptismalName: string
    attended: boolean
  }[]
}

export default function AttendancesPage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [sessions, setSessions] = useState<SessionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    setLoading(true)
    try {
      const [sessionsData, participantsData] = await Promise.all([
        getSessions(),
        getParticipants()
      ])
      setSessions(sessionsData)
      setParticipants(participantsData)
      
      // 기본적으로 전체 출석 로드
      const attendancesData = await getAttendances()
      setAttendances(attendancesData)
    } finally {
      setLoading(false)
    }
  }

  async function loadAttendances(sessionId?: string) {
    setLoading(true)
    try {
      const data = await getAttendances(sessionId || undefined)
      setAttendances(data)
    } finally {
      setLoading(false)
    }
  }

  // 세션 선택 핸들러
  function handleSessionChange(sessionId: string) {
    setSelectedSessionId(sessionId)
    loadAttendances(sessionId || undefined)
  }

  // 구역별 출석 현황 계산
  function getDistrictStatuses(): DistrictStatus[] {
    // 출석한 참가자 ID Set
    const attendedIds = new Set(attendances.map(a => a.participantId))

    // 구역별 그룹핑
    const districtMap = new Map<string, DistrictStatus>()

    participants.forEach(p => {
      const district = p.district || '미지정'
      
      if (!districtMap.has(district)) {
        districtMap.set(district, {
          district,
          total: 0,
          attended: 0,
          members: []
        })
      }

      const status = districtMap.get(district)!
      status.total++
      
      const isAttended = attendedIds.has(p.id)
      if (isAttended) {
        status.attended++
      }

      status.members.push({
        id: p.id,
        name: p.name,
        baptismalName: p.baptismalName || '',
        attended: isAttended
      })
    })

    // 구역명 순으로 정렬, 미지정은 마지막
    return Array.from(districtMap.values()).sort((a, b) => {
      if (a.district === '미지정') return 1
      if (b.district === '미지정') return -1
      return a.district.localeCompare(b.district, 'ko')
    })
  }

  const districtStatuses = getDistrictStatuses()
  const totalAttended = districtStatuses.reduce((sum, d) => sum + d.attended, 0)
  const totalMembers = districtStatuses.reduce((sum, d) => sum + d.total, 0)

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <Link to="/admin" style={styles.backLink}>← 대시보드</Link>
        <Logo size="medium" />
        <h1 style={styles.title}>출석 내역</h1>
      </div>

      {/* 세션 선택 */}
      <div style={styles.sessionSelectCard}>
        <label style={styles.selectLabel}>📅 세션 선택</label>
        <select
          value={selectedSessionId}
          onChange={(e) => handleSessionChange(e.target.value)}
          style={styles.sessionSelect}
        >
          <option value="">전체 출석 내역</option>
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.sessionDate})
            </option>
          ))}
        </select>
      </div>

      {/* 보기 모드 탭 */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            ...styles.tab,
            ...(viewMode === 'list' ? styles.tabActive : {})
          }}
        >
          📋 목록 보기
        </button>
        <button
          onClick={() => setViewMode('district')}
          style={{
            ...styles.tab,
            ...(viewMode === 'district' ? styles.tabActive : {})
          }}
        >
          📊 구역별 현황
        </button>
      </div>

      {/* 통계 */}
      <div style={styles.statsCard}>
        <div style={styles.statsLeft}>
          <span style={styles.statsLabel}>
            {viewMode === 'district' ? '총 출석률' : '총 출석'}
          </span>
          <span style={styles.statsValue}>
            {viewMode === 'district' 
              ? `${totalAttended}/${totalMembers}명`
              : `${attendances.length}명`
            }
          </span>
          {viewMode === 'district' && totalMembers > 0 && (
            <span style={styles.statsPercent}>
              ({Math.round(totalAttended / totalMembers * 100)}%)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => downloadAttendancesExcel(attendances)} 
            disabled={attendances.length === 0}
            style={{ padding: '10px 16px' }}
          >
            📥 엑셀 다운로드
          </button>
          <button 
            onClick={() => loadAttendances(selectedSessionId || undefined)} 
            className="secondary" 
            style={{ padding: '10px 16px' }}
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      {/* 목록 보기 */}
      {viewMode === 'list' && (
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.emptyState}>로딩 중...</div>
          ) : attendances.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>📭</span>
              <p>출석 기록이 없습니다.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>이름</th>
                    <th>구역</th>
                    <th>전화번호</th>
                    <th>출석 시간</th>
                    <th>세션</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att, idx) => (
                    <tr key={att.id}>
                      <td style={{ color: 'var(--color-text-light)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{att.name}</td>
                      <td style={{ color: 'var(--color-text-light)' }}>{att.district || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 14 }}>
                        {formatPhoneDisplay(att.phone)}
                      </td>
                      <td>
                        <span style={styles.timeBadge}>{att.checkedInAt}</span>
                      </td>
                      <td style={{ color: 'var(--color-text-light)', fontSize: 13 }}>
                        {att.sessionTitle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 구역별 현황 */}
      {viewMode === 'district' && (
        <div style={styles.districtView}>
          {loading ? (
            <div style={styles.emptyState}>로딩 중...</div>
          ) : districtStatuses.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>👥</span>
              <p>등록된 회원이 없습니다.</p>
            </div>
          ) : (
            districtStatuses.map(status => (
              <div key={status.district} style={styles.districtCard}>
                <div style={styles.districtHeader}>
                  <h3 style={styles.districtTitle}>
                    📍 {status.district}
                  </h3>
                  <div style={styles.districtStats}>
                    <span style={styles.districtAttendance}>
                      출석 {status.attended}/{status.total}명
                    </span>
                    <span style={{
                      ...styles.districtPercent,
                      background: status.attended === status.total 
                        ? 'var(--color-success)' 
                        : status.attended / status.total >= 0.5 
                          ? 'var(--color-secondary)' 
                          : 'var(--color-error)'
                    }}>
                      {Math.round(status.attended / status.total * 100)}%
                    </span>
                  </div>
                </div>
                <div style={styles.memberList}>
                  {/* 출석한 사람 먼저, 그 다음 미출석 */}
                  {status.members
                    .sort((a, b) => {
                      if (a.attended === b.attended) return a.name.localeCompare(b.name, 'ko')
                      return a.attended ? -1 : 1
                    })
                    .map(member => (
                      <div 
                        key={member.id} 
                        style={{
                          ...styles.memberItem,
                          ...(member.attended ? styles.memberAttended : styles.memberAbsent)
                        }}
                      >
                        <span style={styles.memberStatus}>
                          {member.attended ? '✅' : '❌'}
                        </span>
                        <span style={styles.memberName}>{member.name}</span>
                        {member.baptismalName && (
                          <span style={styles.memberBaptismal}>({member.baptismalName})</span>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 푸터 */}
      <div style={styles.footer}>
        <Link to="/admin" style={styles.footerLink}>
          ← 관리자 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '40px 20px',
    paddingTop: 100,
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
    padding: '16px 20px',
    background: 'var(--color-background)',
    borderBottom: '1px solid var(--color-border)',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  backLink: {
    position: 'absolute' as const,
    left: 20,
    fontSize: 14,
    color: 'var(--color-text-light)',
    padding: '8px 12px',
    borderRadius: 8,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  },
  title: {
    fontSize: 24,
    margin: 0,
    color: 'var(--color-primary)',
  },
  sessionSelectCard: {
    marginBottom: 16,
    padding: 16,
    background: 'white',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 12px rgba(61, 41, 20, 0.06)',
  },
  selectLabel: {
    display: 'block',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  sessionSelect: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 16,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    background: 'white',
  },
  tabContainer: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    background: 'white',
    color: 'var(--color-text-light)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: 'white',
  },
  statsCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    background: 'linear-gradient(135deg, var(--color-surface) 0%, #FFF9E6 100%)',
    borderRadius: 12,
    border: '1px solid var(--color-secondary-light)',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statsLabel: {
    color: 'var(--color-text-light)',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  statsPercent: {
    fontSize: 16,
    color: 'var(--color-success)',
    fontWeight: 600,
  },
  tableCard: {
    background: 'white',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
    overflow: 'hidden',
  },
  emptyState: {
    textAlign: 'center',
    padding: 60,
    color: 'var(--color-text-light)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-success)',
  },
  // 구역별 현황 스타일
  districtView: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  districtCard: {
    background: 'white',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
    overflow: 'hidden',
  },
  districtHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, var(--color-surface) 0%, #FFF9E6 100%)',
    borderBottom: '1px solid var(--color-border)',
    flexWrap: 'wrap',
    gap: 12,
  },
  districtTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  districtStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  districtAttendance: {
    fontSize: 15,
    color: 'var(--color-text)',
    fontWeight: 500,
  },
  districtPercent: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 700,
    color: 'white',
  },
  memberList: {
    padding: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 8,
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
  },
  memberAttended: {
    background: '#E8F5E9',
    border: '1px solid #C8E6C9',
  },
  memberAbsent: {
    background: '#FFEBEE',
    border: '1px solid #FFCDD2',
  },
  memberStatus: {
    fontSize: 16,
  },
  memberName: {
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  memberBaptismal: {
    fontSize: 12,
    color: 'var(--color-text-light)',
  },
  footer: {
    marginTop: 40,
    paddingTop: 24,
    borderTop: '1px solid var(--color-border)',
    textAlign: 'center',
  },
  footerLink: {
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
}

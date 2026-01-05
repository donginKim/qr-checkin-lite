import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAttendances, downloadAttendancesExcel } from '../../api/attendance'
import type { AttendanceRecord } from '../../api/attendance'
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

export default function AttendancesPage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSessionId, setFilterSessionId] = useState('')

  async function loadAttendances() {
    setLoading(true)
    try {
      const data = await getAttendances(filterSessionId || undefined)
      setAttendances(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttendances()
  }, [])

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    loadAttendances()
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <Logo size="medium" />
        <h1 style={styles.title}>출석 내역</h1>
      </div>

      {/* 필터 */}
      <form onSubmit={handleFilter} style={styles.filterCard}>
        <input
          value={filterSessionId}
          onChange={(e) => setFilterSessionId(e.target.value)}
          placeholder="세션 ID로 필터링..."
          style={styles.filterInput}
        />
        <button type="submit">검색</button>
        <button
          type="button"
          className="secondary"
          onClick={() => { setFilterSessionId(''); loadAttendances(); }}
        >
          초기화
        </button>
      </form>

      {/* 통계 */}
      <div style={styles.statsCard}>
        <div style={styles.statsLeft}>
          <span style={styles.statsLabel}>총 출석</span>
          <span style={styles.statsValue}>{attendances.length}명</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => downloadAttendancesExcel(attendances)} 
            disabled={attendances.length === 0}
            style={{ padding: '10px 16px' }}
          >
            📥 엑셀 다운로드
          </button>
          <button onClick={loadAttendances} className="secondary" style={{ padding: '10px 16px' }}>
            🔄 새로고침
          </button>
        </div>
      </div>

      {/* 테이블 */}
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
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  cross: {
    fontSize: 36,
    color: 'var(--color-secondary)',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    margin: 0,
    color: 'var(--color-primary)',
  },
  filterCard: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    padding: 20,
    background: 'white',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 12px rgba(61, 41, 20, 0.06)',
    flexWrap: 'wrap',
  },
  filterInput: {
    flex: 1,
    minWidth: 200,
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

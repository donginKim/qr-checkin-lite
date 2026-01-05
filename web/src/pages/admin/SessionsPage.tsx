import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSessions, createSession, deleteSession } from '../../api/sessions'
import type { SessionResponse } from '../../api/sessions'
import Logo from '../../components/Logo'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // 새 세션 폼
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState<string | null>(null)

  async function loadSessions() {
    setLoading(true)
    try {
      const data = await getSessions()
      setSessions(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !sessionDate) return

    setCreating(true)
    setError(null)

    try {
      await createSession({ title: title.trim(), sessionDate })
      setTitle('')
      setShowForm(false)
      loadSessions()
    } catch (err) {
      setError(err instanceof Error ? err.message : '세션 생성 실패')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 세션을 삭제하시겠습니까?')) return
    
    try {
      await deleteSession(id)
      loadSessions()
    } catch (err) {
      alert('삭제 실패')
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${date.getFullYear()}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getDate().toString().padStart(2,'0')} (${days[date.getDay()]})`
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <Logo size="medium" />
        <h1 style={styles.title}>세션 관리</h1>
        <p style={styles.subtitle}>출석 체크 세션을 생성하고 관리합니다</p>
      </div>

      {/* 새 세션 버튼/폼 */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={styles.createButton}>
          + 새 세션 만들기
        </button>
      ) : (
        <form onSubmit={handleCreate} style={styles.formCard}>
          <h3 style={styles.formTitle}>새 세션 만들기</h3>
          
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>세션 이름</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 주일미사, 청년미사"
                style={styles.input}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>날짜</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formActions}>
            <button type="submit" disabled={creating || !title.trim()}>
              {creating ? '생성 중...' : '세션 생성'}
            </button>
            <button 
              type="button" 
              className="secondary" 
              onClick={() => { setShowForm(false); setError(null); }}
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 세션 목록 */}
      <div style={styles.sectionTitle}>
        <span>세션 목록</span>
        <button onClick={loadSessions} className="secondary" style={{ padding: '6px 12px', fontSize: 14 }}>
          🔄
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>로딩 중...</div>
      ) : sessions.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: 48, marginBottom: 16 }}>📅</span>
          <p>생성된 세션이 없습니다.</p>
          <p style={{ fontSize: 14, color: 'var(--color-text-light)' }}>
            위의 버튼을 눌러 새 세션을 만드세요.
          </p>
        </div>
      ) : (
        <div style={styles.sessionList}>
          {sessions.map((session) => (
            <div key={session.id} style={styles.sessionCard}>
              <div style={styles.sessionMain}>
                <div style={styles.sessionInfo}>
                  <div style={styles.sessionTitle}>{session.title}</div>
                  <div style={styles.sessionDate}>{formatDate(session.sessionDate)}</div>
                </div>
                <div style={{
                  ...styles.statusBadge,
                  background: session.status === 'ACTIVE' 
                    ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
                    : 'linear-gradient(135deg, #EEEEEE 0%, #E0E0E0 100%)',
                  color: session.status === 'ACTIVE' ? 'var(--color-success)' : '#666',
                }}>
                  {session.status === 'ACTIVE' ? '진행중' : '종료'}
                </div>
              </div>
              
              <div style={styles.sessionActions}>
                <Link 
                  to={`/admin/qr/${encodeURIComponent(session.id)}`}
                  style={styles.qrButton}
                >
                  📱 QR 표시
                </Link>
                <button 
                  onClick={() => handleDelete(session.id)}
                  className="secondary"
                  style={{ padding: '8px 12px', fontSize: 13, color: 'var(--color-error)' }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
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
    maxWidth: 800,
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
    margin: '0 0 8px 0',
    color: 'var(--color-primary)',
  },
  subtitle: {
    margin: 0,
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  createButton: {
    width: '100%',
    padding: 20,
    fontSize: 16,
    marginBottom: 24,
    background: 'linear-gradient(135deg, var(--color-secondary) 0%, #B8941F 100%)',
  },
  formCard: {
    background: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
  },
  formTitle: {
    margin: '0 0 20px 0',
    color: 'var(--color-primary)',
    fontSize: 18,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontWeight: 500,
    fontSize: 14,
  },
  input: {
    padding: '12px 14px',
  },
  error: {
    padding: 12,
    background: '#FFEBEE',
    borderRadius: 8,
    color: 'var(--color-error)',
    marginBottom: 16,
    fontSize: 14,
  },
  formActions: {
    display: 'flex',
    gap: 12,
  },
  sectionTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  emptyState: {
    textAlign: 'center',
    padding: 60,
    background: 'white',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-light)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  sessionCard: {
    background: 'white',
    borderRadius: 12,
    padding: 20,
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 12px rgba(61, 41, 20, 0.06)',
  },
  sessionMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionInfo: {},
  sessionTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--color-primary)',
    marginBottom: 4,
  },
  sessionDate: {
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  sessionActions: {
    display: 'flex',
    gap: 10,
  },
  qrButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
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


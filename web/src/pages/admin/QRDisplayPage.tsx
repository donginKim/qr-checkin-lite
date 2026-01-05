import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSessionWithToken } from '../../api/sessions'
import type { SessionResponse } from '../../api/sessions'
import { useChurch } from '../../context/ChurchContext'
import Logo from '../../components/Logo'

export default function QRDisplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { churchName } = useChurch()
  const [session, setSession] = useState<SessionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  async function loadSession() {
    if (!sessionId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await getSessionWithToken(sessionId)
      setSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '세션 로드 실패')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSession()
  }, [sessionId])

  // ESC 키로 전체화면 해제
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 (${days[date.getDay()]})`
  }

  // QR 코드 URL (외부 API 사용)
  const qrCodeUrl = session?.qrUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(session.qrUrl)}`
    : null

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>⏳</div>
        <p>로딩 중...</p>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div style={styles.errorContainer}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <p>{error || '세션을 찾을 수 없습니다'}</p>
        <Link to="/admin/sessions">← 세션 목록으로</Link>
      </div>
    )
  }

  // 전체화면 모드
  if (fullscreen) {
    return (
      <div style={styles.fullscreenContainer} onClick={() => setFullscreen(false)}>
        <div style={styles.fullscreenContent}>
          <Logo size="xlarge" style={{ marginBottom: 16 }} />
          <h1 style={styles.fullscreenChurchName}>{churchName}</h1>
          <h2 style={styles.fullscreenTitle}>{session.title}</h2>
          <p style={styles.fullscreenDate}>{formatDate(session.sessionDate)}</p>
          
          <div style={styles.fullscreenQR}>
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.fullscreenQRImage} />}
          </div>
          
          <p style={styles.fullscreenHint}>스마트폰으로 QR 코드를 스캔하세요</p>
          <p style={styles.fullscreenEsc}>화면을 터치하거나 ESC를 눌러 닫기</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <Link to="/admin/sessions" style={styles.backLink}>← 세션 목록</Link>
      </div>

      {/* 세션 정보 */}
      <div style={styles.sessionCard}>
        <Logo size="medium" style={{ marginBottom: 8 }} />
        <h1 style={styles.sessionTitle}>{session.title}</h1>
        <p style={styles.sessionDate}>{formatDate(session.sessionDate)}</p>
        
        <div style={{
          ...styles.statusBadge,
          background: session.status === 'ACTIVE' 
            ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
            : '#EEE',
          color: session.status === 'ACTIVE' ? 'var(--color-success)' : '#666',
        }}>
          {session.status === 'ACTIVE' ? '✅ 진행중' : '종료됨'}
        </div>
      </div>

      {/* QR 코드 */}
      <div style={styles.qrCard}>
        <h2 style={styles.qrTitle}>출석 체크 QR 코드</h2>
        
        <div style={styles.qrWrapper}>
          {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={styles.qrImage} />}
        </div>

        <p style={styles.qrHint}>스마트폰 카메라로 스캔하세요</p>

        <div style={styles.qrUrl}>
          <span style={styles.qrUrlLabel}>URL:</span>
          <code style={styles.qrUrlCode}>{session.qrUrl}</code>
        </div>

        <button onClick={() => setFullscreen(true)} style={styles.fullscreenButton}>
          🖥️ 전체화면으로 표시
        </button>
      </div>

      {/* 새 토큰 버튼 */}
      <div style={styles.actions}>
        <button onClick={loadSession} className="secondary">
          🔄 새 토큰 생성
        </button>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '20px',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'var(--color-text-light)',
  },
  spinner: {
    fontSize: 48,
    marginBottom: 16,
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    color: 'var(--color-text-light)',
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
  },
  backLink: {
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  sessionCard: {
    background: 'white',
    borderRadius: 20,
    padding: 32,
    textAlign: 'center',
    marginBottom: 24,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
  },
  cross: {
    fontSize: 48,
    color: 'var(--color-secondary)',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 28,
    margin: '0 0 8px 0',
    color: 'var(--color-primary)',
  },
  sessionDate: {
    color: 'var(--color-text-light)',
    margin: '0 0 16px 0',
    fontSize: 16,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  qrCard: {
    background: 'white',
    borderRadius: 20,
    padding: 32,
    textAlign: 'center',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
  },
  qrTitle: {
    fontSize: 18,
    margin: '0 0 24px 0',
    color: 'var(--color-primary)',
  },
  qrWrapper: {
    display: 'inline-block',
    padding: 20,
    background: 'white',
    borderRadius: 16,
    border: '4px solid var(--color-secondary)',
    marginBottom: 20,
  },
  qrImage: {
    display: 'block',
    width: 280,
    height: 280,
  },
  qrHint: {
    color: 'var(--color-text-light)',
    margin: '0 0 20px 0',
  },
  qrUrl: {
    background: 'var(--color-surface)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 12,
    wordBreak: 'break-all',
  },
  qrUrlLabel: {
    color: 'var(--color-text-light)',
    marginRight: 8,
  },
  qrUrlCode: {
    color: 'var(--color-primary)',
  },
  fullscreenButton: {
    width: '100%',
    padding: 16,
    fontSize: 16,
    background: 'linear-gradient(135deg, var(--color-secondary) 0%, #B8941F 100%)',
  },
  actions: {
    marginTop: 24,
    textAlign: 'center',
  },
  // 전체화면 스타일
  fullscreenContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #FFFEF9 0%, #FDF8F3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    cursor: 'pointer',
  },
  fullscreenContent: {
    textAlign: 'center',
    padding: 40,
  },
  fullscreenCross: {
    fontSize: 72,
    color: 'var(--color-secondary)',
    marginBottom: 16,
    textShadow: '0 4px 12px rgba(201, 162, 39, 0.3)',
  },
  fullscreenChurchName: {
    fontSize: 32,
    margin: '0 0 8px 0',
    color: 'var(--color-text-light)',
    fontWeight: 400,
  },
  fullscreenTitle: {
    fontSize: 42,
    margin: '0 0 8px 0',
    color: 'var(--color-primary)',
  },
  fullscreenDate: {
    fontSize: 24,
    color: 'var(--color-text-light)',
    margin: '0 0 40px 0',
  },
  fullscreenQR: {
    display: 'inline-block',
    padding: 24,
    background: 'white',
    borderRadius: 24,
    border: '6px solid var(--color-secondary)',
    boxShadow: '0 8px 40px rgba(61, 41, 20, 0.15)',
    marginBottom: 32,
  },
  fullscreenQRImage: {
    display: 'block',
    width: 350,
    height: 350,
  },
  fullscreenHint: {
    fontSize: 24,
    color: 'var(--color-text)',
    margin: '0 0 16px 0',
    fontWeight: 500,
  },
  fullscreenEsc: {
    fontSize: 14,
    color: 'var(--color-text-light)',
    margin: 0,
  },
}


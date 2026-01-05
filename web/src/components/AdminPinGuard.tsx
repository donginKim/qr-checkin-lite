import { useState, useEffect } from 'react'
import { verifyAdminPin, isAuthenticated, setAuthenticated } from '../api/admin-auth'

type Props = {
  children: React.ReactNode
}

export default function AdminPinGuard({ children }: Props) {
  const [authenticated, setAuthenticatedState] = useState(false)
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // 기존 인증 상태 확인
    if (isAuthenticated()) {
      setAuthenticatedState(true)
    }
    setChecking(false)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length !== 4) {
      setError('4자리 비밀번호를 입력하세요')
      return
    }

    setLoading(true)
    setError('')

    const success = await verifyAdminPin(pin)
    
    if (success) {
      setAuthenticated()
      setAuthenticatedState(true)
    } else {
      setError('비밀번호가 일치하지 않습니다')
      setPin('')
    }
    
    setLoading(false)
  }

  function handlePinChange(value: string) {
    // 숫자만 허용, 4자리까지
    const cleaned = value.replace(/\D/g, '').slice(0, 4)
    setPin(cleaned)
    setError('')
  }

  if (checking) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}>⏳</div>
      </div>
    )
  }

  if (authenticated) {
    return <>{children}</>
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🔐</div>
        <h2 style={styles.title}>관리자 인증</h2>
        <p style={styles.subtitle}>4자리 비밀번호를 입력하세요</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            placeholder="••••"
            style={styles.pinInput}
            autoFocus
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading || pin.length !== 4}>
            {loading ? '확인 중...' : '확인'}
          </button>
        </form>

        <a href="/" style={styles.backLink}>← 홈으로 돌아가기</a>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    background: 'white',
    borderRadius: 20,
    padding: 40,
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(61, 41, 20, 0.1)',
    border: '1px solid var(--color-border)',
    maxWidth: 360,
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    margin: '0 0 8px 0',
    color: 'var(--color-primary)',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: 'var(--color-text-light)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  pinInput: {
    fontSize: 32,
    textAlign: 'center',
    letterSpacing: 16,
    padding: '16px 20px',
    fontFamily: 'monospace',
  },
  error: {
    color: '#E53935',
    margin: 0,
    fontSize: 14,
  },
  backLink: {
    display: 'block',
    marginTop: 24,
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  spinner: {
    fontSize: 48,
  },
}


import { Link } from 'react-router-dom'
import { useChurch } from '../context/ChurchContext'
import Logo from '../components/Logo'

export default function Home() {
  const { churchName } = useChurch()

  return (
    <div style={styles.container}>
      {/* 상단 글귀 */}
      <div style={styles.topMotto}>
        <span style={styles.mottoText}>面刑無我</span>
        <span style={styles.mottoSub}>면형무아</span>
      </div>

      {/* 히어로 섹션 */}
      <div style={styles.hero}>
        <Logo size="xlarge" style={{ marginBottom: 16 }} />
        <h1 style={styles.title}>{churchName} 출석 체크</h1>
        <p style={styles.subtitle}>
          출석 관리 시스템
        </p>
      </div>

      {/* 빠른 링크 */}
      <div style={styles.cardGrid}>
        <Link to="/checkin?sid=default&t=token" style={styles.card}>
          <div style={styles.cardIcon}>🙏</div>
          <div style={styles.cardTitle}>출석하기</div>
          <div style={styles.cardDesc}>QR 코드로 출석 체크</div>
        </Link>

        <Link to="/admin" style={styles.card}>
          <div style={styles.cardIcon}>⚙️</div>
          <div style={styles.cardTitle}>관리자</div>
          <div style={styles.cardDesc}>출석 내역 및 신자 관리</div>
        </Link>
      </div>

      {/* 푸터 - 세 가지 덕목 */}
      <div style={styles.footer}>
        <div style={styles.virtuesContainer}>
          <div style={styles.virtue}>
            <span style={styles.virtueHanja}>點省</span>
            <span style={styles.virtueText}>점성</span>
          </div>
          <div style={styles.virtueDivider}>·</div>
          <div style={styles.virtue}>
            <span style={styles.virtueHanja}>沈默</span>
            <span style={styles.virtueText}>침묵</span>
          </div>
          <div style={styles.virtueDivider}>·</div>
          <div style={styles.virtue}>
            <span style={styles.virtueHanja}>大越</span>
            <span style={styles.virtueText}>대월</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  topMotto: {
    textAlign: 'center',
    marginBottom: 32,
    padding: '20px 0',
    borderBottom: '1px solid var(--color-border)',
  },
  mottoText: {
    display: 'block',
    fontSize: 36,
    fontWeight: 300,
    letterSpacing: 16,
    color: 'var(--color-primary)',
    marginBottom: 8,
  },
  mottoSub: {
    display: 'block',
    fontSize: 14,
    color: 'var(--color-text-light)',
    letterSpacing: 8,
  },
  hero: {
    textAlign: 'center',
    marginBottom: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    margin: '0 0 12px 0',
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: 'var(--color-text-light)',
    fontSize: 15,
    lineHeight: 1.8,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 20,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 32,
    background: 'white',
    borderRadius: 20,
    textDecoration: 'none',
    color: 'inherit',
    border: '1px solid var(--color-border)',
    boxShadow: '0 8px 32px rgba(61, 41, 20, 0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 20,
    color: 'var(--color-primary)',
    marginBottom: 8,
  },
  cardDesc: {
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 48,
    textAlign: 'center',
  },
  virtuesContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    padding: '24px 0',
    borderTop: '1px solid var(--color-border)',
  },
  virtue: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  virtueHanja: {
    fontSize: 24,
    fontWeight: 300,
    color: 'var(--color-primary)',
    letterSpacing: 4,
  },
  virtueText: {
    fontSize: 13,
    color: 'var(--color-text-light)',
    letterSpacing: 2,
  },
  virtueDivider: {
    fontSize: 20,
    color: 'var(--color-secondary)',
    fontWeight: 300,
  },
}

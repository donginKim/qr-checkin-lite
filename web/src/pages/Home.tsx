import { Link } from 'react-router-dom'
import { useChurch } from '../context/ChurchContext'
import Logo from '../components/Logo'

export default function Home() {
  const { churchName } = useChurch()

  return (
    <div style={styles.container}>
      {/* 히어로 섹션 */}
      <div style={styles.hero}>
        <Logo size="xlarge" style={{ marginBottom: 16 }} />
        <h1 style={styles.title}>{churchName} 출석 체크</h1>
        <p style={styles.subtitle}>
          주님 안에서 함께하는 우리<br />
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

      {/* 푸터 */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          "두세 사람이 내 이름으로 모인 곳에는<br />
          나도 그들 중에 있느니라"
        </p>
        <p style={styles.footerVerse}>- 마태복음 18:20</p>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '60px 20px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    textAlign: 'center',
    marginBottom: 48,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    margin: '0 0 16px 0',
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: 'var(--color-text-light)',
    fontSize: 16,
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
  footerText: {
    fontStyle: 'italic',
    color: 'var(--color-text-light)',
    lineHeight: 1.8,
    margin: '0 0 8px 0',
  },
  footerVerse: {
    color: 'var(--color-secondary)',
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
  },
}

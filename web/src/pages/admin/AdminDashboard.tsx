import { Link } from 'react-router-dom'
import { useChurch } from '../../context/ChurchContext'

export default function AdminDashboard() {
  const { churchName } = useChurch()

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.cross}>✝</div>
        <h1 style={styles.title}>{churchName}</h1>
        <p style={styles.subtitle}>출석 관리 시스템</p>
      </div>

      {/* 메뉴 카드 */}
      <div style={styles.cardGrid}>
        <Link to="/admin/sessions" style={styles.card}>
          <div style={styles.cardIcon}>📱</div>
          <div style={styles.cardContent}>
            <div style={styles.cardTitle}>세션 & QR 코드</div>
            <div style={styles.cardDesc}>출석 세션 생성 및 QR 표시</div>
          </div>
          <div style={styles.cardArrow}>→</div>
        </Link>

        <Link to="/admin/attendances" style={styles.card}>
          <div style={styles.cardIcon}>📋</div>
          <div style={styles.cardContent}>
            <div style={styles.cardTitle}>출석 내역</div>
            <div style={styles.cardDesc}>출석 기록 확인 및 관리</div>
          </div>
          <div style={styles.cardArrow}>→</div>
        </Link>

        <Link to="/admin/participants" style={styles.card}>
          <div style={styles.cardIcon}>👥</div>
          <div style={styles.cardContent}>
            <div style={styles.cardTitle}>신자 관리</div>
            <div style={styles.cardDesc}>신자 목록 및 Excel 업로드</div>
          </div>
          <div style={styles.cardArrow}>→</div>
        </Link>

        <Link to="/admin/settings" style={styles.card}>
          <div style={styles.cardIcon}>⚙️</div>
          <div style={styles.cardContent}>
            <div style={styles.cardTitle}>설정</div>
            <div style={styles.cardDesc}>성당 이름 및 시스템 설정</div>
          </div>
          <div style={styles.cardArrow}>→</div>
        </Link>
      </div>

      {/* 푸터 */}
      <div style={styles.footer}>
        <Link to="/" style={styles.footerLink}>
          ← 홈으로 돌아가기
        </Link>
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
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  cross: {
    fontSize: 48,
    color: 'var(--color-secondary)',
    marginBottom: 8,
    textShadow: '0 2px 4px rgba(201, 162, 39, 0.3)',
  },
  title: {
    fontSize: 28,
    margin: '0 0 8px 0',
    color: 'var(--color-primary)',
  },
  subtitle: {
    margin: 0,
    color: 'var(--color-text-light)',
    fontStyle: 'italic',
  },
  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: 24,
    background: 'white',
    borderRadius: 16,
    textDecoration: 'none',
    color: 'inherit',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
    transition: 'all 0.3s ease',
  },
  cardIcon: {
    fontSize: 40,
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-surface)',
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: 18,
    color: 'var(--color-primary)',
    marginBottom: 4,
  },
  cardDesc: {
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  cardArrow: {
    fontSize: 24,
    color: 'var(--color-secondary)',
    fontWeight: 300,
  },
  footer: {
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid var(--color-border)',
    textAlign: 'center',
  },
  footerLink: {
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
}

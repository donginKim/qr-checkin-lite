import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllSettings, updateSetting } from '../../api/settings'
import { useChurch } from '../../context/ChurchContext'

export default function SettingsPage() {
  const { refresh } = useChurch()
  const [churchName, setChurchName] = useState('')
  const [simpleCheckinMode, setSimpleCheckinMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function loadSettings() {
    setLoading(true)
    try {
      const settings = await getAllSettings()
      setChurchName(settings.church_name || '성당')
      setSimpleCheckinMode(settings.simple_checkin_mode === 'true')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!churchName.trim()) return

    setSaving(true)
    setSaved(false)

    try {
      await updateSetting('church_name', churchName.trim())
      await updateSetting('simple_checkin_mode', simpleCheckinMode ? 'true' : 'false')
      setSaved(true)
      refresh() // Context 새로고침
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('저장 실패')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.cross}>✝</div>
        <h1 style={styles.title}>설정</h1>
      </div>

      {loading ? (
        <div style={styles.loading}>로딩 중...</div>
      ) : (
        <form onSubmit={handleSave} style={styles.card}>
          <h3 style={styles.cardTitle}>기본 정보</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>성당 이름</label>
            <input
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              placeholder="예: OO성당, OO본당"
              style={styles.input}
            />
            <p style={styles.hint}>
              출석 체크 화면과 관리자 페이지에 표시됩니다.
            </p>
          </div>

          <h3 style={{ ...styles.cardTitle, marginTop: 32 }}>체크인 설정</h3>

          <div style={styles.toggleGroup}>
            <div style={styles.toggleInfo}>
              <label style={styles.label}>간편 체크인 모드</label>
              <p style={styles.hint}>
                활성화 시 이름 검색 후 선택만으로 출석 완료 (전화번호 입력 생략)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSimpleCheckinMode(!simpleCheckinMode)}
              style={{
                ...styles.toggle,
                background: simpleCheckinMode
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              }}
            >
              <span
                style={{
                  ...styles.toggleKnob,
                  transform: simpleCheckinMode ? 'translateX(24px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={saving || !churchName.trim()}>
              {saving ? '저장 중...' : '저장'}
            </button>
            {saved && <span style={styles.savedText}>✅ 저장되었습니다</span>}
          </div>
        </form>
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
    maxWidth: 600,
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
  loading: {
    textAlign: 'center',
    padding: 60,
    color: 'var(--color-text-light)',
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: 28,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
  },
  cardTitle: {
    margin: '0 0 24px 0',
    color: 'var(--color-primary)',
    fontSize: 18,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontWeight: 500,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
  },
  hint: {
    margin: '8px 0 0 0',
    fontSize: 13,
    color: 'var(--color-text-light)',
  },
  toggleGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    marginBottom: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    border: 'none',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleKnob: {
    display: 'block',
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  savedText: {
    color: 'var(--color-success)',
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


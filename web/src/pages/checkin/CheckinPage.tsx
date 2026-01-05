import { useEffect, useMemo, useState } from 'react'
import { getQueryParam } from '../../lib/url'
import { searchParticipants, submitCheckin } from '../../api/checkin'
import type { ParticipantSearchItem } from '../../api/checkin'
import { getSimpleCheckinMode } from '../../api/settings'

export default function CheckinPage() {
  const sid = useMemo(() => getQueryParam('sid') ?? '', [])
  const token = useMemo(() => getQueryParam('t') ?? '', [])

  const [simpleMode, setSimpleMode] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [searchResults, setSearchResults] = useState<ParticipantSearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantSearchItem | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  useEffect(() => {
    getSimpleCheckinMode().then(setSimpleMode)
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchName.trim()) return

    setSearching(true)
    setSearched(false)
    setSelectedParticipant(null)
    setResult(null)

    try {
      const results = await searchParticipants(searchName.trim())
      setSearchResults(results)
      setSearched(true)
    } finally {
      setSearching(false)
    }
  }

  async function handleSelect(participant: ParticipantSearchItem) {
    setSelectedParticipant(participant)
    setPhone('')
    setResult(null)

    // 간편 모드: 선택 즉시 출석 처리
    if (simpleMode && sid && token) {
      setLoading(true)
      try {
        const res = await submitCheckin({
          sessionId: sid,
          token,
          participantId: participant.id,
          phone: '', // 간편 모드에서는 빈 문자열
        })
        setResult(res)
      } finally {
        setLoading(false)
      }
    }
  }

  function handleReset() {
    setSelectedParticipant(null)
    setSearchResults([])
    setSearched(false)
    setPhone('')
    setResult(null)
  }

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedParticipant || !phone.trim()) return

    if (!sid || !token) {
      setResult({ ok: false, message: 'QR 코드를 통해 접속해주세요.' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await submitCheckin({
        sessionId: sid,
        token,
        participantId: selectedParticipant.id,
        phone: phone.trim(),
      })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.cross}>✝</div>
        <h1 style={styles.title}>출석 체크</h1>
        <p style={styles.subtitle}>주님의 평화가 함께 하시길</p>
      </div>

      <div style={styles.card}>
        {/* Step 1: 이름 검색 */}
        {!selectedParticipant && (
          <>
            <form onSubmit={handleSearch} style={styles.searchForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>이름을 입력하세요</label>
                <input
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="홍길동"
                  style={styles.input}
                  autoComplete="name"
                />
              </div>
              <button type="submit" disabled={!searchName.trim() || searching}>
                {searching ? '검색 중...' : '검색'}
              </button>
            </form>

            {searched && searchResults.length === 0 && (
              <div style={styles.emptyResult}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>🔍</span>
                <p>검색 결과가 없습니다.</p>
                <p style={{ fontSize: 14, color: 'var(--color-text-light)' }}>
                  이름을 다시 확인해주세요.
                </p>
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={styles.resultList}>
                <div style={styles.resultHeader}>본인을 선택하세요</div>
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    style={styles.resultItem}
                  >
                    <span style={styles.resultName}>{p.name}</span>
                    <span style={styles.resultPhone}>
                      📱 ***-****-{p.phoneLast4}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 2: 전화번호 입력 (일반 모드) 또는 결과 확인 (간편 모드) */}
        {selectedParticipant && (
          <>
            <div style={styles.selectedCard}>
              <div style={styles.selectedInfo}>
                <div style={styles.selectedName}>{selectedParticipant.name}</div>
                <div style={styles.selectedPhone}>
                  📱 ***-****-{selectedParticipant.phoneLast4}
                </div>
              </div>
              <button onClick={handleReset} className="secondary" style={{ padding: '8px 16px' }}>
                다시 검색
              </button>
            </div>

            {/* 일반 모드: 전화번호 입력 필요 */}
            {!simpleMode && (
              <form onSubmit={handleCheckin} style={styles.checkinForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>전화번호를 입력하세요 (본인 확인)</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-1234-5678"
                    autoComplete="tel"
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!phone.trim() || loading || !sid || !token}
                  style={styles.checkinButton}
                >
                  {loading ? '처리 중...' : '✝ 출석하기'}
                </button>
              </form>
            )}

            {/* 간편 모드: 처리 중 표시 */}
            {simpleMode && loading && (
              <div style={styles.processingMessage}>
                처리 중...
              </div>
            )}
          </>
        )}

        {/* 결과 표시 */}
        {result && (
          <div style={{
            ...styles.resultMessage,
            background: result.ok ? 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' : 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
            borderColor: result.ok ? '#81C784' : '#E57373'
          }}>
            <div style={styles.resultIcon}>
              {result.ok ? '🙏' : '⚠️'}
            </div>
            <div style={styles.resultTitle}>
              {result.ok ? '출석이 완료되었습니다' : '출석 실패'}
            </div>
            <div style={styles.resultText}>{result.message}</div>
          </div>
        )}
      </div>

      {(!sid || !token) && (
        <p style={styles.hint}>
          💡 QR 코드를 스캔하여 접속해주세요
        </p>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 480,
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
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
  card: {
    background: 'white',
    borderRadius: 20,
    padding: 28,
    boxShadow: '0 8px 32px rgba(61, 41, 20, 0.1)',
    border: '1px solid var(--color-border)',
  },
  searchForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
  },
  emptyResult: {
    textAlign: 'center',
    padding: '32px 16px',
    color: 'var(--color-text-light)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  resultList: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
  resultHeader: {
    padding: '12px 16px',
    background: 'var(--color-surface)',
    fontWeight: 600,
    fontSize: 14,
    color: 'var(--color-primary)',
    borderBottom: '1px solid var(--color-border)',
  },
  resultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '16px',
    border: 'none',
    borderTop: '1px solid var(--color-border)',
    background: 'white',
    cursor: 'pointer',
    fontSize: 16,
    textAlign: 'left',
    borderRadius: 0,
    boxShadow: 'none',
    color: 'var(--color-text)',
    transition: 'background 0.2s',
  },
  resultName: {
    fontWeight: 600,
  },
  resultPhone: {
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  selectedCard: {
    padding: 20,
    background: 'linear-gradient(135deg, var(--color-surface) 0%, #FFF9E6 100%)',
    borderRadius: 12,
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid var(--color-secondary-light)',
  },
  selectedInfo: {},
  selectedName: {
    fontWeight: 700,
    fontSize: 20,
    color: 'var(--color-primary)',
  },
  selectedPhone: {
    color: 'var(--color-text-light)',
    fontSize: 14,
    marginTop: 4,
  },
  checkinForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  checkinButton: {
    padding: '16px',
    fontSize: 18,
    fontWeight: 600,
  },
  resultMessage: {
    marginTop: 24,
    padding: 24,
    borderRadius: 12,
    textAlign: 'center',
    border: '1px solid',
  },
  resultIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 8,
    color: 'var(--color-text)',
  },
  resultText: {
    color: 'var(--color-text-light)',
  },
  hint: {
    textAlign: 'center',
    marginTop: 24,
    color: 'var(--color-text-light)',
    fontSize: 14,
  },
  processingMessage: {
    textAlign: 'center',
    padding: 24,
    color: 'var(--color-text-light)',
    fontSize: 16,
  },
}

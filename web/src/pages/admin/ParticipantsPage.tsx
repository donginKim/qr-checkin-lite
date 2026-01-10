import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getParticipants, uploadParticipantsExcel, addParticipant, deleteParticipant } from '../../api/participants'
import type { Participant, ImportResult } from '../../api/participants'
import Logo from '../../components/Logo'

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [replaceAll, setReplaceAll] = useState(false)
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 회원 추가 폼
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newBaptismalName, setNewBaptismalName] = useState('')
  const [newDistrict, setNewDistrict] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function loadParticipants() {
    setLoading(true)
    try {
      const data = await getParticipants()
      setParticipants(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadParticipants()
  }, [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (replaceAll && !confirm('⚠️ 기존 회원 명단을 모두 삭제하고 새로 등록합니다. 계속하시겠습니까?')) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setUploading(true)
    setUploadResult(null)
    setUploadError(null)

    try {
      const result = await uploadParticipantsExcel(file, replaceAll)
      setUploadResult(result)
      loadParticipants()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '업로드 실패')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) return

    setAdding(true)
    setAddError(null)

    try {
      await addParticipant({ 
        name: newName.trim(), 
        phone: newPhone.trim(),
        baptismalName: newBaptismalName.trim() || undefined,
        district: newDistrict.trim() || undefined,
      })
      setNewName('')
      setNewPhone('')
      setNewBaptismalName('')
      setNewDistrict('')
      setShowAddForm(false)
      loadParticipants()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : '등록 실패')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`"${name}" 회원을 삭제하시겠습니까?`)) return

    try {
      await deleteParticipant(id)
      loadParticipants()
    } catch {
      alert('삭제 실패')
    }
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <Logo size="medium" />
        <h1 style={styles.title}>회원 관리</h1>
      </div>

      {/* 회원 추가 */}
      <div style={styles.addSection}>
        {!showAddForm ? (
          <button onClick={() => setShowAddForm(true)} style={styles.addButton}>
            + 회원 추가
          </button>
        ) : (
          <form onSubmit={handleAddParticipant} style={styles.addForm}>
            <h3 style={styles.addFormTitle}>회원 추가</h3>
            <div style={styles.addFormGrid}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="이름 *"
                style={styles.addInput}
              />
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="전화번호 * (010-1234-5678)"
                style={styles.addInput}
              />
              <input
                value={newBaptismalName}
                onChange={(e) => setNewBaptismalName(e.target.value)}
                placeholder="세례명"
                style={styles.addInput}
              />
              <input
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                placeholder="구역"
                style={styles.addInput}
              />
            </div>
            {addError && <div style={styles.error}>{addError}</div>}
            <div style={styles.addFormActions}>
              <button type="submit" disabled={adding || !newName.trim() || !newPhone.trim()}>
                {adding ? '등록 중...' : '등록'}
              </button>
              <button type="button" className="secondary" onClick={() => { setShowAddForm(false); setAddError(null); }}>
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Excel 업로드 */}
      <div style={styles.uploadCard}>
        <div style={styles.uploadHeader}>
          <h3 style={styles.uploadTitle}>📤 Excel 파일 업로드</h3>
          <a
            href="/api/admin/participants/template"
            download="participants_template.xlsx"
            style={styles.templateLink}
          >
            📥 템플릿 다운로드
          </a>
        </div>
        
        <div style={styles.uploadForm}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            style={styles.fileInput}
          />
          
          <label style={{
            ...styles.checkbox,
            background: replaceAll ? 'var(--color-error)' : 'white',
            color: replaceAll ? 'white' : 'var(--color-text)',
            borderColor: replaceAll ? 'var(--color-error)' : 'var(--color-border)',
          }}>
            <input
              type="checkbox"
              checked={replaceAll}
              onChange={(e) => setReplaceAll(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            기존 명단 교체
          </label>
        </div>

        {uploading && (
          <div style={styles.uploadStatus}>⏳ 업로드 중...</div>
        )}

        {uploadResult && (
          <div style={styles.uploadSuccess}>
            ✅ 완료: 총 {uploadResult.totalRows}행 중 
            <strong> {uploadResult.inserted}명 등록</strong>, {uploadResult.skipped}명 스킵
          </div>
        )}

        {uploadError && (
          <div style={styles.uploadError}>❌ {uploadError}</div>
        )}

        <div style={styles.uploadHint}>
          💡 Excel 형식: A열-이름, B열-전화번호, C열-세례명, D열-구역 (첫 행은 헤더로 스킵)
        </div>
      </div>

      {/* 통계 */}
      <div style={styles.statsCard}>
        <div style={styles.statsLeft}>
          <span style={styles.statsLabel}>총 회원</span>
          <span style={styles.statsValue}>{participants.length}명</span>
        </div>
        <button onClick={loadParticipants} className="secondary" disabled={loading}>
          🔄 새로고침
        </button>
      </div>

      {/* 테이블 */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.emptyState}>로딩 중...</div>
        ) : participants.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: 48, marginBottom: 16 }}>👥</span>
            <p>등록된 회원이 없습니다.</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-light)' }}>
              위에서 회원을 추가하거나 Excel 파일을 업로드해주세요.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>이름</th>
                  <th>세례명</th>
                  <th>전화번호</th>
                  <th>구역</th>
                  <th style={{ width: 70 }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, idx) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--color-text-light)' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--color-text-light)' }}>{p.baptismalName || '-'}</td>
                    <td>
                      <span style={{ color: 'var(--color-text-light)' }}>***-****-</span>
                      <span style={{ fontWeight: 500 }}>{p.phoneLast4}</span>
                    </td>
                    <td style={{ color: 'var(--color-text-light)' }}>{p.district || '-'}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        style={styles.deleteButton}
                        title="삭제"
                      >
                        🗑️
                      </button>
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
    margin: 0,
    color: 'var(--color-primary)',
  },
  addSection: {
    marginBottom: 24,
  },
  addButton: {
    width: '100%',
    padding: 16,
    fontSize: 16,
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
  },
  addForm: {
    background: 'white',
    borderRadius: 16,
    padding: 24,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
  },
  addFormTitle: {
    margin: '0 0 16px 0',
    color: 'var(--color-primary)',
    fontSize: 18,
  },
  addFormGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
    marginBottom: 16,
  },
  addInput: {
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
  addFormActions: {
    display: 'flex',
    gap: 12,
  },
  uploadCard: {
    padding: 24,
    background: 'white',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
    marginBottom: 24,
  },
  uploadHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadTitle: {
    margin: 0,
    fontSize: 16,
    color: 'var(--color-primary)',
  },
  templateLink: {
    fontSize: 14,
    color: 'var(--color-accent)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  uploadForm: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  fileInput: {
    flex: 1,
    minWidth: 200,
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  uploadStatus: {
    marginTop: 16,
    color: 'var(--color-accent)',
    fontWeight: 500,
  },
  uploadSuccess: {
    marginTop: 16,
    padding: 16,
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    borderRadius: 8,
    color: 'var(--color-success)',
  },
  uploadError: {
    marginTop: 16,
    padding: 16,
    background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
    borderRadius: 8,
    color: 'var(--color-error)',
  },
  uploadHint: {
    marginTop: 16,
    fontSize: 13,
    color: 'var(--color-text-light)',
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
  deleteButton: {
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    boxShadow: 'none',
    transition: 'all 0.2s',
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

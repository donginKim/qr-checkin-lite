import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getParticipants, uploadParticipantsExcel, addParticipant, deleteParticipant, getDistrictStats } from '../../api/participants'
import type { Participant, ImportResult } from '../../api/participants'
import Logo from '../../components/Logo'

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [districtStats, setDistrictStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [replaceAll, setReplaceAll] = useState(false)
  const [uploadResult, setUploadResult] = useState<ImportResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 검색
  const [searchQuery, setSearchQuery] = useState('')
  
  // 보기 모드
  const [viewMode, setViewMode] = useState<'list' | 'district'>('list')
  
  // 구역 필터 (리스트 모드용)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  
  // 아코디언 상태 (구역별 모드용)
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set())
  
  // 전화번호 마스킹 해제된 ID 목록
  const [revealedPhones, setRevealedPhones] = useState<Set<number>>(new Set())

  // 회원 추가 폼
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newBaptismalName, setNewBaptismalName] = useState('')
  const [newDistrict, setNewDistrict] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // 검색 및 구역 필터링
  const filteredParticipants = participants.filter(p => {
    // 구역 필터
    if (selectedDistrict) {
      const pDistrict = p.district || '미지정'
      if (pDistrict !== selectedDistrict) return false
    }
    
    // 검색 필터
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(query) ||
      p.baptismalName?.toLowerCase().includes(query) ||
      p.district?.toLowerCase().includes(query)
    )
  })
  
  // 구역 클릭 핸들러 (리스트 모드)
  const handleDistrictClick = (district: string) => {
    if (selectedDistrict === district) {
      setSelectedDistrict(null) // 같은 구역 다시 클릭하면 해제
    } else {
      setSelectedDistrict(district)
      setSearchQuery('') // 구역 선택 시 검색어 초기화
    }
  }

  // 아코디언 토글 (구역별 모드)
  const toggleDistrictAccordion = (district: string) => {
    setExpandedDistricts(prev => {
      const next = new Set(prev)
      if (next.has(district)) {
        next.delete(district)
      } else {
        next.add(district)
      }
      return next
    })
  }

  // 전체 펼치기/접기
  const expandAllDistricts = () => {
    const allDistricts = Object.keys(districtStats)
    setExpandedDistricts(new Set(allDistricts))
  }

  const collapseAllDistricts = () => {
    setExpandedDistricts(new Set())
  }

  // 구역별 회원 그룹핑
  const getParticipantsByDistrict = () => {
    const grouped: Record<string, Participant[]> = {}
    
    participants.forEach(p => {
      const district = p.district || '미지정'
      if (!grouped[district]) {
        grouped[district] = []
      }
      grouped[district].push(p)
    })

    // 구역명 순으로 정렬, 미지정은 마지막
    return Object.entries(grouped).sort((a, b) => {
      if (a[0] === '미지정') return 1
      if (b[0] === '미지정') return -1
      return a[0].localeCompare(b[0], 'ko')
    })
  }

  // 전화번호 클릭 핸들러
  const togglePhoneReveal = (id: number) => {
    setRevealedPhones(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // 전화번호 포맷팅
  const formatPhone = (phone: string) => {
    if (!phone) return ''
    const digits = phone.replace(/\D/g, '')
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    }
    return phone
  }

  async function loadParticipants() {
    setLoading(true)
    try {
      const [data, stats] = await Promise.all([
        getParticipants(),
        getDistrictStats()
      ])
      setParticipants(data)
      setDistrictStats(stats)
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
        <Link to="/admin" style={styles.backLink}>← 대시보드</Link>
        <div style={styles.headerCenter}>
          <Logo size="medium" />
          <h1 style={styles.title}>회원 관리</h1>
        </div>
        <div style={styles.headerRight} />
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
            ✅ 완료: 총 {uploadResult.totalRows}행 중{' '}
            <strong>{uploadResult.inserted}명 등록</strong>
            {uploadResult.updated > 0 && <>, <strong>{uploadResult.updated}명 수정</strong></>}
            , {uploadResult.skipped}명 스킵
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

      {/* 보기 모드 탭 */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setViewMode('list')}
          style={{
            ...styles.tab,
            ...(viewMode === 'list' ? styles.tabActive : {})
          }}
        >
          📋 전체 목록
        </button>
        <button
          onClick={() => setViewMode('district')}
          style={{
            ...styles.tab,
            ...(viewMode === 'district' ? styles.tabActive : {})
          }}
        >
          📊 구역별 보기
        </button>
      </div>

      {/* 리스트 모드 - 구역별 통계 */}
      {viewMode === 'list' && Object.keys(districtStats).length > 0 && (
        <div style={styles.districtStatsCard}>
          <div style={styles.districtStatsHeader}>
            <h3 style={styles.districtStatsTitle}>📊 구역별 현황</h3>
            {selectedDistrict && (
              <button
                onClick={() => setSelectedDistrict(null)}
                style={styles.clearFilterButton}
              >
                ✕ 필터 해제
              </button>
            )}
          </div>
          <div style={styles.districtGrid}>
            {Object.entries(districtStats).map(([district, count]) => (
              <div
                key={district}
                onClick={() => handleDistrictClick(district)}
                style={{
                  ...styles.districtItem,
                  ...(selectedDistrict === district ? styles.districtItemSelected : {}),
                  cursor: 'pointer',
                }}
                title={`${district} 회원 보기`}
              >
                <span style={{
                  ...styles.districtName,
                  ...(selectedDistrict === district ? { color: 'white' } : {}),
                }}>{district}</span>
                <span style={{
                  ...styles.districtCount,
                  ...(selectedDistrict === district ? { color: 'white' } : {}),
                }}>{count}명</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리스트 모드 - 검색 */}
      {viewMode === 'list' && (
        <div style={styles.searchCard}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value) setSelectedDistrict(null) // 검색 시 구역 필터 해제
            }}
            placeholder="🔍 이름, 세례명, 구역으로 검색..."
            style={styles.searchInput}
          />
          {(searchQuery || selectedDistrict) && (
            <span style={styles.searchResult}>
              {selectedDistrict && <strong>[{selectedDistrict}] </strong>}
              {filteredParticipants.length}명
            </span>
          )}
        </div>
      )}

      {/* 리스트 모드 - 테이블 */}
      {viewMode === 'list' && (
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
          ) : filteredParticipants.length === 0 ? (
            <div style={styles.emptyState}>
              <p>검색 결과가 없습니다.</p>
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
                  {filteredParticipants.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ color: 'var(--color-text-light)' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ color: 'var(--color-text-light)' }}>{p.baptismalName || '-'}</td>
                      <td>
                        <span
                          onClick={() => togglePhoneReveal(p.id)}
                          style={styles.phoneNumber}
                          title="클릭하여 전화번호 보기/숨기기"
                        >
                          {revealedPhones.has(p.id) && p.phone ? (
                            <span style={{ fontWeight: 500 }}>{formatPhone(p.phone)}</span>
                          ) : (
                            <>
                              <span style={{ color: 'var(--color-text-light)' }}>***-****-</span>
                              <span style={{ fontWeight: 500 }}>{p.phoneLast4}</span>
                            </>
                          )}
                          <span style={styles.phoneToggle}>
                            {revealedPhones.has(p.id) ? '🔒' : '👁️'}
                          </span>
                        </span>
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
      )}

      {/* 구역별 모드 - 아코디언 */}
      {viewMode === 'district' && (
        <div style={styles.districtAccordionView}>
          {loading ? (
            <div style={styles.emptyState}>로딩 중...</div>
          ) : participants.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: 48, marginBottom: 16 }}>👥</span>
              <p>등록된 회원이 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 전체 펼치기/접기 버튼 */}
              <div style={styles.accordionControls}>
                <button onClick={expandAllDistricts} className="secondary" style={styles.accordionBtn}>
                  📂 전체 펼치기
                </button>
                <button onClick={collapseAllDistricts} className="secondary" style={styles.accordionBtn}>
                  📁 전체 접기
                </button>
              </div>

              {getParticipantsByDistrict().map(([district, members]) => {
                const isExpanded = expandedDistricts.has(district)
                return (
                  <div key={district} style={styles.accordionCard}>
                    <div
                      style={styles.accordionHeader}
                      onClick={() => toggleDistrictAccordion(district)}
                    >
                      <div style={styles.accordionHeaderLeft}>
                        <span style={styles.accordionArrow}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <h3 style={styles.accordionTitle}>
                          📍 {district}
                        </h3>
                      </div>
                      <span style={styles.accordionCount}>{members.length}명</span>
                    </div>
                    {isExpanded && (
                      <div style={styles.accordionContent}>
                        {members
                          .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                          .map(p => (
                            <div key={p.id} style={styles.memberCard}>
                              <div style={styles.memberInfo}>
                                <span style={styles.memberNameText}>{p.name}</span>
                                {p.baptismalName && (
                                  <span style={styles.memberBaptismal}>({p.baptismalName})</span>
                                )}
                              </div>
                              <div style={styles.memberActions}>
                                <span
                                  onClick={() => togglePhoneReveal(p.id)}
                                  style={styles.memberPhone}
                                >
                                  {revealedPhones.has(p.id) && p.phone 
                                    ? formatPhone(p.phone) 
                                    : `***-****-${p.phoneLast4}`
                                  }
                                  <span style={{ marginLeft: 4, fontSize: 12 }}>
                                    {revealedPhones.has(p.id) ? '🔒' : '👁️'}
                                  </span>
                                </span>
                                <button
                                  onClick={() => handleDelete(p.id, p.name)}
                                  style={styles.memberDeleteBtn}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    position: 'sticky' as const,
    top: 0,
    background: 'var(--color-background)',
    padding: '16px 0',
    zIndex: 100,
    borderBottom: '1px solid var(--color-border)',
    margin: '-40px -20px 32px -20px',
    paddingLeft: 20,
    paddingRight: 20,
  },
  backLink: {
    color: 'var(--color-text-light)',
    textDecoration: 'none',
    fontSize: 14,
    padding: '8px 12px',
    borderRadius: 8,
    background: 'white',
    border: '1px solid var(--color-border)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  headerCenter: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
  },
  headerRight: {
    width: 90, // backLink와 균형 맞추기
  },
  title: {
    fontSize: 20,
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
  districtStatsCard: {
    marginBottom: 20,
    padding: 20,
    background: 'white',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 20px rgba(61, 41, 20, 0.08)',
  },
  districtStatsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  districtStatsTitle: {
    margin: 0,
    fontSize: 16,
    color: 'var(--color-primary)',
  },
  clearFilterButton: {
    padding: '6px 12px',
    fontSize: 13,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    color: 'var(--color-text-light)',
    cursor: 'pointer',
  },
  districtGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 12,
  },
  districtItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    background: 'var(--color-surface)',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    transition: 'all 0.2s',
  },
  districtItemSelected: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: 'white',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(61, 41, 20, 0.2)',
  },
  districtName: {
    fontSize: 14,
    color: 'var(--color-text-light)',
    marginBottom: 4,
  },
  districtCount: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-primary)',
  },
  searchCard: {
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    padding: '14px 16px',
    fontSize: 16,
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'white',
  },
  searchResult: {
    fontSize: 14,
    color: 'var(--color-text-light)',
    whiteSpace: 'nowrap' as const,
  },
  phoneNumber: {
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    borderRadius: 6,
    transition: 'background 0.2s',
  },
  phoneToggle: {
    fontSize: 12,
    opacity: 0.6,
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
  // 탭 스타일
  tabContainer: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 600,
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    background: 'white',
    color: 'var(--color-text-light)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    color: 'white',
  },
  // 구역별 아코디언 스타일
  districtAccordionView: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  accordionControls: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
  },
  accordionBtn: {
    padding: '8px 14px',
    fontSize: 13,
  },
  accordionCard: {
    background: 'white',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px rgba(61, 41, 20, 0.06)',
    overflow: 'hidden',
  },
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, var(--color-surface) 0%, #FFF9E6 100%)',
    cursor: 'pointer',
    transition: 'background 0.2s',
    userSelect: 'none' as const,
  },
  accordionHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  accordionArrow: {
    fontSize: 12,
    color: 'var(--color-text-light)',
    width: 16,
  },
  accordionTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  accordionCount: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-primary)',
    background: 'white',
    padding: '4px 12px',
    borderRadius: 20,
    border: '1px solid var(--color-border)',
  },
  accordionContent: {
    padding: 12,
    borderTop: '1px solid var(--color-border)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 8,
  },
  memberCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'var(--color-surface)',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  memberNameText: {
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  memberBaptismal: {
    fontSize: 12,
    color: 'var(--color-text-light)',
  },
  memberActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  memberPhone: {
    fontSize: 13,
    color: 'var(--color-text-light)',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
    background: 'white',
    border: '1px solid var(--color-border)',
  },
  memberDeleteBtn: {
    padding: '4px 8px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
  },
}

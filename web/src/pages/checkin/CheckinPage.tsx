import { useMemo, useState } from 'react'
import { getQueryParam } from '../../lib/url'
import { submitCheckin } from '../../api/checkin'

export default function CheckinPage() {
  const sid = useMemo(() => getQueryParam('sid') ?? '', [])
  const token = useMemo(() => getQueryParam('t') ?? '', [])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const canSubmit = !!sid && !!token && name.trim().length > 0 && phone.trim().length > 0 && !loading

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)

    if (!sid || !token) {
      setResult({ ok: false, message: 'QR 링크로 접근해야 합니다. (sid/t 누락)' })
      return
    }

    setLoading(true)
    try {
      const res = await submitCheckin({
        sessionId: sid,
        token,
        name: name.trim(),
        phone: phone.trim(),
      })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>출석 체크</h2>

      <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
        sid: <code>{sid || '(missing)'}</code> / token: <code>{token ? 'OK' : '(missing)'}</code>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>이름</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            autoComplete="name"
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>전화번호</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            autoComplete="tel"
          />
        </label>

        <button type="submit" disabled={!canSubmit}>
          {loading ? '처리 중...' : '출석하기'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 14, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
          <b>{result.ok ? '✅ 성공' : '❌ 실패'}</b>
          <div style={{ marginTop: 6 }}>{result.message}</div>
        </div>
      )}

      {!sid || !token ? (
        <p style={{ marginTop: 14, fontSize: 12, color: '#666' }}>
          QR 링크 예시: <code>/checkin?sid=20251231-AM&amp;t=TOKEN</code>
        </p>
      ) : null}
    </div>
  )
}
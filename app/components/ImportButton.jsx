'use client'
import { useState } from 'react'

export default function ImportButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { text, type: 'success' | 'info' | 'error' }

  async function handleImport() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/import', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const { imported = 0, skipped = 0 } = data
        if (imported === 0) {
          setMessage({ text: 'Already synced. No new customers to import.', type: 'info' })
        } else {
          setMessage({ text: `${imported} customer${imported === 1 ? '' : 's'} imported!`, type: 'success' })
          window.location.reload()
        }
      } else {
        setMessage({ text: data.error || 'Import failed', type: 'error' })
      }
    } catch (e) {
      setMessage({ text: 'Request error: ' + e.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="import-btn-wrap">
      <button
        type="button"
        onClick={handleImport}
        disabled={loading}
        className="import-btn"
        aria-busy={loading}
      >
        {loading ? (
          <>
            <span className="import-btn-spinner" aria-hidden />
            Importing…
          </>
        ) : (
          <>
            <span className="import-btn-icon" aria-hidden>↓</span>
            Import Customers
          </>
        )}
      </button>
      {message && (
        <p
          className={`import-message import-message--${message.type}`}
          role="status"
          key={message.text + message.type}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}

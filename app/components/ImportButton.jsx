'use client'
import { useState } from 'react'

export default function ImportButton() {
  const [loading, setLoading] = useState(false)

  async function handleImport() {
    setLoading(true)
    try {
      const res = await fetch('/api/import', { method: 'POST' })
      if (res.ok) {
        // refresh the page to show new data
        window.location.reload()
      } else {
        const err = await res.text()
        alert('Import failed: ' + err)
      }
    } catch (e) {
      alert('Request error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleImport} disabled={loading} style={{ padding: '8px 12px', marginBottom: 16 }}>
      {loading ? 'Importing…' : 'Import Customers'}
    </button>
  )
}

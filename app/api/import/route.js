import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/mongodb'

export async function POST() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users')
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch public API' }, { status: 502 })

    const users = await res.json()
    const db = await getDB()
    const col = db.collection('customers')

    let inserted = 0
    for (const u of users) {
      const doc = {
        name: u.name || u.username || '',
        email: u.email || '',
        phone: u.phone || '',
        sourceId: u.id || null,
        raw: u
      }

      const result = await col.updateOne({ email: doc.email }, { $setOnInsert: doc }, { upsert: true })
      if (result.upsertedId) inserted++
    }

    return NextResponse.json({ imported: inserted, total: users.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Send POST to import users from the public API into MongoDB.' })
}

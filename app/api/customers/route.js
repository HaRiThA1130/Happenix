import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/mongodb'

export async function GET() {
  try {
    const db = await getDB()
    const col = db.collection('customers')
    const docs = await col.find({}, { projection: { raw: 0 } }).sort({ name: 1 }).toArray()
    return NextResponse.json(docs)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

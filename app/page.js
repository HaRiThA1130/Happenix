import ImportButton from './components/ImportButton'
import { getDB } from '../lib/mongodb'

export default async function Page() {
  const db = await getDB()
  const col = db.collection('customers')
  const customers = await col.find({}, { projection: { raw: 0 } }).sort({ name: 1 }).toArray()

  return (
    <div>
      <h1>Customers</h1>
      <ImportButton />

      {customers.length === 0 ? (
        <p>No customers yet. Click "Import Customers" to fetch and store them.</p>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

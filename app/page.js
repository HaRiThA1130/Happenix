import ImportButton from './components/ImportButton'
import { getDB } from '../lib/mongodb'

export default async function Page() {
  const db = await getDB()
  const col = db.collection('customers')
  const customers = await col.find({}, { projection: { raw: 0 } }).sort({ name: 1 }).toArray()

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-description">
          View and manage your customer list. Import sample data from the API to get started.
        </p>
        <ImportButton />
      </header>

      {customers.length === 0 ? (
        <div className="empty-state page-content-in">
          <div className="empty-state-icon" aria-hidden>📋</div>
          <h2 className="empty-state-title">No customers yet</h2>
          <p className="empty-state-text">
            Click &quot;Import Customers&quot; above to fetch sample users from the API and store them in your database.
          </p>
        </div>
      ) : (
        <div className="card page-content-in">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c._id.toString()} className="table-row-in" style={{ animationDelay: `${i * 35}ms` }}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

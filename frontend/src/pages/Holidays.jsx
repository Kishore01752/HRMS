import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const TYPES = [
  { value: 'national', label: 'National' },
  { value: 'festival', label: 'Festival' },
  { value: 'regional', label: 'Regional' },
  { value: 'company', label: 'Company' }
]

const Holidays = () => {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: '', date: '', type: 'company', region: '', description: ''
  })

  const load = async () => {
    try {
      const res = await API.get('/holidays')
      setList(res.data)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await API.post('/holidays', form)
      setShowModal(false)
      setForm({ name: '', date: '', type: 'company', region: '', description: '' })
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add holiday')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return
    try {
      await API.delete(`/holidays/${id}`)
      load()
    } catch {
      alert('Could not delete')
    }
  }

  if (loading) return <p style={{ color: '#718096' }}>Loading holidays...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Holiday calendar</h1>
        <p>Company holidays, national days, festivals, and regional observances</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Upcoming & registered holidays ({list.length})</h2>
          {user?.role === 'admin' && (
            <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add holiday</button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Type</th>
              <th>Region</th>
              <th>Notes</th>
              {user?.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={user?.role === 'admin' ? 6 : 5} style={{ textAlign: 'center', color: '#718096' }}>No holidays yet</td></tr>
            ) : list.map((h) => (
              <tr key={h._id}>
                <td>{h.date}</td>
                <td style={{ fontWeight: 500 }}>{h.name}</td>
                <td style={{ textTransform: 'capitalize' }}>{h.type}</td>
                <td>{h.region || '—'}</td>
                <td style={{ fontSize: '13px', color: '#718096' }}>{h.description || '—'}</td>
                {user?.role === 'admin' && (
                  <td>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(h._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && user?.role === 'admin' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add holiday</h2>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Date (YYYY-MM-DD)</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Region (optional)</label>
                <input placeholder="e.g. Tamil Nadu" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: '#edf2f7' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Holidays

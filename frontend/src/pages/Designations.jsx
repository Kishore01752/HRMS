import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const Designations = () => {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '', hierarchyLevel: 5, department: '', reportsTo: ''
  })

  const load = async () => {
    try {
      const res = await API.get('/designations')
      setList(res.data)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/designations', {
        title: form.title,
        hierarchyLevel: Number(form.hierarchyLevel),
        department: form.department,
        reportsTo: form.reportsTo || null
      })
      setShowModal(false)
      setForm({ title: '', hierarchyLevel: 5, department: '', reportsTo: '' })
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this designation?')) return
    try {
      await API.delete(`/designations/${id}`)
      load()
    } catch {
      alert('Could not delete')
    }
  }

  if (loading) return <p style={{ color: '#718096' }}>Loading designations...</p>

  const sorted = [...list].sort((a, b) => a.hierarchyLevel - b.hierarchyLevel)

  return (
    <div>
      <div className="page-header">
        <h1>Designation hierarchy</h1>
        <p>Role levels and reporting lines (lower number = senior)</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Designations ({sorted.length})</h2>
          {user?.role === 'admin' && (
            <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add designation</button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Title</th>
              <th>Department</th>
              <th>Reports to</th>
              {user?.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={user?.role === 'admin' ? 5 : 4} style={{ textAlign: 'center', color: '#718096' }}>No designations yet</td></tr>
            ) : sorted.map((d) => (
              <tr key={d._id}>
                <td>{d.hierarchyLevel}</td>
                <td style={{ fontWeight: 600 }}>{d.title}</td>
                <td>{d.department || '—'}</td>
                <td>{d.reportsTo?.title || '—'}</td>
                {user?.role === 'admin' && (
                  <td>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(d._id)}>Delete</button>
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
            <h2>Add designation</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Hierarchy level (1 = most senior)</label>
                <input type="number" min="1" max="99" value={form.hierarchyLevel} onChange={(e) => setForm({ ...form, hierarchyLevel: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department (optional)</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Reports to designation (optional)</label>
                <select value={form.reportsTo} onChange={(e) => setForm({ ...form, reportsTo: e.target.value })}>
                  <option value="">— None —</option>
                  {list.map((x) => (
                    <option key={x._id} value={x._id}>{x.title} (L{x.hierarchyLevel})</option>
                  ))}
                </select>
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

export default Designations

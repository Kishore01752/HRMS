import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const Departments = () => {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', costCenter: '', manager: '' })

  const load = async () => {
    try {
      const [d, e] = await Promise.all([
        API.get('/departments'),
        API.get('/employees')
      ])
      setList(d.data)
      setEmployees(e.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', description: '', costCenter: '', manager: '' })
    setShowModal(true)
  }

  const openEdit = (dep) => {
    setEditId(dep._id)
    setForm({
      name: dep.name || '',
      description: dep.description || '',
      costCenter: dep.costCenter || '',
      manager: dep.manager?._id || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      description: form.description,
      costCenter: form.costCenter,
      manager: form.manager || undefined
    }
    try {
      if (editId) await API.put(`/departments/${editId}`, payload)
      else await API.post('/departments', payload)
      setShowModal(false)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving department')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return
    try {
      await API.delete(`/departments/${id}`)
      load()
    } catch {
      alert('Could not delete')
    }
  }

  if (loading) return <p style={{ color: '#718096' }}>Loading departments...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Department management</h1>
        <p>Organizational units and cost center allocation</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Departments ({list.length})</h2>
          {user?.role === 'admin' && (
            <button type="button" className="btn btn-primary" onClick={openAdd}>+ Add department</button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Cost center</th>
              <th>Manager</th>
              {user?.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={user?.role === 'admin' ? 5 : 4} style={{ textAlign: 'center', color: '#718096' }}>No departments yet</td></tr>
            ) : list.map((d) => (
              <tr key={d._id}>
                <td style={{ fontWeight: 600 }}>{d.name}</td>
                <td style={{ fontSize: '14px', color: '#4a5568' }}>{d.description || '—'}</td>
                <td>{d.costCenter || '—'}</td>
                <td>{d.manager?.name || '—'}</td>
                {user?.role === 'admin' && (
                  <td>
                    <button type="button" className="btn btn-sm btn-primary" style={{ marginRight: '6px' }} onClick={() => openEdit(d)}>Edit</button>
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
            <h2>{editId ? 'Edit department' : 'Add department'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Cost center code</label>
                <input placeholder="e.g. CC-IND-01" value={form.costCenter} onChange={(e) => setForm({ ...form, costCenter: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Department manager (optional)</label>
                <select value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}>
                  <option value="">— None —</option>
                  {employees.map((em) => (
                    <option key={em._id} value={em._id}>{em.name}</option>
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

export default Departments

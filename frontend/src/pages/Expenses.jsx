import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const Expenses = () => {
  const { user } = useAuth()
  const [all, setAll] = useState([])
  const [mine, setMine] = useState([])
  const [employees, setEmployees] = useState([])
  const [myEmpId, setMyEmpId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    employeeId: '', amount: '', category: 'travel', description: ''
  })

  const loadAdmin = async () => {
    const res = await API.get('/expenses/all')
    setAll(res.data)
  }

  const loadMine = async (empId) => {
    if (!empId) return
    const res = await API.get(`/expenses/employee/${empId}`)
    setMine(res.data)
  }

  useEffect(() => {
    const run = async () => {
      try {
        const er = await API.get('/employees')
        setEmployees(er.data)
        const self = er.data.find((e) => e.email === user?.email)
        if (self) {
          setMyEmpId(self._id)
          setForm((f) => ({ ...f, employeeId: self._id }))
          await loadMine(self._id)
        }
        if (user?.role === 'admin') await loadAdmin()
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/expenses', {
        employeeId: form.employeeId,
        amount: Number(form.amount),
        category: form.category,
        description: form.description
      })
      setShowModal(false)
      setForm((f) => ({ ...f, amount: '', description: '' }))
      if (user?.role === 'admin') loadAdmin()
      loadMine(form.employeeId || myEmpId)
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit')
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/expenses/${id}/status`, {
        status,
        rejectionReason: status === 'rejected' ? (prompt('Reason for rejection?') || '') : ''
      })
      loadAdmin()
    } catch {
      alert('Could not update')
    }
  }

  if (loading) return <p style={{ color: '#718096' }}>Loading expenses...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Expense management</h1>
        <p>Submit claims, approvals, and reimbursement tracking</p>
      </div>

      <div className="table-container" style={{ marginBottom: '24px' }}>
        <div className="table-header">
          <h2>My expense claims</h2>
          <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!myEmpId}>
            + Submit claim
          </button>
        </div>
        {!myEmpId && (
          <p style={{ padding: '16px', color: '#c05621' }}>Your login is not linked to an employee profile. Ask admin to link your user to an employee record.</p>
        )}
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#718096' }}>No claims yet</td></tr>
            ) : mine.map((x) => (
              <tr key={x._id}>
                <td>{new Date(x.createdAt).toLocaleDateString()}</td>
                <td>₹{x.amount?.toLocaleString()}</td>
                <td>{x.category}</td>
                <td>{x.description || '—'}</td>
                <td>
                  <span className={`badge ${x.status === 'approved' ? 'badge-green' : x.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                    {x.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user?.role === 'admin' && (
        <div className="table-container">
          <div className="table-header">
            <h2>All claims (approval queue)</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096' }}>No expense records</td></tr>
              ) : all.map((x) => (
                <tr key={x._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{x.employeeId?.name}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{x.employeeId?.department}</div>
                  </td>
                  <td>{new Date(x.createdAt).toLocaleDateString()}</td>
                  <td>₹{x.amount?.toLocaleString()}</td>
                  <td>{x.category}</td>
                  <td>{x.description || '—'}</td>
                  <td>
                    <span className={`badge ${x.status === 'approved' ? 'badge-green' : x.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>
                      {x.status}
                    </span>
                  </td>
                  <td>
                    {x.status === 'pending' && (
                      <>
                        <button type="button" className="btn btn-sm btn-success" style={{ marginRight: '6px' }} onClick={() => handleStatus(x._id, 'approved')}>Approve</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleStatus(x._id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New expense claim</h2>
            <form onSubmit={handleSubmit}>
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Employee</label>
                  <select
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    {employees.map((e) => (
                      <option key={e._id} value={e._id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" min="1" step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="travel">Travel</option>
                  <option value="meals">Meals</option>
                  <option value="supplies">Supplies</option>
                  <option value="medical">Medical</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: '#edf2f7' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses

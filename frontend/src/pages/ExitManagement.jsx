import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const ExitManagement = () => {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [employees, setEmployees] = useState([])
  const [myEmpId, setMyEmpId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    employeeId: '', lastWorkingDay: '', reason: '', noticePeriodDays: 30
  })

  const loadAdmin = async () => {
    const res = await API.get('/exit/all')
    setList(res.data)
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
      await API.post('/exit', {
        employeeId: form.employeeId,
        lastWorkingDay: form.lastWorkingDay,
        reason: form.reason,
        noticePeriodDays: Number(form.noticePeriodDays) || 0
      })
      setShowModal(false)
      setForm((f) => ({ ...f, reason: '', lastWorkingDay: '' }))
      if (user?.role === 'admin') loadAdmin()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const notes = status === 'completed' ? prompt('Exit interview notes (optional):') : ''
      await API.put(`/exit/${id}`, { status, exitInterviewNotes: notes || undefined })
      loadAdmin()
    } catch {
      alert('Could not update')
    }
  }

  if (loading) return <p style={{ color: '#718096' }}>Loading...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Exit management</h1>
        <p>Resignations, notice period, and exit workflow</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', marginBottom: '12px' }}>Submit resignation / exit request</h2>
        <p style={{ fontSize: '14px', color: '#718096', marginBottom: '12px' }}>
          Link your user to an employee profile to submit. Admins can submit on behalf of anyone.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!myEmpId && user?.role !== 'admin'}
          onClick={() => setShowModal(true)}
        >
          + New exit request
        </button>
      </div>

      {user?.role === 'admin' && (
        <div className="table-container">
          <div className="table-header">
            <h2>All exit requests</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Last working day</th>
                <th>Notice (days)</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096' }}>No exit requests</td></tr>
              ) : list.map((x) => (
                <tr key={x._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{x.employeeId?.name}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{x.employeeId?.department}</div>
                  </td>
                  <td>{x.lastWorkingDay}</td>
                  <td>{x.noticePeriodDays}</td>
                  <td style={{ fontSize: '13px', maxWidth: '220px' }}>{x.reason || '—'}</td>
                  <td>
                    <span className={`badge ${x.status === 'completed' ? 'badge-green' : x.status === 'approved' ? 'badge-blue' : 'badge-yellow'}`}>
                      {x.status}
                    </span>
                  </td>
                  <td>
                    {x.status === 'pending' && (
                      <>
                        <button type="button" className="btn btn-sm btn-success" style={{ marginRight: '4px' }} onClick={() => updateStatus(x._id, 'approved')}>Approve</button>
                        <button type="button" className="btn btn-sm btn-primary" style={{ marginRight: '4px' }} onClick={() => updateStatus(x._id, 'completed')}>Complete</button>
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
            <h2>Exit request</h2>
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
                <label>Last working day</label>
                <input type="date" value={form.lastWorkingDay} onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Notice period (days)</label>
                <input type="number" min="0" value={form.noticePeriodDays} onChange={(e) => setForm({ ...form, noticePeriodDays: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
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

export default ExitManagement

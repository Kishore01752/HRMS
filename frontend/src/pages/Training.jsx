import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const Training = () => {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', trainer: '', startDate: '', endDate: '', location: '', status: 'scheduled',
    attendees: []
  })

  const load = async () => {
    try {
      const [t, e] = await Promise.all([
        API.get('/trainings'),
        API.get('/employees')
      ])
      setList(t.data)
      setEmployees(e.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleAttendee = (id) => {
    setForm((f) => ({
      ...f,
      attendees: f.attendees.includes(id)
        ? f.attendees.filter((x) => x !== id)
        : [...f.attendees, id]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await API.post('/trainings', {
        ...form,
        attendees: form.attendees
      })
      setShowModal(false)
      setForm({
        title: '', description: '', trainer: '', startDate: '', endDate: '', location: '', status: 'scheduled',
        attendees: []
      })
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not schedule training')
    }
  }

  const markStatus = async (id, status) => {
    try {
      await API.put(`/trainings/${id}`, { status })
      load()
    } catch {
      alert('Could not update')
    }
  }

  if (loading) return <p style={{ color: '#718096' }}>Loading training...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Training module</h1>
        <p>Schedule sessions and track attendees</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Programs ({list.length})</h2>
          {user?.role === 'admin' && (
            <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>+ Schedule training</button>
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Dates</th>
              <th>Trainer</th>
              <th>Location</th>
              <th>Attendees</th>
              <th>Status</th>
              {user?.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', color: '#718096' }}>No training scheduled</td></tr>
            ) : list.map((t) => (
              <tr key={t._id}>
                <td style={{ fontWeight: 600 }}>{t.title}</td>
                <td style={{ fontSize: '13px' }}>{t.startDate}{t.endDate ? ` → ${t.endDate}` : ''}</td>
                <td>{t.trainer || '—'}</td>
                <td>{t.location || '—'}</td>
                <td>{t.attendees?.length || 0}</td>
                <td>
                  <span className={`badge ${t.status === 'completed' ? 'badge-green' : t.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                    {t.status}
                  </span>
                </td>
                {user?.role === 'admin' && (
                  <td>
                    {t.status === 'scheduled' && (
                      <>
                        <button type="button" className="btn btn-sm btn-success" style={{ marginRight: '4px' }} onClick={() => markStatus(t._id, 'completed')}>Complete</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => markStatus(t._id, 'cancelled')}>Cancel</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && user?.role === 'admin' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h2>Schedule training</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Trainer</label>
                <input value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Attendees</label>
                <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}>
                  {employees.map((em) => (
                    <label key={em._id} style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={form.attendees.includes(em._id)}
                        onChange={() => toggleAttendee(em._id)}
                      />{' '}
                      {em.name}
                    </label>
                  ))}
                </div>
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

export default Training

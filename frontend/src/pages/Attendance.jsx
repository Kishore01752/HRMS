import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const Attendance = () => {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [allRecords, setAllRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedEmp, setSelectedEmp] = useState('')
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load employees list (for admin)
  useEffect(() => {
    if (user?.role === 'admin') {
      API.get('/employees').then(r => setEmployees(r.data)).catch(console.log)
      API.get('/attendance/all').then(r => setAllRecords(r.data)).catch(console.log)
    }
  }, [user])

  const handleClockIn = async () => {
    if (!selectedEmp) return alert('Select an employee first')
    setLoading(true)
    try {
      const res = await API.post('/attendance/clockin', { employeeId: selectedEmp })
      setMsg('✅ ' + res.data.message)
      fetchRecords(selectedEmp)
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'))
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    if (!selectedEmp) return alert('Select an employee first')
    setLoading(true)
    try {
      const res = await API.post('/attendance/clockout', { employeeId: selectedEmp })
      setMsg('✅ ' + res.data.message)
      fetchRecords(selectedEmp)
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async (empId) => {
    try {
      const res = await API.get(`/attendance/${empId}`)
      setRecords(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleEmpChange = (e) => {
    setSelectedEmp(e.target.value)
    setMsg('')
    if (e.target.value) fetchRecords(e.target.value)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Track daily clock-in and clock-out</p>
      </div>

      {/* Clock widget */}
      <div className="clock-card">
        <h2>{time}</h2>
        <p>{new Date().toDateString()}</p>

        {user?.role === 'admin' && (
          <div style={{ marginTop: '16px' }}>
            <select
              value={selectedEmp}
              onChange={handleEmpChange}
              style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', marginBottom: '12px', minWidth: '200px' }}
            >
              <option value="">-- Select Employee --</option>
              {employees.map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="clock-buttons">
          <button className="btn btn-success" onClick={handleClockIn} disabled={loading}>Clock In</button>
          <button className="btn btn-danger" onClick={handleClockOut} disabled={loading}>Clock Out</button>
        </div>

        {msg && <p style={{ marginTop: '14px', fontWeight: 500 }}>{msg}</p>}
      </div>

      {/* Records table */}
      <div className="table-container">
        <div className="table-header">
          <h2>{user?.role === 'admin' ? 'All Attendance Records' : 'My Attendance'}</h2>
        </div>
        <table>
          <thead>
            <tr>
              {user?.role === 'admin' && <th>Employee</th>}
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(user?.role === 'admin' ? allRecords : records).length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#718096' }}>No records found</td></tr>
            ) : (user?.role === 'admin' ? allRecords : records).map(r => (
              <tr key={r._id}>
                {user?.role === 'admin' && <td>{r.employeeId?.name || 'N/A'}</td>}
                <td>{r.date}</td>
                <td>{r.clockIn || '—'}</td>
                <td>{r.clockOut || '—'}</td>
                <td><span className="badge badge-green">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attendance

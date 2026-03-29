import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const tabs = ['Leave Requests', 'Leave Balance', 'Calendar View']

const Leaves = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Leave Requests')
  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [balance, setBalance] = useState(null)
  const [balanceEmp, setBalanceEmp] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())

  const [form, setForm] = useState({
    employeeId: '', leaveType: 'sick',
    startDate: '', endDate: '', reason: ''
  })

  const fetchLeaves = async () => {
    try {
      const res = await API.get('/leaves/all')
      setLeaves(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
    API.get('/employees').then(r => setEmployees(r.data)).catch(console.log)
  }, [])

  const handleApply = async (e) => {
    e.preventDefault()
    try {
      await API.post('/leaves', form)
      setShowModal(false)
      setForm({ employeeId: '', leaveType: 'sick', startDate: '', endDate: '', reason: '' })
      fetchLeaves()
    } catch (err) {
      alert(err.response?.data?.message || 'Error applying leave')
    }
  }

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/leaves/${id}/status`, { status })
      fetchLeaves()
    } catch (err) {
      alert('Could not update status')
    }
  }

  const fetchBalance = async () => {
    if (!balanceEmp) return alert('Select an employee')
    try {
      const res = await API.get(`/leaves/balance/${balanceEmp}`)
      setBalance(res.data)
    } catch (err) {
      alert('Error fetching balance')
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'badge-green'
    if (status === 'rejected') return 'badge-red'
    return 'badge-yellow'
  }

  const managerView = leaves.some(
    (l) => l.employeeId?.email && user?.email && l.employeeId.email !== user.email
  )
  const showEmpCol = user?.role === 'admin' || managerView
  const showActCol = user?.role === 'admin' || managerView
  const colCount = 6 + (showEmpCol ? 1 : 0) + (showActCol ? 1 : 0)

  const canApproveLeave = (leave) => {
    if (user?.role === 'admin') return true
    if (!leave.employeeId?.email || !user?.email) return false
    return leave.employeeId.email !== user.email
  }

  // Build calendar data
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate()
  const getFirstDay = (month, year) => new Date(year, month, 1).getDay()

  const getLeavesOnDate = (day) => {
    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leaves.filter(l =>
      l.status === 'approved' &&
      dateStr >= l.startDate &&
      dateStr <= l.endDate
    )
  }

  const monthName = new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear)
  const firstDay = getFirstDay(calendarMonth, calendarYear)

  if (loading) return <p>Loading leaves...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Leave Management</h1>
        <p>Apply, approve and track employee leaves</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#fff', padding: '4px', borderRadius: '8px', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 500,
              background: activeTab === tab ? '#4f8ef7' : 'transparent',
              color: activeTab === tab ? '#fff' : '#718096'
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Leave Requests Tab */}
      {activeTab === 'Leave Requests' && (
        <div className="table-container">
          <div className="table-header">
            <h2>Leave Requests ({leaves.length})</h2>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Apply Leave</button>
          </div>
          <table>
            <thead>
              <tr>
                {showEmpCol && <th>Employee</th>}
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                {showActCol && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={colCount} style={{ textAlign: 'center', color: '#718096' }}>No leave requests yet</td></tr>
              ) : leaves.map(leave => (
                <tr key={leave._id}>
                  {showEmpCol && <td>{leave.employeeId?.name || 'N/A'}</td>}
                  <td style={{ textTransform: 'capitalize' }}>{leave.leaveType}</td>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}</td>
                  <td>{leave.reason || '—'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(leave.status)}`}>{leave.status}</span>
                  </td>
                  {showActCol && (
                    <td>
                      {leave.status === 'pending' && canApproveLeave(leave) ? (
                        <>
                          <button className="btn btn-sm btn-success" style={{ marginRight: '6px' }}
                            onClick={() => handleStatus(leave._id, 'approved')}>Approve</button>
                          <button className="btn btn-sm btn-danger"
                            onClick={() => handleStatus(leave._id, 'rejected')}>Reject</button>
                        </>
                      ) : '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Balance Tab */}
      {activeTab === 'Leave Balance' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', marginBottom: '16px' }}>Check Leave Balance</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Select Employee</label>
                <select value={balanceEmp} onChange={e => setBalanceEmp(e.target.value)}>
                  <option value="">Select employee</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={fetchBalance}>Check Balance</button>
            </div>
          </div>

          {balance && (
            <div className="table-container">
              <div className="table-header">
                <h2>Leave Balance — {balance.year}</h2>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Allowed</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(balance.balance).map(([type, data]) => (
                    <tr key={type}>
                      <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{type}</td>
                      <td>{data.allowed} days</td>
                      <td style={{ color: '#e53e3e' }}>{data.used} days</td>
                      <td style={{ color: '#38a169', fontWeight: 600 }}>{data.remaining} days</td>
                      <td style={{ width: '200px' }}>
                        <div style={{ background: '#edf2f7', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
                          <div style={{
                            background: data.remaining === 0 ? '#e53e3e' : '#4f8ef7',
                            width: `${data.allowed > 0 ? (data.used / data.allowed) * 100 : 0}%`,
                            height: '100%', borderRadius: '20px',
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Calendar View Tab */}
      {activeTab === 'Calendar View' && (
        <div className="card">
          {/* Month navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn" style={{ background: '#edf2f7' }}
              onClick={() => {
                if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1) }
                else setCalendarMonth(m => m - 1)
              }}>← Prev</button>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{monthName}</h2>
            <button className="btn" style={{ background: '#edf2f7' }}
              onClick={() => {
                if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1) }
                else setCalendarMonth(m => m + 1)
              }}>Next →</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#718096', padding: '8px' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {/* Empty cells for first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayLeaves = getLeavesOnDate(day)
              const isToday = day === new Date().getDate() &&
                calendarMonth === new Date().getMonth() &&
                calendarYear === new Date().getFullYear()

              return (
                <div key={day} style={{
                  minHeight: '70px', padding: '6px', borderRadius: '6px',
                  background: isToday ? '#ebf8ff' : '#f7fafc',
                  border: isToday ? '2px solid #4f8ef7' : '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: isToday ? 700 : 400, color: isToday ? '#4f8ef7' : '#4a5568', marginBottom: '4px' }}>{day}</div>
                  {dayLeaves.slice(0, 2).map(l => (
                    <div key={l._id} style={{
                      fontSize: '10px', background: '#4f8ef7', color: '#fff',
                      padding: '1px 5px', borderRadius: '3px', marginBottom: '2px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {l.employeeId?.name?.split(' ')[0]}
                    </div>
                  ))}
                  {dayLeaves.length > 2 && (
                    <div style={{ fontSize: '10px', color: '#718096' }}>+{dayLeaves.length - 2} more</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', fontSize: '12px', color: '#718096' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#4f8ef7', borderRadius: '2px' }} />
              Approved Leave
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#ebf8ff', border: '2px solid #4f8ef7', borderRadius: '2px' }} />
              Today
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Apply for Leave</h2>
            <form onSubmit={handleApply}>
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Employee</label>
                  <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} required>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Leave Type</label>
                <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="paid">Paid Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea rows="3" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                  placeholder="Optional reason..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#edf2f7' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaves
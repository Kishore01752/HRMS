import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const StatCard = ({ icon, label, value, bg, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg }}>{icon}</div>
    <div className="stat-info">
      <h3>{value ?? 0}</h3>
      <p>{label}</p>
      {sub && <p style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px' }}>{sub}</p>}
    </div>
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/dashboard/stats')
        setStats(res.data)
      } catch (err) {
        console.log('Error loading stats', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: '#718096' }}>Loading dashboard...</p>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>{new Date().toDateString()} — Here's what's happening today</p>
      </div>

      {/* Row 1 — Employee & Attendance */}
      <div className="stats-grid">
        <StatCard icon="👥" label="Total Employees" value={stats?.totalEmployees}
          bg="#ebf8ff" sub={`+${stats?.newThisMonth ?? 0} this month`} />
        <StatCard icon="✅" label="Present Today" value={stats?.presentToday}
          bg="#f0fff4" sub={`${stats?.absentToday ?? 0} absent`} />
        <StatCard icon="📋" label="Pending Leaves" value={stats?.pendingLeaves}
          bg="#fffff0" sub={`${stats?.approvedLeaves ?? 0} approved`} />
        <StatCard icon="💰" label="Unpaid Payroll" value={stats?.unpaidPayroll}
          bg="#fff5f5" sub="drafts pending" />
      </div>

      {/* Row 2 — Expenses, Jobs, Applicants, Holidays */}
      <div className="stats-grid" style={{ marginTop: '0' }}>
        <StatCard icon="💸" label="Pending Expenses" value={stats?.pendingExpenses}
          bg="#fef3c7" sub="awaiting approval" />
        <StatCard icon="📝" label="Open Jobs" value={stats?.openJobs}
          bg="#ede9fe" sub={`${stats?.totalApplicants ?? 0} total applicants`} />
        <StatCard icon="🗓️" label="Upcoming Holidays" value={stats?.upcomingHolidays?.length ?? 0}
          bg="#fce7f3" sub="next 30 days" />
        <StatCard icon="💵" label="Total Reimbursed"
          value={`₹${(stats?.totalExpenseReimbursed ?? 0).toLocaleString()}`}
          bg="#d1fae5" sub="all time" />
      </div>

      {/* Bottom section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>

        {/* Upcoming Holidays */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#1a202c' }}>
            🗓️ Upcoming Holidays
          </h2>
          {!stats?.upcomingHolidays?.length ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>No upcoming holidays in next 30 days</p>
          ) : stats?.upcomingHolidays?.map(h => (
            <div key={h._id} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
              borderBottom: '1px solid #edf2f7'
            }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>{h.name}</div>
                <div style={{ fontSize: '12px', color: '#718096', textTransform: 'capitalize' }}>{h.type}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#4a5568', fontWeight: 500 }}>
                {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Employees */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#1a202c' }}>
            👥 Recently Added Employees
          </h2>
          {!stats?.recentEmployees?.length ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>No employees added yet</p>
          ) : stats?.recentEmployees?.map(emp => (
            <div key={emp._id} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
              borderBottom: '1px solid #edf2f7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar-placeholder">{emp.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '14px' }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>{emp.department}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                {new Date(emp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Quick Links */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: '#1a202c' }}>
          ⚡ Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: '+ Add Employee', link: '/employees', color: '#4f8ef7' },
            { label: '🏢 Departments', link: '/departments', color: '#2c5282' },
            { label: '📋 View Leaves', link: '/leaves', color: '#38a169' },
            { label: '💰 Run Payroll', link: '/payroll', color: '#d69e2e' },
            { label: '📝 Post Job', link: '/recruitment', color: '#805ad5' },
            { label: '💸 Expenses', link: '/expenses', color: '#e53e3e' },
            { label: '🗓️ Holidays', link: '/holidays', color: '#3182ce' },
            { label: '📚 Training', link: '/training', color: '#dd6b20' },
            { label: '🚪 Exit', link: '/exit', color: '#718096' },
          ].map(action => (
            <Link
              key={action.link}
              to={action.link}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: action.color,
                color: '#fff',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
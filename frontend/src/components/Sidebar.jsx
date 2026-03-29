import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        HR<span>MS</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">📊 Dashboard</NavLink>
        <NavLink to="/employees">👥 Employees</NavLink>
        <NavLink to="/attendance">🕐 Attendance</NavLink>
        <NavLink to="/leaves">📋 Leave</NavLink>
        <NavLink to="/payroll">💰 Payroll</NavLink>
        <NavLink to="/performance">🎯 Performance</NavLink>
        <NavLink to="/recruitment">📝 Recruitment</NavLink>
        <NavLink to="/departments">🏢 Departments</NavLink>
        <NavLink to="/designations">📶 Designations</NavLink>
        <NavLink to="/holidays">🗓️ Holidays</NavLink>
        <NavLink to="/expenses">💸 Expenses</NavLink>
        <NavLink to="/training">📚 Training</NavLink>
        <NavLink to="/exit">🚪 Exit</NavLink>
      </nav>

      <div className="sidebar-bottom">
        <p style={{ color: '#a0aec0', fontSize: '13px', marginBottom: '10px' }}>
          👤 {user?.name} <br />
          <span style={{ fontSize: '11px', opacity: 0.7 }}>{user?.role}</span>
        </p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Sidebar
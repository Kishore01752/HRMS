import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Leaves from './pages/Leaves'
import Payroll from './pages/Payroll'
import Performance from './pages/Performance'
import Recruitment from './pages/Recruitment'
import Holidays from './pages/Holidays'
import Expenses from './pages/Expenses'
import Departments from './pages/Departments'
import Designations from './pages/Designations'
import Training from './pages/Training'
import ExitManagement from './pages/ExitManagement'


// Protect routes — redirect to login if not logged in
const PrivateRoute = ({ children }) => {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

// Layout wraps pages that need the sidebar
const Layout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <div className="main-content">
      {children}
    </div>
  </div>
)

const AppRoutes = () => {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />

      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout><Dashboard /></Layout>
        </PrivateRoute>
      } />

      <Route path="/employees" element={
        <PrivateRoute>
          <Layout><Employees /></Layout>
        </PrivateRoute>
      } />

      <Route path="/attendance" element={
        <PrivateRoute>
          <Layout><Attendance /></Layout>
        </PrivateRoute>
      } />

      <Route path="/leaves" element={
        <PrivateRoute>
          <Layout><Leaves /></Layout>
        </PrivateRoute>
      } />

      <Route path="/payroll" element={
        <PrivateRoute>
          <Layout><Payroll /></Layout>
        </PrivateRoute>
      } />

      <Route path="/performance" element={
         <PrivateRoute>
         <Layout><Performance /></Layout>
        </PrivateRoute>
      } />

      <Route path="/recruitment" element={
        <PrivateRoute>
        <Layout><Recruitment /></Layout>
      </PrivateRoute>
      } />
      
      <Route path="/holidays" element={
        <PrivateRoute>
        <Layout><Holidays /></Layout>
      </PrivateRoute>
      } />

      <Route path="/expenses" element={
        <PrivateRoute>
        <Layout><Expenses /></Layout>
      </PrivateRoute>
      } />

      <Route path="/departments" element={
        <PrivateRoute>
          <Layout><Departments /></Layout>
        </PrivateRoute>
      } />

      <Route path="/designations" element={
        <PrivateRoute>
          <Layout><Designations /></Layout>
        </PrivateRoute>
      } />

      <Route path="/training" element={
        <PrivateRoute>
          <Layout><Training /></Layout>
        </PrivateRoute>
      } />

      <Route path="/exit" element={
        <PrivateRoute>
          <Layout><ExitManagement /></Layout>
        </PrivateRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

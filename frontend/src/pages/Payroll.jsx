import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const Payroll = () => {
  const { user } = useAuth()
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    employeeId: '', month: '', year: new Date().getFullYear(),
    bonus: 0, allowances: 0, otherDeductions: 0
  })

  const fetchPayrolls = async () => {
    try {
      const res = await API.get('/payroll/all')
      setPayrolls(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayrolls()
    API.get('/employees').then(r => setEmployees(r.data)).catch(console.log)
  }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    try {
      await API.post('/payroll/generate', form)
      setShowModal(false)
      fetchPayrolls()
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating payroll')
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await API.put(`/payroll/${id}/pay`)
      fetchPayrolls()
    } catch {
      alert('Could not update')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll?')) return
    try {
      await API.delete(`/payroll/${id}`)
      fetchPayrolls()
    } catch {
      alert('Could not delete')
    }
  }

  // ✅ FIXED DOWNLOAD FUNCTION (WORKING)
  const handleDownloadPayslip = async (id, empName, month, year) => {
    try {
      const response = await fetch(
        `https://hrms-3-ks6x.onrender.com/api/payroll/${id}/payslip`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('hrms_token')}`
          }
        }
      )

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `payslip-${empName}-${month}-${year}.pdf`
      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Error downloading payslip')
    }
  }

  if (loading) return <p>Loading payroll...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Payroll Management</h1>
        <p>Manage monthly salary and payslips</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Payroll Records ({payrolls.length})</h2>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Generate Payroll
            </button>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Month/Year</th>
              <th>Basic</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(p => (
              <tr key={p._id}>
                <td>{p.employeeId?.name}</td>
                <td>{p.month}/{p.year}</td>
                <td>₹{p.basicSalary}</td>
                <td>₹{p.grossSalary}</td>
                <td>-₹{p.tax}</td>
                <td>₹{p.netSalary}</td>
                <td>{p.status}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleDownloadPayslip(
                      p._id,
                      p.employeeId?.name,
                      p.month,
                      p.year
                    )}
                  >
                    Payslip
                  </button>

                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Payroll
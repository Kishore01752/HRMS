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
    const num = (v) => {
      const n = parseFloat(String(v ?? '').replace(/,/g, '').trim())
      return Number.isFinite(n) ? n : 0
    }
    try {
      await API.post('/payroll/generate', {
        employeeId: form.employeeId,
        month: form.month,
        year: form.year,
        bonus: num(form.bonus),
        allowances: num(form.allowances),
        otherDeductions: num(form.otherDeductions)
      })
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
    } catch (err) {
      alert('Could not update')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll?')) return
    try {
      await API.delete(`/payroll/${id}`)
      fetchPayrolls()
    } catch (err) {
      alert('Could not delete')
    }
  }

  // Download payslip as PDF
  const handleDownloadPayslip = async (id, empName, month, year) => {
    try {
      const token = localStorage.getItem('hrms_token')
      const res = await fetch(`/api/payroll/${id}/payslip`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('Failed to generate payslip')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslip-${empName}-${month}-${year}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
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
            {payrolls.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: '#718096' }}>
                  No payroll records yet
                </td>
              </tr>
            ) : payrolls.map(p => (
              <tr key={p._id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.employeeId?.name}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>{p.employeeId?.department}</div>
                </td>
                <td>{p.month}/{p.year}</td>
                <td>₹{p.basicSalary?.toLocaleString()}</td>
                <td>₹{p.grossSalary?.toLocaleString()}</td>
                <td style={{ color: '#e53e3e' }}>
                  -₹{(p.providentFund + p.tax + p.otherDeductions)?.toLocaleString()}
                </td>
                <td style={{ fontWeight: 600, color: '#38a169' }}>
                  ₹{p.netSalary?.toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${p.status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {/* Mark Paid button — only for draft */}
                    {p.status === 'draft' && user?.role === 'admin' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleMarkPaid(p._id)}
                      >
                        Mark Paid
                      </button>
                    )}

                    {/* Download Payslip — available for everyone */}
                    <button
                      className="btn btn-sm"
                      style={{ background: '#805ad5', color: '#fff' }}
                      onClick={() => handleDownloadPayslip(
                        p._id,
                        p.employeeId?.name,
                        p.month,
                        p.year
                      )}
                    >
                      📄 Payslip
                    </button>

                    {/* Delete — admin only */}
                    {user?.role === 'admin' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(p._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Payroll Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Generate Payroll</h2>
            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label>Employee</label>
                <select
                  value={form.employeeId}
                  onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map(e => (
                    <option key={e._id} value={e._id}>
                      {e.name} — {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Month (1-12)</label>
                  <input
                    type="number" min="1" max="12"
                    placeholder="e.g. 3 for March"
                    value={form.month}
                    onChange={e => setForm({ ...form, month: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Bonus (₹)</label>
                  <input
                    type="number"
                    value={form.bonus}
                    onChange={e => setForm({ ...form, bonus: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Extra Allowances (₹)</label>
                  <input
                    type="number"
                    value={form.allowances}
                    onChange={e => setForm({ ...form, allowances: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Other Deductions (₹)</label>
                <input
                  type="number"
                  value={form.otherDeductions}
                  onChange={e => setForm({ ...form, otherDeductions: e.target.value })}
                />
              </div>

              {/* Salary breakdown preview — illustrative */}
              <div style={{ background: '#f7fafc', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', color: '#4a5568' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>💡 Salary breakdown (preview)</div>
                <div>Employee <strong>salary</strong> field is treated as <strong>monthly CTC</strong> (₹).</div>
                <div>Basic ≈ 50% of monthly CTC · HRA ≈ 20% · employee PF ≈ 12% of basic (monthly).</div>
                <div>TDS uses a simplified <strong>India new-regime–style</strong> annual estimate (₹75k standard deduction, progressive slabs); monthly TDS is shown on the generated payslip.</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#a0aec0' }}>Not tax or legal advice — demo numbers only.</div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                  style={{ background: '#edf2f7' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payroll
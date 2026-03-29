import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const tabs = ['All Employees', 'Org Chart']

const Employees = () => {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [orgData, setOrgData] = useState([])
  const [activeTab, setActiveTab] = useState('All Employees')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [skillInput, setSkillInput] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    dateOfBirth: '', gender: '', department: '',
    designation: '', position: '', employeeId: '',
    joiningDate: '', salary: '', reportingTo: '',
    costCenter: '',
    emergencyContact: { name: '', phone: '', relation: '' },
    skills: [],
    employmentHistory: [{ company: '', position: '', from: '', to: '' }]
  })
  const [imageFile, setImageFile] = useState(null)
  const [docUpload, setDocUpload] = useState({ file: null, name: '', docType: 'other' })
  const [docUploading, setDocUploading] = useState(false)

  const assetUrl = (path) =>
    path?.startsWith('http') ? path : `http://localhost:5000${path}`

  const canEditEmployee = (emp) =>
    user?.role === 'admin' || String(emp?.userId) === String(user?.id)

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees')
      setEmployees(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrgChart = async () => {
    try {
      const res = await API.get('/employees/orgchart')
      setOrgData(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchEmployees()
    fetchOrgChart()
  }, [])

  const openAdd = () => {
    setEditData(null)
    setForm({
      name: '', email: '', phone: '', address: '',
      dateOfBirth: '', gender: '', department: '',
      designation: '', position: '', employeeId: '',
      joiningDate: '', salary: '', reportingTo: '',
      costCenter: '',
      emergencyContact: { name: '', phone: '', relation: '' },
      skills: [],
      employmentHistory: [{ company: '', position: '', from: '', to: '' }]
    })
    setImageFile(null)
    setShowModal(true)
  }

  const openEdit = (emp) => {
    setEditData(emp)
    setForm({
      name: emp.name || '', email: emp.email || '',
      phone: emp.phone || '', address: emp.address || '',
      dateOfBirth: emp.dateOfBirth || '', gender: emp.gender || '',
      department: emp.department || '', designation: emp.designation || '',
      position: emp.position || '', employeeId: emp.employeeId || '',
      joiningDate: emp.joiningDate?.split('T')[0] || '',
      salary: emp.salary || '', reportingTo: emp.reportingTo?._id || '',
      costCenter: emp.costCenter || '',
      emergencyContact: emp.emergencyContact || { name: '', phone: '', relation: '' },
      skills: emp.skills || [],
      employmentHistory: emp.employmentHistory?.length
        ? emp.employmentHistory
        : [{ company: '', position: '', from: '', to: '' }]
    })
    setImageFile(null)
    setShowModal(true)
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] })
      setSkillInput('')
    }
  }

  const removeSkill = (i) => {
    setForm({ ...form, skills: form.skills.filter((_, idx) => idx !== i) })
  }

  const updateHistory = (index, field, value) => {
    const updated = [...form.employmentHistory]
    updated[index][field] = value
    setForm({ ...form, employmentHistory: updated })
  }

  const addHistoryRow = () => {
    setForm({
      ...form,
      employmentHistory: [...form.employmentHistory, { company: '', position: '', from: '', to: '' }]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()

    // Append basic fields
    const basicFields = [
      'name', 'email', 'phone', 'address', 'dateOfBirth', 'gender',
      'department', 'designation', 'position', 'employeeId',
      'joiningDate', 'salary', 'reportingTo', 'costCenter'
    ]
    basicFields.forEach(f => data.append(f, form[f]))

    // Append JSON fields
    data.append('emergencyContact', JSON.stringify(form.emergencyContact))
    data.append('skills', JSON.stringify(form.skills))
    data.append('employmentHistory', JSON.stringify(form.employmentHistory))

    if (imageFile) data.append('profileImage', imageFile)

    try {
      if (editData) {
        await API.put(`/employees/${editData._id}`, data)
      } else {
        await API.post('/employees', data)
      }
      setShowModal(false)
      fetchEmployees()
      fetchOrgChart()
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return
    try {
      await API.delete(`/employees/${id}`)
      fetchEmployees()
    } catch (err) {
      alert('Could not delete')
    }
  }

  const handleDocumentUpload = async (e) => {
    e.preventDefault()
    if (!selectedEmp?._id || !docUpload.file) {
      alert('Choose a file to upload')
      return
    }
    setDocUploading(true)
    try {
      const data = new FormData()
      data.append('document', docUpload.file)
      if (docUpload.name.trim()) data.append('name', docUpload.name.trim())
      data.append('docType', docUpload.docType || 'other')
      await API.post(`/employees/${selectedEmp._id}/documents`, data)
      const refreshed = await API.get(`/employees/${selectedEmp._id}`)
      setSelectedEmp(refreshed.data)
      setEmployees((prev) =>
        prev.map((x) => (x._id === selectedEmp._id ? refreshed.data : x))
      )
      setDocUpload({ file: null, name: '', docType: 'other' })
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed')
    } finally {
      setDocUploading(false)
    }
  }

  // Build org chart tree
  const buildTree = (employees, parentId = null) => {
    return employees
      .filter(e => {
        const repId = e.reportingTo?._id || e.reportingTo
        return parentId === null ? !repId : repId === parentId
      })
      .map(e => ({
        ...e,
        children: buildTree(employees, e._id)
      }))
  }

  const OrgNode = ({ node, level = 0 }) => (
    <div style={{ marginLeft: level * 30 + 'px', marginBottom: '8px' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: '8px', padding: '10px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        borderLeft: `3px solid ${level === 0 ? '#4f8ef7' : level === 1 ? '#38a169' : '#d69e2e'}`
      }}>
        <div className="avatar-placeholder" style={{
          background: level === 0 ? '#4f8ef7' : level === 1 ? '#38a169' : '#d69e2e'
        }}>
          {node.name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{node.name}</div>
          <div style={{ fontSize: '12px', color: '#718096' }}>{node.position} — {node.department}</div>
        </div>
      </div>
      {node.children?.length > 0 && (
        <div style={{ marginTop: '8px', paddingLeft: '20px', borderLeft: '2px dashed #e2e8f0' }}>
          {node.children.map(child => (
            <OrgNode key={child._id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )

  if (loading) return <p>Loading employees...</p>

  const tree = buildTree(orgData)

  return (
    <div>
      <div className="page-header">
        <h1>Employees</h1>
        <p>Manage your team members and organization structure</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#fff', padding: '4px', borderRadius: '8px', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px', borderRadius: '6px', border: 'none',
              cursor: 'pointer', fontSize: '14px', fontWeight: 500,
              background: activeTab === tab ? '#4f8ef7' : 'transparent',
              color: activeTab === tab ? '#fff' : '#718096'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* All Employees Tab */}
      {activeTab === 'All Employees' && (
        <div className="table-container">
          <div className="table-header">
            <h2>All Employees ({employees.length})</h2>
            {user?.role === 'admin' && (
              <button className="btn btn-primary" onClick={openAdd}>+ Add Employee</button>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Cost Center</th>
                <th>Reports To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: '#718096' }}>No employees yet</td></tr>
              ) : employees.map(emp => (
                <tr key={emp._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {emp.profileImage
                        ? <img src={assetUrl(emp.profileImage)} className="avatar" alt="" />
                        : <div className="avatar-placeholder">{emp.name[0]}</div>
                      }
                      <div>
                        <div style={{ fontWeight: 500 }}>{emp.name}</div>
                        <div style={{ fontSize: '12px', color: '#718096' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.costCenter || '—'}</td>
                  <td>{emp.reportingTo?.name || '—'}</td>
                  <td>
                    <span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    {(user?.role === 'admin' || String(emp.userId) === String(user?.id)) && (
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ marginRight: '6px' }}
                        onClick={() => { setSelectedEmp(emp); setShowDetailModal(true) }}
                      >
                        View
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <button className="btn btn-sm btn-primary" style={{ marginRight: '6px' }}
                          onClick={() => openEdit(emp)}>Edit</button>
                        <button className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(emp._id)}>Delete</button>
                      </>
                    )}
                    {user?.role !== 'admin' && String(emp.userId) !== String(user?.id) && (
                      <span style={{ color: '#a0aec0', fontSize: '13px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Org Chart Tab */}
      {activeTab === 'Org Chart' && (
        <div className="card">
          <h2 style={{ marginBottom: '20px', fontSize: '16px' }}>Organization Structure</h2>
          {tree.length === 0 ? (
            <p style={{ color: '#718096' }}>No org chart data. Add employees with reporting structure.</p>
          ) : tree.map(node => (
            <OrgNode key={node._id} node={node} level={0} />
          ))}
        </div>
      )}

      {/* Employee Detail Modal */}
      {showDetailModal && selectedEmp && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" style={{ width: '640px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              {selectedEmp.profileImage
                ? <img src={assetUrl(selectedEmp.profileImage)} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                : <div className="avatar-placeholder" style={{ width: '64px', height: '64px', fontSize: '24px' }}>{selectedEmp.name[0]}</div>
              }
              <div>
                <h2 style={{ marginBottom: '4px' }}>{selectedEmp.name}</h2>
                <p style={{ color: '#718096', fontSize: '14px' }}>{selectedEmp.designation} — {selectedEmp.department}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Email', value: selectedEmp.email },
                { label: 'Phone', value: selectedEmp.phone },
                { label: 'Date of Birth', value: selectedEmp.dateOfBirth },
                { label: 'Gender', value: selectedEmp.gender },
                { label: 'Employee ID', value: selectedEmp.employeeId },
                { label: 'Cost Center', value: selectedEmp.costCenter },
                { label: 'Joining Date', value: selectedEmp.joiningDate?.split('T')[0] },
                { label: 'Reports To', value: selectedEmp.reportingTo?.name },
              ].map(item => (
                <div key={item.label} style={{ background: '#f7fafc', padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#a0aec0', marginBottom: '2px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.value || '—'}</div>
                </div>
              ))}
            </div>

            {/* Emergency Contact */}
            {selectedEmp.emergencyContact?.name && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#4a5568' }}>🚨 Emergency Contact</div>
                <div style={{ background: '#fff5f5', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>
                  {selectedEmp.emergencyContact.name} ({selectedEmp.emergencyContact.relation}) — {selectedEmp.emergencyContact.phone}
                </div>
              </div>
            )}

            {/* Skills */}
            {selectedEmp.skills?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#4a5568' }}>🛠️ Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedEmp.skills.map((s, i) => (
                    <span key={i} style={{ background: '#ebf8ff', color: '#3182ce', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Employment History */}
            {selectedEmp.employmentHistory?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#4a5568' }}>💼 Employment History</div>
                {selectedEmp.employmentHistory.map((h, i) => (
                  <div key={i} style={{ background: '#f7fafc', padding: '10px', borderRadius: '6px', marginBottom: '6px', fontSize: '14px' }}>
                    <div style={{ fontWeight: 500 }}>{h.position} at {h.company}</div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>{h.from} → {h.to}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Documents */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#4a5568' }}>📄 Documents</div>
              {selectedEmp.documents?.length > 0 ? (
                selectedEmp.documents.map((d, i) => (
                  <div key={i} style={{ background: '#f7fafc', padding: '10px', borderRadius: '6px', marginBottom: '6px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span>{d.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{d.type}</span>
                      {d.url && (
                        <a href={assetUrl(d.url)} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ padding: '2px 10px', fontSize: '12px' }}>
                          Open
                        </a>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: '#718096', margin: 0 }}>No documents uploaded yet.</p>
              )}

              {canEditEmployee(selectedEmp) && (
                <form onSubmit={handleDocumentUpload} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#4a5568' }}>Upload document</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>File</label>
                      <input
                        type="file"
                        onChange={(e) => setDocUpload({ ...docUpload, file: e.target.files?.[0] || null })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Label (optional)</label>
                      <input
                        value={docUpload.name}
                        onChange={(e) => setDocUpload({ ...docUpload, name: e.target.value })}
                        placeholder="e.g. PAN card"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={docUpload.docType}
                      onChange={(e) => setDocUpload({ ...docUpload, docType: e.target.value })}
                    >
                      <option value="id_proof">ID proof</option>
                      <option value="contract">Contract</option>
                      <option value="certification">Certification</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={docUploading || !docUpload.file}>
                    {docUploading ? 'Uploading…' : 'Upload'}
                  </button>
                </form>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowDetailModal(false)} style={{ background: '#edf2f7' }}>Close</button>
              {user?.role === 'admin' && (
                <button className="btn btn-primary" onClick={() => { setShowDetailModal(false); openEdit(selectedEmp) }}>Edit Employee</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: '640px' }} onClick={e => e.stopPropagation()}>
            <h2>{editData ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit}>

              {/* Basic Info */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', marginBottom: '10px' }}>👤 Basic Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              {/* Job Info */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', margin: '16px 0 10px' }}>💼 Job Info</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee ID</label>
                  <input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Designation</label>
                  <input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Salary (CTC)</label>
                  <input type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Joining Date</label>
                  <input type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cost Center</label>
                  <input value={form.costCenter} onChange={e => setForm({ ...form, costCenter: e.target.value })} placeholder="e.g. CC-001" />
                </div>
                <div className="form-group">
                  <label>Reports To</label>
                  <select value={form.reportingTo} onChange={e => setForm({ ...form, reportingTo: e.target.value })}>
                    <option value="">None</option>
                    {employees.filter(e => e._id !== editData?._id).map(e => (
                      <option key={e._id} value={e._id}>{e.name} — {e.position}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', margin: '16px 0 10px' }}>🚨 Emergency Contact</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input value={form.emergencyContact.name}
                    onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.emergencyContact.phone}
                    onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
                </div>
              </div>
              <div className="form-group">
                <label>Relation</label>
                <input value={form.emergencyContact.relation}
                  onChange={e => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })}
                  placeholder="e.g. Parent, Spouse" />
              </div>

              {/* Skills */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', margin: '16px 0 10px' }}>🛠️ Skills</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Type skill and press Enter or Add"
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}
                />
                <button type="button" className="btn btn-primary" onClick={addSkill}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {form.skills.map((s, i) => (
                  <span key={i} style={{ background: '#ebf8ff', color: '#3182ce', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}
                    onClick={() => removeSkill(i)}>
                    {s} ✕
                  </span>
                ))}
              </div>

              {/* Employment History */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', margin: '16px 0 10px' }}>💼 Employment History</div>
              {form.employmentHistory.map((h, i) => (
                <div key={i} style={{ background: '#f7fafc', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company</label>
                      <input value={h.company} onChange={e => updateHistory(i, 'company', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Position</label>
                      <input value={h.position} onChange={e => updateHistory(i, 'position', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>From</label>
                      <input type="date" value={h.from} onChange={e => updateHistory(i, 'from', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>To</label>
                      <input type="date" value={h.to} onChange={e => updateHistory(i, 'to', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn" style={{ background: '#edf2f7', fontSize: '13px', marginBottom: '16px' }} onClick={addHistoryRow}>
                + Add Previous Job
              </button>

              {/* Profile Image */}
              <div className="form-group">
                <label>Profile Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#edf2f7' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editData ? 'Update' : 'Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
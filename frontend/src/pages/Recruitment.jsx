import { useEffect, useState } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  applied: 'badge-blue',
  screening: 'badge-yellow',
  interview: 'badge-yellow',
  offered: 'badge-green',
  hired: 'badge-green',
  rejected: 'badge-red'
}

const Recruitment = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [showApplicantModal, setShowApplicantModal] = useState(false)
  const [interviewModal, setInterviewModal] = useState(null)
  const [interviewForm, setInterviewForm] = useState({
    interviewDate: '', notes: '', status: 'interview'
  })
  const [loading, setLoading] = useState(true)

  const [jobForm, setJobForm] = useState({
    jobTitle: '', department: '', location: '',
    jobType: 'full-time', description: '', requirements: '', vacancies: 1
  })

  const [applicantForm, setApplicantForm] = useState({
    name: '', email: '', phone: '', notes: ''
  })

  const fetchJobs = async () => {
    try {
      const res = await API.get('/recruitment')
      const list = res.data || []
      setJobs(list)
      setSelectedJob((prev) => {
        if (!prev) return null
        const next = list.find((j) => j._id === prev._id)
        return next || null
      })
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    const vacancies = Math.max(1, parseInt(jobForm.vacancies, 10) || 1)
    try {
      await API.post('/recruitment', { ...jobForm, vacancies })
      setShowJobModal(false)
      setJobForm({
        jobTitle: '', department: '', location: '',
        jobType: 'full-time', description: '', requirements: '', vacancies: 1
      })
      fetchJobs()
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error creating job'
      alert(msg)
    }
  }

  const handleAddApplicant = async (e) => {
    e.preventDefault()
    try {
      await API.post(`/recruitment/${selectedJob._id}/applicants`, applicantForm)
      setShowApplicantModal(false)
      setApplicantForm({ name: '', email: '', phone: '', notes: '' })
      fetchJobs()
    } catch (err) {
      alert('Error adding applicant')
    }
  }

  const handleStatusChange = async (jobId, applicantId, status) => {
    try {
      await API.put(`/recruitment/${jobId}/applicants/${applicantId}`, { status })
      fetchJobs()
    } catch (err) {
      alert('Error updating status')
    }
  }

  const openInterviewModal = (job, applicant) => {
    const idt = applicant.interviewDate
    let localVal = ''
    if (idt) {
      const d = new Date(idt)
      if (!Number.isNaN(d.getTime())) {
        const pad = (n) => String(n).padStart(2, '0')
        localVal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      }
    }
    setInterviewForm({
      interviewDate: localVal,
      notes: applicant.notes || '',
      status: applicant.status || 'interview'
    })
    setInterviewModal({ job, applicant })
  }

  const handleSaveInterview = async (e) => {
    e.preventDefault()
    if (!interviewModal) return
    const { job, applicant } = interviewModal
    try {
      const iso = interviewForm.interviewDate
        ? new Date(interviewForm.interviewDate).toISOString()
        : undefined
      await API.put(`/recruitment/${job._id}/applicants/${applicant._id}`, {
        status: interviewForm.status,
        interviewDate: iso,
        notes: interviewForm.notes || undefined
      })
      setInterviewModal(null)
      await fetchJobs()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save interview')
    }
  }

  const formatInterviewWhen = (raw) => {
    if (!raw) return null
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }

  const handleCloseJob = async (jobId, currentStatus) => {
    try {
      await API.put(`/recruitment/${jobId}`, {
        status: currentStatus === 'open' ? 'closed' : 'open'
      })
      fetchJobs()
    } catch (err) {
      alert('Error updating job')
    }
  }

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return
    try {
      await API.delete(`/recruitment/${id}`)
      setSelectedJob(null)
      fetchJobs()
    } catch (err) {
      alert('Error deleting job')
    }
  }

  // Download offer letter as PDF
  const handleDownloadOfferLetter = async (jobId, applicantId, applicantName) => {
  try {
    const res = await API.get(
      `/recruitment/${jobId}/applicants/${applicantId}/offerletter`,
      {
        responseType: 'blob'
      }
    )

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `offer-letter-${applicantName}.pdf`
    document.body.appendChild(a)
    a.click()

    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    alert("Error generating offer letter")
  }
}

  if (loading) return <p>Loading recruitment...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Recruitment</h1>
        <p>Manage job postings and applicants</p>
      </div>

      {/* Job listings */}
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <div className="table-header">
          <h2>Job Postings ({jobs.length})</h2>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowJobModal(true)}>
              + Post Job
            </button>
          )}
        </div>

        <table>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Department</th>
              <th>Type</th>
              <th>Vacancies</th>
              <th>Applicants</th>
              <th>Status</th>
              {user?.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#718096' }}>
                  No job postings yet
                </td>
              </tr>
            ) : jobs.map(job => (
              <tr key={job._id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{job.jobTitle}</div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>{job.location}</div>
                </td>
                <td>{job.department}</td>
                <td style={{ textTransform: 'capitalize' }}>{job.jobType}</td>
                <td>{job.vacancies}</td>
                <td>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#ebf8ff', color: '#3182ce' }}
                    onClick={() => setSelectedJob(
                      selectedJob?._id === job._id ? null : job
                    )}
                  >
                    {job.applicants?.length} applicants
                  </button>
                </td>
                <td>
                  <span className={`badge ${job.status === 'open' ? 'badge-green' : 'badge-red'}`}>
                    {job.status}
                  </span>
                </td>
                {user?.role === 'admin' && (
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => { setSelectedJob(job); setShowApplicantModal(true) }}
                      >
                        + Applicant
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{
                          background: '#fffff0', color: '#d69e2e',
                          border: '1px solid #fef08a'
                        }}
                        onClick={() => handleCloseJob(job._id, job.status)}
                      >
                        {job.status === 'open' ? 'Close' : 'Reopen'}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Applicants for selected job */}
      {selectedJob && (
        <div className="table-container">
          <div className="table-header">
            <h2>Applicants — {selectedJob.jobTitle}</h2>
            <button
              className="btn"
              style={{ background: '#edf2f7', fontSize: '13px' }}
              onClick={() => setSelectedJob(null)}
            >
              ✕ Close
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Interview</th>
                <th>Notes</th>
                <th>Status</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {selectedJob.applicants?.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 7 : 6} style={{ textAlign: 'center', color: '#718096' }}>
                    No applicants yet
                  </td>
                </tr>
              ) : selectedJob.applicants?.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 500 }}>{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.phone || '—'}</td>
                  <td style={{ fontSize: '13px', color: '#4a5568' }}>
                    {formatInterviewWhen(a.interviewDate) || '—'}
                  </td>
                  <td>{a.notes || '—'}</td>
                  <td>
                    <span className={`badge ${statusColors[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{ background: '#ebf8ff', color: '#2b6cb0' }}
                          onClick={() => openInterviewModal(selectedJob, a)}
                        >
                          Schedule
                        </button>
                        {/* Status dropdown */}
                        <select
                          value={a.status}
                          onChange={e => handleStatusChange(selectedJob._id, a._id, e.target.value)}
                          style={{
                            padding: '4px 8px', borderRadius: '4px',
                            border: '1px solid #e2e8f0', fontSize: '13px'
                          }}
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interview">Interview</option>
                          <option value="offered">Offered</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        {/* Offer Letter button — only for offered or hired */}
                        {(a.status === 'offered' || a.status === 'hired') && (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#805ad5', color: '#fff' }}
                            onClick={() => handleDownloadOfferLetter(
                              selectedJob._id, a._id, a.name
                            )}
                          >
                            📄 Offer Letter
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Job Modal */}
      {showJobModal && (
        <div className="modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Post New Job</h2>
            <form onSubmit={handleCreateJob}>
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    value={jobForm.jobTitle}
                    onChange={e => setJobForm({ ...jobForm, jobTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    value={jobForm.department}
                    onChange={e => setJobForm({ ...jobForm, department: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    value={jobForm.location}
                    onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    value={jobForm.jobType}
                    onChange={e => setJobForm({ ...jobForm, jobType: e.target.value })}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Vacancies</label>
                <input
                  type="number" min="1"
                  value={jobForm.vacancies}
                  onChange={e => setJobForm({ ...jobForm, vacancies: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Requirements</label>
                <textarea
                  rows="2"
                  value={jobForm.requirements}
                  onChange={e => setJobForm({ ...jobForm, requirements: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button" className="btn"
                  onClick={() => setShowJobModal(false)}
                  style={{ background: '#edf2f7' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule interview */}
      {interviewModal && (
        <div className="modal-overlay" onClick={() => setInterviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Schedule interview — {interviewModal.applicant.name}</h2>
            <p style={{ fontSize: '13px', color: '#718096', marginTop: '-8px' }}>
              {interviewModal.job.jobTitle}
            </p>
            <form onSubmit={handleSaveInterview}>
              <div className="form-group">
                <label>Date &amp; time</label>
                <input
                  type="datetime-local"
                  value={interviewForm.interviewDate}
                  onChange={e => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pipeline status</label>
                <select
                  value={interviewForm.status}
                  onChange={e => setInterviewForm({ ...interviewForm, status: e.target.value })}
                >
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offered">Offered</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={interviewForm.notes}
                  onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: '#edf2f7' }} onClick={() => setInterviewModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Applicant Modal */}
      {showApplicantModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowApplicantModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Applicant — {selectedJob.jobTitle}</h2>
            <form onSubmit={handleAddApplicant}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    value={applicantForm.name}
                    onChange={e => setApplicantForm({ ...applicantForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={applicantForm.email}
                    onChange={e => setApplicantForm({ ...applicantForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  value={applicantForm.phone}
                  onChange={e => setApplicantForm({ ...applicantForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={applicantForm.notes}
                  onChange={e => setApplicantForm({ ...applicantForm, notes: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button" className="btn"
                  onClick={() => setShowApplicantModal(false)}
                  style={{ background: '#edf2f7' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Applicant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Recruitment
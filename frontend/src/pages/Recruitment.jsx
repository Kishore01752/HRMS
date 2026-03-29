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
      setJobs(res.data || [])
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchJobs() }, [])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try {
      await API.post('/recruitment', jobForm)
      setShowJobModal(false)
      fetchJobs()
    } catch {
      alert('Error creating job')
    }
  }

  const handleAddApplicant = async (e) => {
    e.preventDefault()
    try {
      await API.post(`/recruitment/${selectedJob._id}/applicants`, applicantForm)
      setShowApplicantModal(false)
      fetchJobs()
    } catch {
      alert('Error adding applicant')
    }
  }

  const handleStatusChange = async (jobId, applicantId, status) => {
    try {
      await API.put(`/recruitment/${jobId}/applicants/${applicantId}`, { status })
      fetchJobs()
    } catch {
      alert('Error updating status')
    }
  }

  // ✅ FIXED OFFER LETTER DOWNLOAD
  const handleDownloadOfferLetter = async (jobId, applicantId, applicantName) => {
    try {
      const token = localStorage.getItem('hrms_token')

      const joiningDate =
        prompt('Enter joining date (e.g. 01 April 2024):') || 'To be confirmed'

      const salary =
        prompt('Enter CTC/Salary (e.g. 5,00,000 per annum):') || 'As discussed'

      const res = await fetch(
        `https://hrms-3-ks6x.onrender.com/api/recruitment/${jobId}/applicants/${applicantId}/offerletter?joiningDate=${encodeURIComponent(joiningDate)}&salary=${encodeURIComponent(salary)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!res.ok) throw new Error('Failed to generate offer letter')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `offer-letter-${applicantName.replace(/ /g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('Error generating offer letter')
    }
  }

  if (loading) return <p>Loading recruitment...</p>

  return (
    <div>
      <h1>Recruitment</h1>

      {jobs.map(job => (
        <div key={job._id}>
          <h3>{job.jobTitle}</h3>

          {job.applicants?.map(a => (
            <div key={a._id}>
              <p>{a.name}</p>

              {(a.status === 'offered' || a.status === 'hired') && (
                <button
                  onClick={() =>
                    handleDownloadOfferLetter(job._id, a._id, a.name)
                  }
                >
                  Offer Letter
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Recruitment
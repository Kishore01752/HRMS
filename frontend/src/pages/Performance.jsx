import { useEffect, useState, useMemo } from 'react'
import API from '../api'
import { useAuth } from '../context/AuthContext'

const Performance = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    employeeId: '',
    reviewPeriod: '',
    reviewType: 'quarterly',
    goals: [{ title: '', description: '', target: '', progress: 0, status: 'pending' }]
  })

  const [selfModal, setSelfModal] = useState(null)
  const [selfForm, setSelfForm] = useState({ strengths: '', improvements: '', comments: '', rating: 3 })

  const [mgrModal, setMgrModal] = useState(null)
  const [mgrForm, setMgrForm] = useState({ comments: '', rating: 3 })

  const [peerModal, setPeerModal] = useState(null)
  const [peerForm, setPeerForm] = useState({ reviewerName: '', relationship: 'peer', rating: 3, comments: '' })

  const [goalEdit, setGoalEdit] = useState({ reviewId: '', goalIndex: 0, progress: 0, status: 'in-progress' })

  const myEmployee = useMemo(() => {
    if (!user || !employees.length) return null
    return employees.find((e) => String(e.userId) === String(user.id)) || null
  }, [user, employees])

  const loadReviews = async () => {
    try {
      if (user?.role === 'admin') {
        const res = await API.get('/performance/all')
        setReviews(res.data || [])
        return
      }

      const merged = []
      const emps = await API.get('/employees')
      setEmployees(emps.data || [])
      const mine = emps.data?.find((e) => String(e.userId) === String(user?.id))

      if (mine?._id) {
        const r = await API.get(`/performance/${mine._id}`)
        merged.push(...(r.data || []))
      }
      try {
        const team = await API.get('/performance/team/reviews')
        merged.push(...(team.data || []))
      } catch {
        /* not a manager */
      }

      const map = new Map()
      merged.forEach((rev) => map.set(rev._id, rev))
      setReviews(
        [...map.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      )
    } catch (err) {
      console.log(err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    setLoading(true)
    if (user.role === 'admin') {
      API.get('/employees').then((r) => setEmployees(r.data || [])).catch(console.log)
    }
    loadReviews()
  }, [user])

  const isSubject = (r) =>
    myEmployee && String(r.employeeId?._id || r.employeeId) === String(myEmployee._id)

  const isManagerOfReview = (r) => {
    if (!myEmployee || !r.employeeId) return false
    const rep = r.employeeId.reportingTo
    const repId = rep?._id || rep
    return repId && String(repId) === String(myEmployee._id)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const goals = form.goals.filter((g) => g.title.trim())
      await API.post('/performance', {
        employeeId: form.employeeId,
        reviewPeriod: form.reviewPeriod,
        reviewType: form.reviewType,
        goals: goals.length
          ? goals
          : [{ title: 'General goals', description: '', target: '', progress: 0, status: 'pending' }],
        status: 'draft'
      })
      setShowModal(false)
      setForm({
        employeeId: '',
        reviewPeriod: '',
        reviewType: 'quarterly',
        goals: [{ title: '', description: '', target: '', progress: 0, status: 'pending' }]
      })
      loadReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create review')
    }
  }

  const submitSelf = async (e) => {
    e.preventDefault()
    if (!selfModal) return
    try {
      await API.put(`/performance/${selfModal._id}/self`, {
        selfAssessment: selfForm
      })
      setSelfModal(null)
      loadReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit')
    }
  }

  const submitManager = async (e) => {
    e.preventDefault()
    if (!mgrModal) return
    try {
      await API.put(`/performance/${mgrModal._id}/manager`, {
        managerReview: mgrForm,
        overallRating: mgrForm.rating
      })
      setMgrModal(null)
      loadReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit')
    }
  }

  const submitPeer = async (e) => {
    e.preventDefault()
    if (!peerModal) return
    try {
      await API.post(`/performance/${peerModal._id}/peer`, peerForm)
      setPeerModal(null)
      setPeerForm({ reviewerName: '', relationship: 'peer', rating: 3, comments: '' })
      loadReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add peer feedback')
    }
  }

  const saveGoal = async () => {
    try {
      await API.put(`/performance/${goalEdit.reviewId}/goal`, {
        goalIndex: goalEdit.goalIndex,
        progress: Number(goalEdit.progress),
        status: goalEdit.status
      })
      setGoalEdit({ reviewId: '', goalIndex: 0, progress: 0, status: 'in-progress' })
      loadReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update goal')
    }
  }

  const openSelf = (r) => {
    setSelfForm({
      strengths: r.selfAssessment?.strengths || '',
      improvements: r.selfAssessment?.improvements || '',
      comments: r.selfAssessment?.comments || '',
      rating: r.selfAssessment?.rating || 3
    })
    setSelfModal(r)
  }

  const openMgr = (r) => {
    setMgrForm({
      comments: r.managerReview?.comments || '',
      rating: r.managerReview?.rating || 3
    })
    setMgrModal(r)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <p style={{ color: '#718096' }}>Loading performance…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Performance</h1>
          <p>Goals, OKRs, self-assessment, manager review, and 360° peer feedback</p>
        </div>
        {user?.role === 'admin' && (
          <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
            New review
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px', color: '#1a202c' }}>Workflow</h2>
        <ol style={{ margin: 0, paddingLeft: '18px', color: '#718096', fontSize: '14px', lineHeight: 1.7 }}>
          <li>Admin creates a review cycle with goals (KPIs).</li>
          <li>Employee updates goal progress, may invite peer feedback (360°), then submits self-assessment.</li>
          <li>Reporting manager completes the review and overall rating.</li>
        </ol>
      </div>

      {reviews.length === 0 ? (
        <div className="card">
          <p style={{ color: '#718096' }}>No performance reviews yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((r) => (
            <div key={r._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong>{r.reviewPeriod}</strong>
                  <span style={{ marginLeft: '10px', fontSize: '13px', color: '#718096', textTransform: 'capitalize' }}>{r.reviewType}</span>
                </div>
                <span className={`badge badge-${r.status === 'completed' ? 'green' : 'blue'}`}>{r.status}</span>
              </div>
              {r.employeeId?.name && (
                <p style={{ fontSize: '13px', color: '#718096', marginBottom: '12px' }}>
                  {r.employeeId.name} · {r.employeeId.department}
                </p>
              )}

              {r.goals?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>Goals &amp; progress</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px' }}>
                    {r.goals.map((g, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>
                        {g.title} — {g.progress ?? 0}% ({g.status})
                        {(isSubject(r) || user?.role === 'admin' || isManagerOfReview(r)) &&
                          r.status !== 'completed' && (
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '12px' }}
                            onClick={() =>
                              setGoalEdit({
                                reviewId: r._id,
                                goalIndex: i,
                                progress: g.progress ?? 0,
                                status: g.status || 'in-progress'
                              })
                            }
                          >
                            Update
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {r.peerFeedback?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#4a5568' }}>360° peer feedback</div>
                  {r.peerFeedback.map((p, i) => (
                    <div key={i} style={{ background: '#f7fafc', padding: '8px 10px', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                      <strong>{p.reviewerName}</strong> ({p.relationship}) · {p.rating}/5
                      {p.comments && <div style={{ color: '#718096', marginTop: '4px' }}>{p.comments}</div>}
                    </div>
                  ))}
                </div>
              )}

              {r.selfAssessment && (r.status === 'manager-review' || r.status === 'completed') && (
                <div style={{ marginBottom: '8px', fontSize: '13px', color: '#4a5568' }}>
                  <strong>Self-assessment</strong> (rating {r.selfAssessment.rating ?? '—'}/5)
                  {r.selfAssessment.strengths && <div style={{ marginTop: '4px' }}>Strengths: {r.selfAssessment.strengths}</div>}
                  {r.selfAssessment.improvements && <div>Improve: {r.selfAssessment.improvements}</div>}
                </div>
              )}

              {r.managerReview?.comments && (
                <div style={{ fontSize: '13px', color: '#4a5568' }}>
                  <strong>Manager review</strong> ({r.overallRating ?? r.managerReview.rating}/5): {r.managerReview.comments}
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                {isSubject(r) && r.status === 'draft' && (
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => openSelf(r)}>
                    Submit self-assessment
                  </button>
                )}
                {isSubject(r) && r.status !== 'completed' && (
                  <button type="button" className="btn btn-sm" style={{ background: '#edf2f7' }} onClick={() => setPeerModal(r)}>
                    Add peer (360°)
                  </button>
                )}
                {(user?.role === 'admin' || isManagerOfReview(r)) && r.status === 'manager-review' && (
                  <button type="button" className="btn btn-sm btn-success" onClick={() => openMgr(r)}>
                    Manager review &amp; finalize
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {goalEdit.reviewId && (
        <div className="modal-overlay" onClick={() => setGoalEdit({ reviewId: '', goalIndex: 0, progress: 0, status: 'in-progress' })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Update goal progress</h3>
            <div className="form-group">
              <label>Progress %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={goalEdit.progress}
                onChange={(e) => setGoalEdit({ ...goalEdit, progress: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={goalEdit.status} onChange={(e) => setGoalEdit({ ...goalEdit, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" onClick={() => setGoalEdit({ reviewId: '', goalIndex: 0, progress: 0, status: 'in-progress' })}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={saveGoal}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && user?.role === 'admin' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New performance review</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Employee</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Review period</label>
                <input
                  placeholder="e.g. Q1 2026"
                  value={form.reviewPeriod}
                  onChange={(e) => setForm({ ...form, reviewPeriod: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.reviewType} onChange={(e) => setForm({ ...form, reviewType: e.target.value })}>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                  <option value="probation">Probation</option>
                </select>
              </div>
              <div className="form-group">
                <label>First goal title (KPI)</label>
                <input
                  value={form.goals[0].title}
                  onChange={(e) => {
                    const goals = [...form.goals]
                    goals[0] = { ...goals[0], title: e.target.value }
                    setForm({ ...form, goals })
                  }}
                  placeholder="e.g. Increase sales by 10%"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selfModal && (
        <div className="modal-overlay" onClick={() => setSelfModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Self-assessment</h2>
            <form onSubmit={submitSelf}>
              <div className="form-group">
                <label>Strengths</label>
                <textarea rows={2} value={selfForm.strengths} onChange={(e) => setSelfForm({ ...selfForm, strengths: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Areas to improve</label>
                <textarea rows={2} value={selfForm.improvements} onChange={(e) => setSelfForm({ ...selfForm, improvements: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea rows={2} value={selfForm.comments} onChange={(e) => setSelfForm({ ...selfForm, comments: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Self-rating (1–5)</label>
                <input type="number" min="1" max="5" value={selfForm.rating} onChange={(e) => setSelfForm({ ...selfForm, rating: Number(e.target.value) })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setSelfModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit to manager</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mgrModal && (
        <div className="modal-overlay" onClick={() => setMgrModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Manager review</h2>
            <form onSubmit={submitManager}>
              <div className="form-group">
                <label>Comments</label>
                <textarea rows={4} value={mgrForm.comments} onChange={(e) => setMgrForm({ ...mgrForm, comments: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Overall rating (1–5)</label>
                <input type="number" min="1" max="5" value={mgrForm.rating} onChange={(e) => setMgrForm({ ...mgrForm, rating: Number(e.target.value) })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setMgrModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {peerModal && (
        <div className="modal-overlay" onClick={() => setPeerModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add peer feedback (360°)</h2>
            <form onSubmit={submitPeer}>
              <div className="form-group">
                <label>Reviewer name</label>
                <input value={peerForm.reviewerName} onChange={(e) => setPeerForm({ ...peerForm, reviewerName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <select value={peerForm.relationship} onChange={(e) => setPeerForm({ ...peerForm, relationship: e.target.value })}>
                  <option value="peer">Peer</option>
                  <option value="cross-functional">Cross-functional</option>
                  <option value="customer">Customer / stakeholder</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rating (1–5)</label>
                <input type="number" min="1" max="5" value={peerForm.rating} onChange={(e) => setPeerForm({ ...peerForm, rating: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Comments</label>
                <textarea rows={3} value={peerForm.comments} onChange={(e) => setPeerForm({ ...peerForm, comments: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setPeerModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Performance

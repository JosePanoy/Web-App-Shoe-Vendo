import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import "../../../assets/css/admin-side/sup-pages/user-config.css"

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, x: -70 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } },
}

function UserConfigComponent() {
  const [query, setQuery] = useState('')

  const initialUsers = [
    { id: '56595', firstName: 'Toni', lastName: 'Kroos', progress: '1 / 5', eligible: false },
    { id: '58937', firstName: 'Karim', lastName: 'Benzema', progress: '5 / 5', eligible: true },
    { id: '57632', firstName: 'Luka', lastName: 'Modric', progress: '2 / 5', eligible: false },
    { id: '50929', firstName: 'Jude', lastName: 'Bellingham', progress: '4 / 5', eligible: false },
  ]

  const [users, setUsers] = useState(initialUsers)

  // Users search and pagination
  const [userQuery, setUserQuery] = useState('')
  const [userPage, setUserPage] = useState(1)
  const userPageSize = 8

  const filteredUsers = useMemo(() => {
    if (!userQuery) return users
    const q = userQuery.toLowerCase()
    return users.filter(u => (`${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.id.includes(q)))
  }, [userQuery, users])

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / userPageSize))
  // clamp page when filtered length changes
  if (userPage > userTotalPages) setUserPage(1)
  const paginatedUsers = filteredUsers.slice((userPage - 1) * userPageSize, userPage * userPageSize)
  const goToUserPage = (p) => setUserPage(Math.min(Math.max(1, p), userTotalPages))

  // confirmation modal for removing user
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [userToRemove, setUserToRemove] = useState(null)

  const openRemoveModal = (u) => {
    setUserToRemove(u)
    setConfirmOpen(true)
  }

  // close modal on Escape key
  useEffect(() => {
    if (!confirmOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setConfirmOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmOpen])

  const confirmRemove = () => {
    if (!userToRemove) return setConfirmOpen(false)
    setUsers(prev => prev.filter(x => x.id !== userToRemove.id))
    setUserToRemove(null)
    setConfirmOpen(false)
    // reset pagination if needed
    setUserPage(1)
  }

  const logs = [
    { date: '2025-10-04', id: '56595', service: 'Standard Cleaning', status: 'Completed' },
    { date: '2025-10-03', id: '58937', service: 'Deep Cleaning', status: 'Completed' },
    { date: '2025-10-02', id: '57632', service: 'Deep Cleaning', status: 'Completed' },
    { date: '2025-10-01', id: '50929', service: 'Standard Cleaning', status: 'Failed' },
    { date: '2025-09-30', id: '59024', service: 'Standard Cleaning', status: 'Completed' },
  ]

  const filteredLogs = useMemo(() => {
    if (!query) return logs
    const q = query.toLowerCase()
    return logs.filter(l => l.date.includes(q) || l.id.includes(q) || l.service.toLowerCase().includes(q))
  }, [query])

  const formatDateFriendly = (dateStr) => {
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return dateStr
    const month = d.toLocaleString('en-US', { month: 'short' })
    const day = d.getDate()
    const year = d.getFullYear()
    let hour = d.getHours()
    const minute = d.getMinutes().toString().padStart(2, '0')
    const ampm = hour >= 12 ? 'pm' : 'am'
    hour = hour % 12 || 12
    return `${month} ${day}, ${year} - ${hour}:${minute}${ampm}`
  }

  // Pagination for logs
  const [page, setPage] = useState(1)
  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize)

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages))

  return (
    <div className='usercfg_compo__root'>
      <motion.div className='usercfg_compo__container' variants={container} initial='hidden' animate='show'>

        <motion.section className='usercfg_compo__card usercfg_compo__users' variants={item}>
          <h3 className='usercfg_compo__title'>User</h3>
          <motion.div className='usercfg_compo__search usercfg_compo__search--users' initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
            <input
              value={userQuery}
              onChange={(e) => { setUserQuery(e.target.value); setUserPage(1); }}
              placeholder='Search users by name or ID...'
            />
          </motion.div>

          <div className='usercfg_compo__table-wrap'>
            <table className='usercfg_compo__table'>
              <thead>
                <tr>
                  <th>Fullname</th>
                  <th>Student ID</th>
                  <th>Reward Progress</th>
                  <th>Eligibility</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{u.lastName}, {u.firstName}</td>
                    <td>{u.id}</td>
                    <td>{u.progress}</td>
                    <td className={u.eligible ? 'usercfg_compo__eligible--yes' : 'usercfg_compo__eligible--no'}>
                      {u.eligible ? 'Eligible' : 'Not Eligible'}
                    </td>
                    <td>
                      <button type='button' className='usercfg_compo__btn--remove' aria-label={`Remove ${u.firstName} ${u.lastName}`} onClick={() => openRemoveModal(u)}>Remove</button>
                    </td>
                  </tr>
                ))}
                <tr className='usercfg_compo__add-row'>
                  <td colSpan={5}>+ Add New ID</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className='usercfg_compo__pagination' style={{ justifyContent: 'flex-start' }}>
            <button onClick={() => goToUserPage(userPage - 1)} disabled={userPage <= 1} className='usercfg_compo__pgbtn'>Previous</button>
            <div className='usercfg_compo__pgpages'>
              {Array.from({ length: userTotalPages }).map((_, i) => (
                <button key={i} onClick={() => goToUserPage(i + 1)} className={`usercfg_compo__pgnum ${userPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
              ))}
            </div>
            <button onClick={() => goToUserPage(userPage + 1)} disabled={userPage >= userTotalPages} className='usercfg_compo__pgbtn'>Next</button>
          </div>
        </motion.section>

        {/* Logs below users for vertical layout */}
        <motion.section className='usercfg_compo__card usercfg_compo__logs' variants={item}>
          <h3 className='usercfg_compo__title'>Usage Logs</h3>
          <div className='usercfg_compo__search'>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search by date, ID or service type...'
            />
          </div>

          <div className='usercfg_compo__logs-wrap'>
            <table className='usercfg_compo__table usercfg_compo__table--logs'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student ID</th>
                  <th>Service Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((r, i) => (
                  <tr key={i}>
                    <td>{formatDateFriendly(r.date)}</td>
                    <td>{r.id}</td>
                    <td>{r.service}</td>
                    <td className={r.status === 'Completed' ? 'usercfg_compo__status--ok' : 'usercfg_compo__status--fail'}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className='usercfg_compo__pagination'>
            <button onClick={() => goTo(page - 1)} disabled={page <= 1} className='usercfg_compo__pgbtn'>Previous</button>
            <div className='usercfg_compo__pgpages'>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => goTo(i + 1)} className={`usercfg_compo__pgnum ${page === i + 1 ? 'active' : ''}`}>{i + 1}</button>
              ))}
            </div>
            <button onClick={() => goTo(page + 1)} disabled={page >= totalPages} className='usercfg_compo__pgbtn'>Next</button>
          </div>
        </motion.section>

      </motion.div>
      {confirmOpen && (
        <div className='usercfg_compo__modal-overlay' role='dialog' aria-modal='true' onClick={() => setConfirmOpen(false)}>
          <div className='usercfg_compo__modal' onClick={(e) => e.stopPropagation()}>
            <h3>Confirm removal</h3>
            <p>Remove <strong>{userToRemove?.firstName} {userToRemove?.lastName}</strong> (ID: {userToRemove?.id})? This action cannot be undone.</p>
            <div className='usercfg_compo__modal-actions'>
              <button className='usercfg_compo__modal-btn cancel' onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className='usercfg_compo__modal-btn confirm' onClick={confirmRemove}>Yes, remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserConfigComponent
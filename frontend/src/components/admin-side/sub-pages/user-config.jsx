import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { motion } from 'framer-motion';

// Realtime audit stream for usage logs
let __usercfg_es__ = null;
import '../../../assets/css/admin-side/sup-pages/user-config.css';

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '');

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, x: -70 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: 'easeOut' } }
};

const formatFullName = ({ fname = '', lname = '' } = {}) => {
  const first = fname.trim();
  const last = lname.trim();
  if (!first && !last) return 'N/A';
  if (!last) return first;
  if (!first) return last;
  return `${last}, ${first}`;
};

const buildEligibility = (athlete) => {
  const eligible = Boolean(athlete && athlete.firstLogin === false);
  return {
    label: eligible ? 'Eligible' : 'Not Eligible',
    className: eligible ? 'usercfg_compo__eligible--yes' : 'usercfg_compo__eligible--no'
  };
};

function UserConfigComponent() {
  const [athletes, setAthletes] = useState([]);
  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', message: string }

  const [userQuery, setUserQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 6;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [newAthleteDigits, setNewAthleteDigits] = useState(() => Array(6).fill(''));
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const idInputsRef = useRef([]);

  const tokenErrorMessage = 'Authentication expired. Please sign in again.';

  const athleteIdValue = useMemo(() => newAthleteDigits.join(''), [newAthleteDigits]);
  const isIdComplete = useMemo(
    () => newAthleteDigits.every((digit) => digit.length === 1),
    [newAthleteDigits]
  );
  const digitsCount = newAthleteDigits.length;

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!loadError) return undefined;
    const timer = setTimeout(() => setLoadError(''), 3500);
    return () => clearTimeout(timer);
  }, [loadError]);

  const openAddModal = useCallback(() => {
    setAddModalOpen(true);
    setAwaitingConfirm(false);
    setNewAthleteDigits(Array(6).fill(''));
    setAddError('');
  }, []);

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false);
    setAwaitingConfirm(false);
    setNewAthleteDigits(Array(6).fill(''));
    setAddError('');
    setAdding(false);
  }, []);

  const fetchAthletes = useCallback(async () => {
    setLoadingAthletes(true);
    setLoadError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error(tokenErrorMessage);

      const res = await fetch(`${API_BASE_URL}/api/athletes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to load athletes.');
      }

      setAthletes(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err.message || 'Unable to load athletes.';
      setLoadError(message);
      setFeedback({ type: 'error', message });
    } finally {
      setLoadingAthletes(false);
    }
  }, [tokenErrorMessage]);

  useEffect(() => {
    fetchAthletes();
    const id = setInterval(fetchAthletes, 15000);
    return () => clearInterval(id);
  }, [fetchAthletes]);

  useEffect(() => {
    if (!confirmOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setConfirmOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmOpen]);

  useEffect(() => {
    if (!addModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeAddModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addModalOpen, closeAddModal]);

  useEffect(() => {
    if (!addModalOpen || awaitingConfirm) return;
    const firstEmptyIndex = newAthleteDigits.findIndex((digit) => digit === '');
    const targetIndex = firstEmptyIndex === -1 ? digitsCount - 1 : firstEmptyIndex;
    const targetInput = idInputsRef.current[targetIndex];
    if (targetInput) {
      targetInput.focus();
      if (targetInput.select) targetInput.select();
    }
  }, [addModalOpen, awaitingConfirm, newAthleteDigits, digitsCount]);

  const filteredAthletes = useMemo(() => {
    if (!userQuery) return athletes;
    const q = userQuery.toLowerCase();
    return athletes.filter((athlete) => {
      const idMatch = athlete?.idNumber?.includes(userQuery.trim());
      const nameMatch = `${athlete?.fname || ''} ${athlete?.lname || ''}`
        .toLowerCase()
        .includes(q);
      return Boolean(idMatch || nameMatch);
    });
  }, [athletes, userQuery]);

  const userTotalPages = Math.max(1, Math.ceil(filteredAthletes.length / userPageSize));
  useEffect(() => {
    if (userPage > userTotalPages) {
      setUserPage(1);
    }
  }, [userPage, userTotalPages]);
  const paginatedAthletes = filteredAthletes.slice(
    (userPage - 1) * userPageSize,
    userPage * userPageSize
  );
  const goToUserPage = (p) => setUserPage(Math.min(Math.max(1, p), userTotalPages));

  const openRemoveModal = (athlete) => {
    setUserToRemove(athlete);
    setConfirmOpen(true);
  };

  const handleDigitChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    setNewAthleteDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < digitsCount - 1) {
      idInputsRef.current[index + 1]?.focus();
    }
    if (addError) setAddError('');
  };

  const handleDigitKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !newAthleteDigits[index] && index > 0) {
      event.preventDefault();
      idInputsRef.current[index - 1]?.focus();
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      idInputsRef.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowRight' && index < digitsCount - 1) {
      event.preventDefault();
      idInputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (event) => {
    const pasted = event.clipboardData.getData('text');
    if (!pasted) return;
    event.preventDefault();
    const digits = pasted.replace(/\D/g, '').slice(0, digitsCount).split('');
    if (!digits.length) return;
    setNewAthleteDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < next.length; i += 1) {
        next[i] = digits[i] || '';
      }
      return next;
    });
    const nextIndex = Math.min(digits.length, digitsCount) - 1;
    if (nextIndex >= 0) {
      idInputsRef.current[nextIndex]?.focus();
    }
    if (addError) setAddError('');
  };

  const startAddConfirmation = (event) => {
    event.preventDefault();
    const trimmed = athleteIdValue.trim();

    if (trimmed.length !== digitsCount || !/^\d{6}$/.test(trimmed)) {
      setAddError('ID number must be exactly 6 digits.');
      return;
    }

    const duplicate = athletes.some((athlete) => athlete.idNumber === trimmed);
    if (duplicate) {
      setAddError('Athlete is already registered.');
      return;
    }

    setAwaitingConfirm(true);
  };

  const confirmAddAthlete = async () => {
    setAdding(true);
    setAddError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error(tokenErrorMessage);

      const res = await fetch(`${API_BASE_URL}/api/athletes/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ idNumber: athleteIdValue })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to register athlete.');
      }

      if (data?.athlete) {
        setAthletes((prev) => [data.athlete, ...prev]);
      } else {
        fetchAthletes();
      }

      setFeedback({
        type: 'success',
        message: `Athlete ${athleteIdValue} registered successfully. Athlete must set a pincode on first login.`
      });
      setUserPage(1);
      closeAddModal();
    } catch (err) {
      setAddError(err.message || 'Unable to register athlete.');
    } finally {
      setAdding(false);
    }
  };

  const confirmRemove = async () => {
    if (!userToRemove) {
      setConfirmOpen(false);
      return;
    }

    setRemoving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error(tokenErrorMessage);

      const res = await fetch(
        `${API_BASE_URL}/api/athletes/${encodeURIComponent(userToRemove.idNumber)}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to remove athlete.');
      }

      setAthletes((prev) =>
        prev.filter((athlete) => athlete.idNumber !== userToRemove.idNumber)
      );
      setFeedback({
        type: 'success',
        message: `Athlete ${userToRemove.idNumber} removed from the roster.`
      });
      setUserPage(1);
      setConfirmOpen(false);
      setUserToRemove(null);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Unable to remove athlete.' });
    } finally {
      setRemoving(false);
    }
  };

  const [auditLogs, setAuditLogs] = useState([]); // realtime machine usage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !API_BASE_URL) return undefined;
    try {
      __usercfg_es__ = new EventSource(`${API_BASE_URL}/api/admin/audit/stream?token=${encodeURIComponent(token)}`);
      __usercfg_es__.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          // Keep only machine-related entries
          const a = (payload.action || '').toUpperCase();
          if (a.includes('CLEAN') || a.includes('COIN') || payload.recipe || payload.amount) {
            setAuditLogs((prev) => [payload, ...prev].slice(0, 200));
          }
        } catch {}
      };
    } catch {}
    return () => { try { __usercfg_es__?.close(); } catch {} };
  }, []);

  const [query, setQuery] = useState('');
  const formatDateAudit = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    let hour = d.getHours();
    const minute = d.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${month} ${day}, ${year} at ${hour}:${minute} ${ampm}`;
  };

  const logs = useMemo(() => {
    return (auditLogs || []).map((it) => {
      const service = it.recipe ? (it.recipe === 'deep' ? 'Deep Cleaning' : 'Standard Cleaning') : '—';
      let status = '—';
      const a = (it.action || '').toUpperCase();
      if (a.includes('DONE')) status = 'Completed';
      else if (a.includes('START')) status = 'Started';
      else if (a.includes('COIN')) status = 'Coin';
      return {
        date: it.createdAt,
        id: it.actorName || it.actorId || '—',
        service,
        status
      };
    });
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    if (!query) return logs;
    const q = query.toLowerCase();
    return logs.filter(
      (l) => (l.date || '').toString().toLowerCase().includes(q) || (l.id || '').toString().toLowerCase().includes(q) || (l.service || '').toLowerCase().includes(q)
    );
  }, [logs, query]);

  const formatDateFriendly = formatDateAudit;

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize);
  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className='usercfg_compo__root'>
      <motion.div
        className='usercfg_compo__container'
        variants={container}
        initial='hidden'
        animate='show'
      >
        <motion.section className='usercfg_compo__card usercfg_compo__users' variants={item}>
          <h3 className='usercfg_compo__title'>User</h3>

          {feedback && (
            <div className={`usercfg_compo__alert ${feedback.type}`}>
              <span>{feedback.message}</span>
              <button
                type='button'
                aria-label='Dismiss message'
                onClick={() => setFeedback(null)}
              >
                ×
              </button>
            </div>
          )}

          {loadError && !feedback && (
            <div className='usercfg_compo__alert error'>
              <span>{loadError}</span>
              <button
                type='button'
                aria-label='Dismiss error'
                onClick={() => setLoadError('')}
              >
                ×
              </button>
            </div>
          )}

          <motion.div
            className='usercfg_compo__search usercfg_compo__search--users'
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <input
              value={userQuery}
              onChange={(e) => {
                setUserQuery(e.target.value);
                setUserPage(1);
              }}
              placeholder='Search users by name or ID...'
              aria-label='Search athletes by name or ID'
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
                {loadingAthletes ? (
                  <tr className='usercfg_compo__loading-row'>
                    <td colSpan={5}>Loading athletes...</td>
                  </tr>
                ) : paginatedAthletes.length ? (
                  paginatedAthletes.map((athlete) => {
                    const { label, className } = buildEligibility(athlete);
                    return (
                      <tr key={athlete.idNumber}>
                        <td>{formatFullName(athlete)}</td>
                        <td>{athlete.idNumber}</td>
                        <td>{athlete.rewardProgress || 'N/A'}</td>
                        <td className={className}>{label}</td>
                        <td>
                          <button
                            type='button'
                            className='usercfg_compo__btn--remove'
                            aria-label={`Remove ${formatFullName(athlete)} (${athlete.idNumber})`}
                            onClick={() => openRemoveModal(athlete)}
                            disabled={removing && userToRemove?.idNumber === athlete.idNumber}
                          >
                            {removing && userToRemove?.idNumber === athlete.idNumber
                              ? 'Removing...'
                              : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className='usercfg_compo__empty'>
                    <td colSpan={5}>
                      {athletes.length
                        ? 'No athletes match your search.'
                        : 'No athletes registered yet.'}
                    </td>
                  </tr>
                )}
                <tr className='usercfg_compo__add-row'>
                  <td colSpan={5}>
                    <button
                      type='button'
                      className='usercfg_compo__btn--add'
                      onClick={openAddModal}
                    >
                      + Add Athlete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className='usercfg_compo__pagination' style={{ justifyContent: 'flex-start' }}>
            <button
              onClick={() => goToUserPage(userPage - 1)}
              disabled={userPage <= 1}
              className='usercfg_compo__pgbtn'
            >
              Previous
            </button>
            <div className='usercfg_compo__pgpages'>
              {Array.from({ length: userTotalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToUserPage(i + 1)}
                  className={`usercfg_compo__pgnum ${userPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => goToUserPage(userPage + 1)}
              disabled={userPage >= userTotalPages}
              className='usercfg_compo__pgbtn'
            >
              Next
            </button>
          </div>
        </motion.section>

        <motion.section className='usercfg_compo__card usercfg_compo__logs' variants={item}>
          <h3 className='usercfg_compo__title'>Usage Logs</h3>
          <div className='usercfg_compo__search'>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by date, ID or service type...'
              aria-label='Search logs by date, ID or service'
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
                {paginatedLogs.length ? paginatedLogs.map((log, index) => (
                  <tr key={`${log.id}-${index}`}>
                    <td>{formatDateFriendly(log.date)}</td>
                    <td>{log.id}</td>
                    <td>{log.service}</td>
                    <td
                      className={
                        log.status === 'Completed'
                          ? 'usercfg_compo__status--ok'
                          : 'usercfg_compo__status--fail'
                      }
                    >
                      {log.status}
                    </td>
                  </tr>
                )) : (
                  <tr className='usercfg_compo__empty'><td colSpan={4}>No usage logs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className='usercfg_compo__pagination'>
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
              className='usercfg_compo__pgbtn'
            >
              Previous
            </button>
            <div className='usercfg_compo__pgpages'>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i + 1)}
                  className={`usercfg_compo__pgnum ${page === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages}
              className='usercfg_compo__pgbtn'
            >
              Next
            </button>
          </div>
        </motion.section>
      </motion.div>

      {confirmOpen && (
        <div
          className='usercfg_compo__modal-overlay'
          role='dialog'
          aria-modal='true'
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className='usercfg_compo__modal'
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirm removal</h3>
            <p>
              Remove{' '}
              <strong>
                {formatFullName(userToRemove)} (ID: {userToRemove?.idNumber})
              </strong>
              ? This action cannot be undone.
            </p>
            <div className='usercfg_compo__modal-actions'>
              <button
                className='usercfg_compo__modal-btn cancel'
                onClick={() => setConfirmOpen(false)}
                disabled={removing}
              >
                Cancel
              </button>
              <button
                className='usercfg_compo__modal-btn confirm'
                onClick={confirmRemove}
                disabled={removing}
              >
                {removing ? 'Removing...' : 'Yes, remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div
          className='usercfg_compo__modal-overlay'
          role='dialog'
          aria-modal='true'
          onClick={closeAddModal}
        >
          <div
            className='usercfg_compo__modal usercfg_compo__modal--add'
            onClick={(e) => e.stopPropagation()}
          >
            {awaitingConfirm ? (
              <>
                <h3>Confirm registration</h3>
                <p>
                  Register athlete with ID <strong>{athleteIdValue}</strong>? They will create their
                  own 6-digit pincode when they first log in.
                </p>
                {addError && <p className='usercfg_compo__modal-error'>{addError}</p>}
                <div className='usercfg_compo__modal-actions'>
                  <button
                    className='usercfg_compo__modal-btn cancel'
                    onClick={() => setAwaitingConfirm(false)}
                    disabled={adding}
                  >
                    Back
                  </button>
                  <button
                    className='usercfg_compo__modal-btn primary'
                    onClick={confirmAddAthlete}
                    disabled={adding}
                  >
                    {adding ? 'Registering...' : 'Confirm'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Add new athlete</h3>
                <form className='usercfg_compo__modal-form' onSubmit={startAddConfirmation}>
                  <label className='usercfg_compo__modal-label'>Athlete ID Number</label>
                  <div className='usercfg_compo__id-inputs'>
                    {newAthleteDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type='text'
                        inputMode='numeric'
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        onPaste={handleDigitPaste}
                        ref={(el) => {
                          idInputsRef.current[idx] = el;
                        }}
                        className='usercfg_compo__id-input'
                        aria-label={`Athlete ID digit ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <small className='usercfg_compo__modal-hint'>
                    Only digits are allowed. Double-check before continuing.
                  </small>
                  {addError && <p className='usercfg_compo__modal-error'>{addError}</p>}
                  <div className='usercfg_compo__modal-actions'>
                    <button
                      type='button'
                      className='usercfg_compo__modal-btn cancel'
                      onClick={closeAddModal}
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='usercfg_compo__modal-btn primary'
                      disabled={!isIdComplete}
                    >
                      Next
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserConfigComponent;





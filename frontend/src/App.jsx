import { useState, useEffect } from 'react';

const STATES = [
  "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Karnataka",
  "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "West Bengal"
];

const CATEGORIES = [
  "Harassment", "Threats", "Violence", "Stalking / Being Followed",
  "False Accusation", "Language Barrier / Communication Difficulty", "Other"
];

const VALID_STATUSES = [
  "Submitted", "Received", "Under Review", "Forwarded to Authority",
  "Authority Contacted", "Action in Progress", "Resolved", "Closed"
];

const API = "http://localhost:5000";

function FlagBackground() {
  return (
    <div className="flag-bg">
      <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="900" height="200" fill="#FF9933" />
        <rect x="0" y="200" width="900" height="200" fill="#FFFFFF" />
        <rect x="0" y="400" width="900" height="200" fill="#138808" />
        <circle cx="450" cy="300" r="80" fill="none" stroke="#000080" strokeWidth="3" />
        <circle cx="450" cy="300" r="6" fill="#000080" />
      </svg>
    </div>
  );
}

function Letterhead({ officerMode }) {
  return (
    <>
      <div className="letterhead">
        <div className="emblem">CS</div>
        <div className="letterhead-text">
          <h1>Citizen Support &amp; Emergency Liaison Platform{officerMode && <span className="officer-badge">OFFICER PORTAL</span>}</h1>
          <p>Independent prototype &mdash; not officially affiliated with any government department</p>
        </div>
      </div>
      <div className="disclaimer-strip">
        In an emergency, contact local emergency services directly. This platform is a non-emergency follow-up channel.
      </div>
    </>
  );
}

function AuthPage({ onLogin, onOfficerLogin }) {
  const [portal, setPortal] = useState('citizen');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', home_state: '', department: '', jurisdiction_state: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const isOfficer = portal === 'officer';
    const base = isOfficer ? '/api/officer' : '/api/auth';
    const endpoint = mode === 'login' ? `${base}/login` : `${base}/register`;

    let body;
    if (mode === 'login') {
      body = { email: form.email, password: form.password };
    } else if (isOfficer) {
      body = { name: form.name, email: form.email, password: form.password, department: form.department, jurisdiction_state: form.jurisdiction_state };
    } else {
      body = { name: form.name, email: form.email, password: form.password, home_state: form.home_state };
    }

    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong.' });
      } else {
        setMessage({ type: 'success', text: data.message });
        if (mode === 'login' && data.token) {
          if (isOfficer) {
            localStorage.setItem('officerToken', data.token);
            localStorage.setItem('officer', JSON.stringify(data.officer));
            onOfficerLogin(data.token, data.officer);
          } else {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(data.token, data.user);
          }
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not reach the server. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  }

  const isOfficer = portal === 'officer';

  return (
    <>
      <FlagBackground />
      <Letterhead officerMode={isOfficer} />
      <div className="page-wrap">
        <div className="auth-card">
          <div className="tabs">
            <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setMessage(null); }}>Sign In</button>
            <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setMessage(null); }}>Register</button>
          </div>
          <form className="form-body" onSubmit={handleSubmit}>
            <h2>{isOfficer ? (mode === 'login' ? 'Officer sign in' : 'Register as an officer') : (mode === 'login' ? 'Sign in to your account' : 'Create a new account')}</h2>
            <p className="subtitle">
              {isOfficer
                ? 'For verified government officers only. New accounts require manual verification before dashboard access.'
                : (mode === 'login' ? 'Access your complaint history and status updates.' : 'Register to report an issue and connect with your home-state authorities.')}
            </p>

            {mode === 'register' && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>

            {mode === 'register' && !isOfficer && (
              <div className="field">
                <label htmlFor="home_state">Home state</label>
                <select id="home_state" name="home_state" value={form.home_state} onChange={handleChange} required>
                  <option value="">Select your home state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {mode === 'register' && isOfficer && (
              <>
                <div className="field">
                  <label htmlFor="department">Department</label>
                  <input id="department" name="department" type="text" placeholder="e.g. AP Nodal Office" value={form.department} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="jurisdiction_state">Jurisdiction state</label>
                  <select id="jurisdiction_state" name="jurisdiction_state" value={form.jurisdiction_state} onChange={handleChange} required>
                    <option value="">Select jurisdiction state</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            {message && <div className={`message ${message.type}`}>{message.text}</div>}
          </form>

          <div className="portal-switch" style={{ paddingBottom: '20px' }}>
            {isOfficer
              ? <>Not an officer? <button onClick={() => { setPortal('citizen'); setMessage(null); }}>Go to citizen portal</button></>
              : <>Are you a government officer? <button onClick={() => { setPortal('officer'); setMessage(null); }}>Officer sign in</button></>}
          </div>
        </div>
      </div>
      <p className="emergency-note">
        This is a prototype demonstration. No data submitted here is monitored by real authorities at this stage.
      </p>
    </>
  );
}

function ComplaintForm({ token, onSubmitted }) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [danger, setDanger] = useState(false);
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  function handleLocationInput(value) {
    setLocation(value);
    setLocationMessage(null);
    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (window.__locTimer) clearTimeout(window.__locTimer);
    window.__locTimer = setTimeout(async () => {
      try {
        const url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=" + encodeURIComponent(value);
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 400);
  }

  function selectSuggestion(place) {
    setLocation(place.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage({ type: 'error', text: 'Location access is not supported by this browser.' });
      return;
    }
    setLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon;
          const res = await fetch(url);
          const data = await res.json();
          const address = data.display_name || (lat.toFixed(5) + ", " + lon.toFixed(5));
          setLocation(address);
          setLocationMessage({ type: 'success', text: 'Current location added.' });
        } catch (err) {
          setLocation(lat.toFixed(5) + ", " + lon.toFixed(5));
          setLocationMessage({ type: 'success', text: 'Coordinates added (address lookup unavailable).' });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocationMessage({ type: 'error', text: 'Could not access location. Please allow location permission or enter it manually.' });
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, description, incident_location: location, danger_flag: danger, contact_phone: phone })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong.' });
        setLoading(false);
        return;
      }

      const complaintId = data.complaint.id;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await fetch(`${API}/api/evidence/${complaintId}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      }

      setMessage({ type: 'success', text: 'Complaint submitted successfully.' });
      setCategory(''); setDescription(''); setLocation(''); setDanger(false); setPhone(''); setFile(null);
      onSubmitted();
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Report an issue</h3>
        <p>Describe what happened. You can attach a photo, video, or document as evidence.</p>
      </div>
      <form className="panel-body" onSubmit={handleSubmit}>
        <div className="danger-check">
          <input type="checkbox" id="danger" checked={danger} onChange={e => setDanger(e.target.checked)} />
          <label htmlFor="danger">I am currently in immediate danger</label>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="location">Incident location</label>
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                id="location"
                type="text"
                placeholder="Start typing a place..."
                value={location}
                onChange={e => handleLocationInput(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
                style={{ width: '100%' }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '5px', marginTop: '4px', boxShadow: '0 4px 16px rgba(20,41,61,0.12)', zIndex: 10, maxHeight: '220px', overflowY: 'auto' }}>
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      onMouseDown={() => selectSuggestion(s)}
                      style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f4f6f8'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {s.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              style={{ whiteSpace: 'nowrap', padding: '0 14px', border: '1px solid var(--border)', borderRadius: '5px', background: 'var(--white)', color: 'var(--green-dark)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              {locating ? 'Locating...' : 'Use current location'}
            </button>
          </div>
          {locationMessage && <div className={`message ${locationMessage.type}`} style={{ marginTop: '8px' }}>{locationMessage.text}</div>}
        </div>

        <div className="field">
          <label htmlFor="phone">Contact phone number</label>
          <input id="phone" type="tel" placeholder="e.g. +91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" placeholder="Describe what happened, when, and who is involved." value={description} onChange={e => setDescription(e.target.value)} required />
        </div>

        <div className="field">
          <label>Evidence (optional)</label>
          <label className="file-input-wrap">
            <input type="file" accept="image/*,video/*,application/pdf" onChange={e => setFile(e.target.files[0])} />
            {file ? 'Change file' : 'Click to attach photo, video, or PDF (max 50MB)'}
          </label>
          {file && <div className="file-name">Attached: {file.name}</div>}
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit complaint'}
        </button>

        {message && <div className={`message ${message.type}`}>{message.text}</div>}
      </form>
    </div>
  );
}

function ComplaintList({ token, refreshKey }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchComplaints() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/complaints`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchComplaints(); }, [refreshKey]);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Your complaints</h3>
        <p>Track the status of everything you've reported.</p>
      </div>
      <div className="panel-body">
        <div className="complaint-list">
          {loading && <div className="empty-state">Loading...</div>}
          {!loading && complaints.length === 0 && <div className="empty-state">No complaints submitted yet.</div>}
          {complaints.map(c => (
            <div key={c.id} className={`complaint-card ${c.danger_flag ? 'danger' : ''}`}>
              <div className="complaint-top">
                <span className="complaint-category">{c.category}</span>
                <span className={`status-badge status-${c.status.replace(/ /g, '-')}`}>{c.status}</span>
              </div>
              <div className="complaint-desc">{c.description}</div>
              <div className="complaint-meta">
                {c.incident_location && `${c.incident_location} · `}
                {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Welcome, {user?.name || 'Citizen'}</div>
        <button className="logout-btn" onClick={onLogout}>Sign out</button>
      </div>
      <div className="disclaimer-strip">
        In an emergency, contact local emergency services directly. This platform is a non-emergency follow-up channel.
      </div>
      <div className="dashboard-wrap">
        <div className="dashboard-grid">
          <ComplaintForm token={token} onSubmitted={() => setRefreshKey(k => k + 1)} />
          <ComplaintList token={token} refreshKey={refreshKey} />
        </div>
      </div>
    </>
  );
}

function OfficerComplaintCard({ complaint, token, onUpdated }) {
  const [status, setStatus] = useState(complaint.status);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleUpdate() {
    setUpdating(true);
    setMsg(null);
    try {
      const res = await fetch(`${API}/api/officer/dashboard/complaints/${complaint.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error });
      } else {
        setMsg({ type: 'success', text: 'Status updated.' });
        onUpdated();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={`complaint-card ${complaint.danger_flag ? 'danger' : ''}`}>
      <div className="complaint-top">
        <span className="complaint-category">{complaint.category}</span>
        <span className={`status-badge status-${complaint.status.replace(/ /g, '-')}`}>{complaint.status}</span>
      </div>
      <div className="complaint-desc">{complaint.description}</div>
      <div className="complaint-meta">
        {complaint.incident_location && `${complaint.incident_location} · `}
        {new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
      <div className="citizen-info">
        Reported by: {complaint.citizen_name} ({complaint.citizen_email}) &middot; Home state: {complaint.home_state}
      </div>
      <div className="status-update-row">
        <select className="status-select" value={status} onChange={e => setStatus(e.target.value)}>
          {VALID_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="status-update-btn" onClick={handleUpdate} disabled={updating || status === complaint.status}>
          {updating ? 'Updating...' : 'Update status'}
        </button>
      </div>
      {msg && <div className={`message ${msg.type}`} style={{ marginTop: '8px' }}>{msg.text}</div>}
    </div>
  );
}

function OfficerDashboard({ token, officer, onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  async function fetchComplaints() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/officer/dashboard/complaints`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchComplaints(); }, [refreshKey]);

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          {officer?.name || 'Officer'}
          <span className="officer-badge">OFFICER</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>Sign out</button>
      </div>
      <div className="disclaimer-strip">
        {officer?.department} &middot; Jurisdiction: {officer?.jurisdiction_state}
      </div>
      <div className="dashboard-wrap">
        <div className="panel">
          <div className="panel-header">
            <h3>Complaints in your jurisdiction</h3>
            <p>Showing complaints from citizens whose home state is {officer?.jurisdiction_state}. Danger flags are shown first.</p>
          </div>
          <div className="panel-body">
            <div className="complaint-list">
              {loading && <div className="empty-state">Loading...</div>}
              {!loading && complaints.length === 0 && <div className="empty-state">No complaints in your jurisdiction yet.</div>}
              {complaints.map(c => (
                <OfficerComplaintCard key={c.id} complaint={c} token={token} onUpdated={() => setRefreshKey(k => k + 1)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [officerToken, setOfficerToken] = useState(localStorage.getItem('officerToken'));
  const [officer, setOfficer] = useState(() => {
    const stored = localStorage.getItem('officer');
    return stored ? JSON.parse(stored) : null;
  });

  function handleLogin(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
  }

  function handleOfficerLogin(newToken, newOfficer) {
    setOfficerToken(newToken);
    setOfficer(newOfficer);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  function handleOfficerLogout() {
    localStorage.removeItem('officerToken');
    localStorage.removeItem('officer');
    setOfficerToken(null);
    setOfficer(null);
  }

  if (officerToken) {
    return <OfficerDashboard token={officerToken} officer={officer} onLogout={handleOfficerLogout} />;
  }

  if (token) {
    return <Dashboard token={token} user={user} onLogout={handleLogout} />;
  }

  return <AuthPage onLogin={handleLogin} onOfficerLogin={handleOfficerLogin} />;
}


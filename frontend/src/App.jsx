import { useState } from 'react';

const STATES = [
  "Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Karnataka",
  "Kerala", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "West Bengal"
];

export default function App() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '', email: '', password: '', home_state: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
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
          localStorage.setItem('token', data.token);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Could not reach the server. Is the backend running?' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="letterhead">
        <div className="emblem">CS</div>
        <div className="letterhead-text">
          <h1>Citizen Support &amp; Emergency Liaison Platform</h1>
          <p>Independent prototype &mdash; not officially affiliated with any government department</p>
        </div>
      </div>
      <div className="disclaimer-strip">
        In an emergency, contact local emergency services directly. This platform is a non-emergency follow-up channel.
      </div>

      <div className="page-wrap">
        <div className="auth-card">
          <div className="tabs">
            <button
              className={`tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setMessage(null); }}
            >
              Sign In
            </button>
            <button
              className={`tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setMessage(null); }}
            >
              Register
            </button>
          </div>

          <form className="form-body" onSubmit={handleSubmit}>
            <h2>{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</h2>
            <p className="subtitle">
              {mode === 'login'
                ? 'Access your complaint history and status updates.'
                : 'Register to report an issue and connect with your home-state authorities.'}
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

            {mode === 'register' && (
              <div className="field">
                <label htmlFor="home_state">Home state</label>
                <select id="home_state" name="home_state" value={form.home_state} onChange={handleChange} required>
                  <option value="">Select your home state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            {message && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}
          </form>
        </div>
      </div>

      <p className="emergency-note">
        This is a prototype demonstration. No data submitted here is monitored by real authorities at this stage.
      </p>
    </>
  );
}

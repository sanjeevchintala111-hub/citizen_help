import { useState, useEffect } from 'react';

const CATEGORIES = [
  "Harassment", "Threats", "Violence", "Stalking / Being Followed",
  "False Accusation", "Language Barrier / Communication Difficulty", "Other"
];

const VALID_STATUSES = [
  "Submitted", "Received", "Under Review", "Forwarded to Authority",
  "Authority Contacted", "Action in Progress", "Resolved", "Closed"
];

const EMERGENCY_CONTACTS_INDIA = [
  { name: "National Emergency Number (India)", number: "112", desc: "Police, fire, ambulance - single number for all emergencies across India.", primary: true },
  { name: "Police", number: "100", desc: "Direct police helpline." },
  { name: "Women Helpline (Domestic Abuse)", number: "181", desc: "24x7 support for women affected by violence." },
  { name: "Women in Distress", number: "1091", desc: "Police helpline specifically for women in distress." },
  { name: "Child Helpline", number: "1098", desc: "24x7 emergency support for children." },
  { name: "Cyber Crime Helpline", number: "1930", desc: "Report online fraud or cybercrime immediately." }
];

const EMERGENCY_CONTACTS_INTERNATIONAL = [
  { name: "USA / Canada", number: "911", desc: "Police, fire, ambulance." },
  { name: "UK", number: "999", desc: "Police, fire, ambulance. (112 also works.)" },
  { name: "European Union (all member states)", number: "112", desc: "Single emergency number across the EU." },
  { name: "Australia", number: "000", desc: "Police, fire, ambulance." },
  { name: "UAE", number: "999", desc: "Police. (998 ambulance, 997 fire.)" },
  { name: "Common international fallback", number: "112", desc: "Works on most mobile networks worldwide, even without a local SIM, and routes to local emergency services." }
];

const API = "http://localhost:5000";

function PlaceAutocomplete(props) {
  const id = props.id;
  const value = props.value;
  const onChange = props.onChange;
  const placeholder = props.placeholder;
  const required = props.required;

  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);

  function handleInput(v) {
    onChange(v);
    if (v.trim().length < 2) {
      setSuggestions([]);
      setShow(false);
      return;
    }
    if (window.__placeTimer) clearTimeout(window.__placeTimer);
    window.__placeTimer = setTimeout(function () {
      var url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=" + encodeURIComponent(v);
      fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          setSuggestions(data);
          setShow(true);
        })
        .catch(function () { setSuggestions([]); });
    }, 400);
  }

  function select(place) {
    var a = place.address || {};
    var label = a.state ? (a.state + (a.country ? ", " + a.country : "")) : place.display_name;
    onChange(label);
    setSuggestions([]);
    setShow(false);
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type="text"
        placeholder={placeholder || "Start typing a state, region, or country..."}
        value={value}
        onChange={function (e) { handleInput(e.target.value); }}
        onFocus={function () { if (suggestions.length > 0) setShow(true); }}
        onBlur={function () { setTimeout(function () { setShow(false); }, 150); }}
        autoComplete="off"
        required={required}
        style={{ width: '100%' }}
      />
      {show && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '5px', marginTop: '4px', boxShadow: '0 4px 16px rgba(20,41,61,0.12)', zIndex: 10, maxHeight: '220px', overflowY: 'auto' }}>
          {suggestions.map(function (s, i) {
            return (
              <div
                key={i}
                onMouseDown={function () { select(s); }}
                style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={function (e) { e.currentTarget.style.background = '#f4f6f8'; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = 'transparent'; }}
              >
                {s.display_name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmergencyFab(props) {
  return (
    <button className="emergency-fab" onClick={props.onOpen}>
      Emergency Help
    </button>
  );
}

function EmergencyPage(props) {
  return (
    <div className="emergency-page">
      <div className="emergency-header">
        <h1>Immediate Danger?</h1>
        <p>Contact local emergency services right now. Do not wait.</p>
      </div>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 20px 0' }}>
        <div style={{ background: '#fff8e6', border: '1px solid #f0dca0', borderRadius: '8px', padding: '14px 18px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '13.5px', color: '#6b5a1e', fontWeight: 600 }}>
            This page is only for emergencies. For any other issue, go back to the home page.
          </p>
          <a href="#" onClick={function (e) { e.preventDefault(); props.onBack(); }} style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--navy)', textDecoration: 'underline' }}>
            Back to Login
          </a>
        </div>
      </div>
      <div className="emergency-list">
        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>India</div>
        {EMERGENCY_CONTACTS_INDIA.map(function (c) {
          var telHref = "tel:" + c.number;
          var cls = "emergency-call-btn" + (c.primary ? " primary" : "");
          return (
            <a key={c.number + c.name} href={telHref} className={cls}>
              <div className="emergency-call-info">
                <h4>{c.name}</h4>
                <p>{c.desc}</p>
              </div>
              <div className="emergency-call-number">{c.number}</div>
            </a>
          );
        })}

        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '18px' }}>International</div>
        {EMERGENCY_CONTACTS_INTERNATIONAL.map(function (c) {
          var telHref = "tel:" + c.number;
          return (
            <a key={c.number + c.name} href={telHref} className="emergency-call-btn">
              <div className="emergency-call-info">
                <h4>{c.name}</h4>
                <p>{c.desc}</p>
              </div>
              <div className="emergency-call-number">{c.number}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function HelpCenterPage(props) {
  return (
    <div className="help-page">
      <div className="help-header">
        <h1>Help Center and Guidelines</h1>
        <p>Understanding this platform, how it works, and what to do in different situations.</p>
      </div>
      <div className="help-content">

        <div className="help-section">
          <h2>What is this platform?</h2>
          <p>
            This is an independent prototype of a citizen support and communication platform, built for people
            who are away from their home state or country and facing a difficult situation, such as harassment,
            threats, being followed, a serious misunderstanding, or simply not knowing who to contact. It is not
            currently affiliated with, endorsed by, or connected to any government department. No complaint
            submitted here is monitored by real authorities at this stage. Its purpose is to demonstrate how such
            a system could work, so that real government departments can be approached with a working example.
          </p>
        </div>

        <div className="help-section">
          <h2>How it works</h2>
          <p>
            You register with your name, email, and your home state, meaning the place you consider home,
            regardless of where you currently are. When something happens, you file a report describing what
            occurred, where, and when, and you can attach a photo, video, or document as supporting evidence.
            Your report is then shown, in this prototype, to a verified officer whose jurisdiction matches your
            home state. The officer can review your report, see any evidence you attached, and update its status
            as it moves from Submitted through Received, Under Review, and eventually to Resolved or Closed.
          </p>
        </div>

        <div className="help-section">
          <h2>If you are in immediate danger</h2>
          <p>
            This platform is not an emergency service and should never be used as one. If you are in immediate
            danger, contact local emergency services right away, before doing anything else. In India, dial 112,
            the national single emergency number for police, fire, and ambulance. You can also reach the Police
            directly at 100, the Women Helpline for domestic abuse at 181, the dedicated Women in Distress line
            at 1091, the Child Helpline at 1098, and the Cyber Crime Helpline at 1930 for online fraud or
            harassment. If you are outside India, dial 911 in the United States and Canada, 999 in the United
            Kingdom, 112 anywhere in the European Union, and 000 in Australia. The number 112 also works as a
            general fallback on most mobile networks worldwide, even without a local SIM card. You can reach all
            of these instantly, without logging in, from the red Emergency Help button on any page of this platform.
          </p>
        </div>

        <div className="help-section">
          <h2>What this platform is for</h2>
          <p>
            Use this platform for situations that are serious but not unfolding as an immediate emergency, such
            as documenting an ongoing pattern of harassment, requesting help understanding local procedures,
            overcoming a language barrier, or asking your home state's authorities to help coordinate with local
            authorities where you currently are. It is a communication and follow-up channel, not a replacement
            for the police or emergency responders.
          </p>
        </div>

        <div className="help-section">
          <h2>How your information is used</h2>
          <p>
            Your password is never stored in plain text; it is securely hashed before saving. Evidence files are
            stored privately and are never publicly accessible, only verified officers reviewing your specific
            case can view them, through temporary secure links. Officer accounts require manual verification
            before they can access any complaint, and every account type is kept strictly separate. As a
            prototype, however, this system has not undergone formal legal or security review, and you should
            avoid submitting highly sensitive information you would not want stored in a non-production system.
          </p>
        </div>

        <div className="help-section">
          <h2>Officer verification</h2>
          <p>
            Officer accounts are not self-serve. Anyone can register as an officer, but the account remains
            inactive and cannot log in until an administrator manually verifies it. This exists specifically to
            prevent unverified individuals from gaining access to citizens' complaints or personal information.
          </p>
        </div>

        <div className="help-back">
          <a href="#" onClick={function (e) { e.preventDefault(); props.onBack(); }}>
            Back to the platform
          </a>
        </div>
      </div>
    </div>
  );
}

function StarRow(props) {
  var value = props.value;
  var onChange = props.onChange;
  var stars = [1, 2, 3, 4, 5];
  return (
    <div className="star-row">
      {stars.map(function (n) {
        return (
          <button
            type="button"
            key={n}
            className={"star-btn" + (n <= value ? " filled" : "")}
            onClick={function () { onChange(n); }}
          >
            {"\u2605"}
          </button>
        );
      })}
    </div>
  );
}

function StarDisplay(props) {
  var rating = props.rating;
  var full = "\u2605".repeat(rating);
  var empty = "\u2606".repeat(5 - rating);
  return <span className="star-display">{full}{empty}</span>;
}

function ReviewsPage(props) {
  var isLoggedIn = props.isLoggedIn;
  var token = props.token;

  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  function fetchReviews() {
    setLoading(true);
    fetch(API + "/api/reviews")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setReviews(data.reviews || []);
        setAverage(data.average_rating || 0);
        setTotal(data.total_reviews || 0);
      })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }

  useEffect(function () { fetchReviews(); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setMsg({ type: 'error', text: 'Please select a star rating.' });
      return;
    }
    setSubmitting(true);
    setMsg(null);
    fetch(API + "/api/reviews", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ rating: rating, review_text: text })
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          setMsg({ type: 'error', text: result.data.error });
        } else {
          setMsg({ type: 'success', text: 'Thank you for sharing your experience.' });
          setRating(0);
          setText('');
          fetchReviews();
        }
      })
      .catch(function () {
        setMsg({ type: 'error', text: 'Could not reach the server.' });
      })
      .finally(function () {
        setSubmitting(false);
      });
  }

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>Community Reviews</h1>
        <div className="reviews-avg">
          {total > 0 ? (
            <>Average rating: <strong>{average}</strong> / 5 from {total} {total === 1 ? 'review' : 'reviews'}</>
          ) : (
            <>No reviews yet. Be the first to share your experience.</>
          )}
        </div>
      </div>
      <div className="reviews-wrap">

        {isLoggedIn ? (
          <div className="panel" style={{ marginBottom: '24px' }}>
            <div className="panel-header">
              <h3>Share your experience</h3>
              <p>If this platform helped you, let others know. Your feedback helps more people trust and use it.</p>
            </div>
            <form className="panel-body" onSubmit={handleSubmit}>
              <div className="field">
                <label>Your rating</label>
                <StarRow value={rating} onChange={setRating} />
              </div>
              <div className="field">
                <label htmlFor="reviewText">Your feedback</label>
                <textarea
                  id="reviewText"
                  placeholder="Tell us about your experience using this platform..."
                  value={text}
                  onChange={function (e) { setText(e.target.value); }}
                  required
                />
              </div>
              <button className="submit-btn" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit review'}
              </button>
              {msg && <div className={"message " + msg.type}>{msg.text}</div>}
            </form>
          </div>
        ) : (
          <div className="pending-notice" style={{ marginBottom: '24px' }}>
            Sign in to your account to share your own review.
          </div>
        )}

        <div>
          {loading && <div className="empty-state">Loading reviews...</div>}
          {!loading && reviews.length === 0 && <div className="empty-state">No reviews yet.</div>}
          {reviews.map(function (r) {
            var dateStr = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <div key={r.id} className="review-card">
                <div className="review-top">
                  <span className="review-name">{r.citizen_name}</span>
                  <span className="review-date">{dateStr}</span>
                </div>
                <StarDisplay rating={r.rating} />
                <div className="review-text">{r.review_text}</div>
              </div>
            );
          })}
        </div>

        <div className="help-back" style={{ marginTop: '20px' }}>
          <a href="#" onClick={function (e) { e.preventDefault(); props.onBack(); }}>
            Back to the platform
          </a>
        </div>
      </div>
    </div>
  );
}

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

function Letterhead(props) {
  return (
    <>
      <div className="letterhead">
        <div className="emblem">CS</div>
        <div className="letterhead-text">
          <h1>Citizen Support and Emergency Liaison Platform{props.officerMode && <span className="officer-badge">OFFICER PORTAL</span>}</h1>
          <p>Independent prototype, not officially affiliated with any government department</p>
        </div>
      </div>
      <div className="disclaimer-strip">
        In an emergency, contact local emergency services directly. This platform is a non-emergency follow-up channel.
      </div>
    </>
  );
}

var GOOGLE_CLIENT_ID = "999716085918-3m5g8bobiba1k2pmnae7l4fjefrfari7.apps.googleusercontent.com";

function GoogleSignInButton(props) {
  var onCredential = props.onCredential;
  const [ready, setReady] = useState(false);

  useEffect(function () {
    function tryInit() {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: function (response) {
            onCredential(response.credential);
          }
        });
        var el = document.getElementById('googleBtnDiv');
        if (el) {
          window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' });
        }
        setReady(true);
      } else {
        setTimeout(tryInit, 300);
      }
    }
    tryInit();
  }, []);

  return <div id="googleBtnDiv" style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}></div>;
}

function AuthPage(props) {
  var onLogin = props.onLogin;
  var onOfficerLogin = props.onOfficerLogin;
  var onEmergency = props.onEmergency;
  var onHelp = props.onHelp;
  var onReviews = props.onReviews;

  const [portal, setPortal] = useState(window.location.pathname.indexOf('/officer') === 0 ? 'officer' : 'citizen');
  const [mode, setMode] = useState('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetMsg, setResetMsg] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  function handleReset(e) {
    e.preventDefault();
    setResetMsg(null);
    setResetLoading(true);
    var base = portal === 'officer' ? '/api/officer' : '/api/auth';
    fetch(API + base + '/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail, new_password: resetPassword })
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) {
          setResetMsg({ type: 'error', text: result.data.error });
        } else {
          setResetMsg({ type: 'success', text: result.data.message });
          setResetPassword('');
        }
      })
      .catch(function () { setResetMsg({ type: 'error', text: 'Could not reach the server.' }); })
      .finally(function () { setResetLoading(false); });
  }
  const [form, setForm] = useState({ name: '', email: '', password: '', home_state: '', department: '', jurisdiction_state: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    var updated = Object.assign({}, form);
    updated[e.target.name] = e.target.value;
    setForm(updated);
  }

  function handleOfficerGoogleCredential(credential) {
    setMessage(null);
    setLoading(true);
    fetch(API + '/api/officer/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: credential })
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) {
          setMessage({ type: 'error', text: result.data.error || 'Google sign-in failed.' });
        } else {
          localStorage.setItem('officerToken', result.data.token);
          localStorage.setItem('officer', JSON.stringify(result.data.officer));
          onOfficerLogin(result.data.token, result.data.officer);
        }
      })
      .catch(function () {
        setMessage({ type: 'error', text: 'Could not reach the server.' });
      })
      .finally(function () {
        setLoading(false);
      });
  }

  function handleGoogleCredential(credential) {
    setMessage(null);
    setLoading(true);
    fetch(API + '/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: credential })
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) {
          setMessage({ type: 'error', text: result.data.error || 'Google sign-in failed.' });
        } else {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          onLogin(result.data.token, result.data.user);
        }
      })
      .catch(function () {
        setMessage({ type: 'error', text: 'Could not reach the server.' });
      })
      .finally(function () {
        setLoading(false);
      });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    var isOfficer = portal === 'officer';
    var base = isOfficer ? '/api/officer' : '/api/auth';
    var endpoint = mode === 'login' ? (base + '/login') : (base + '/register');

    var body;
    if (mode === 'login') {
      body = { email: form.email, password: form.password };
    } else if (isOfficer) {
      body = { name: form.name, email: form.email, password: form.password, department: form.department, jurisdiction_state: form.jurisdiction_state };
    } else {
      body = { name: form.name, email: form.email, password: form.password, home_state: form.home_state };
    }

    fetch(API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          setMessage({ type: 'error', text: result.data.error || 'Something went wrong.' });
        } else {
          setMessage({ type: 'success', text: result.data.message });
          if (mode === 'login' && result.data.token) {
            if (isOfficer) {
              localStorage.setItem('officerToken', result.data.token);
              localStorage.setItem('officer', JSON.stringify(result.data.officer));
              onOfficerLogin(result.data.token, result.data.officer);
            } else {
              localStorage.setItem('token', result.data.token);
              localStorage.setItem('user', JSON.stringify(result.data.user));
              onLogin(result.data.token, result.data.user);
            }
          }
        }
      })
      .catch(function () {
        setMessage({ type: 'error', text: 'Could not reach the server. Is the backend running?' });
      })
      .finally(function () {
        setLoading(false);
      });
  }

  var isOfficer = portal === 'officer';

  return (
    <>
      <FlagBackground />
      <Letterhead officerMode={isOfficer} />
      <div className="page-wrap">
        <div className="auth-card">
          <div className="tabs">
            <button className={"tab" + (mode === 'login' ? ' active' : '')} onClick={function () { setMode('login'); setMessage(null); }}>Sign In</button>
            <button className={"tab" + (mode === 'register' ? ' active' : '')} onClick={function () { setMode('register'); setMessage(null); }}>Register</button>
          </div>
          {mode === 'reset' && (
            <form className="form-body" onSubmit={handleReset}>
              <h2>Reset your password</h2>
              <p className="subtitle">
                Enter your account email and choose a new password. For this prototype, no email verification is required.
              </p>
              <div className="field">
                <label htmlFor="resetEmail">Email address</label>
                <input id="resetEmail" type="email" value={resetEmail} onChange={function (e) { setResetEmail(e.target.value); }} required />
              </div>
              <div className="field">
                <label htmlFor="resetPassword">New password</label>
                <input id="resetPassword" type="password" value={resetPassword} onChange={function (e) { setResetPassword(e.target.value); }} required minLength={6} />
              </div>
              <button className="submit-btn" type="submit" disabled={resetLoading}>
                {resetLoading ? 'Please wait...' : 'Reset password'}
              </button>
              {resetMsg && <div className={"message " + resetMsg.type}>{resetMsg.text}</div>}
              <div className="portal-switch" style={{ marginTop: '14px' }}>
                <button type="button" onClick={function () { setMode('login'); setResetMsg(null); }}>Back to sign in</button>
              </div>
            </form>
          )}
          {mode !== 'reset' && (
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
                <label htmlFor="home_state">Home state / region / country</label>
                <PlaceAutocomplete
                  id="home_state"
                  value={form.home_state}
                  onChange={function (v) { var u = Object.assign({}, form); u.home_state = v; setForm(u); }}
                  placeholder="e.g. Andhra Pradesh, or your country"
                  required={true}
                />
              </div>
            )}

            {mode === 'register' && isOfficer && (
              <>
                <div className="field">
                  <label htmlFor="department">Department</label>
                  <input id="department" name="department" type="text" placeholder="e.g. AP Nodal Office" value={form.department} onChange={handleChange} required />
                </div>
                <div className="field">
                  <label htmlFor="jurisdiction_state">Jurisdiction state / region / country</label>
                  <PlaceAutocomplete
                    id="jurisdiction_state"
                    value={form.jurisdiction_state}
                    onChange={function (v) { var u = Object.assign({}, form); u.jurisdiction_state = v; setForm(u); }}
                    placeholder="e.g. Andhra Pradesh, or your country"
                    required={true}
                  />
                </div>
              </>
            )}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            {mode === 'login' && (
              <>
                <div style={{ textAlign: 'center', margin: '14px 0 2px', fontSize: '12px', color: 'var(--text-muted)' }}>or</div>
                <GoogleSignInButton key={portal} onCredential={portal === 'officer' ? handleOfficerGoogleCredential : handleGoogleCredential} />
              </>
            )}

            {message && <div className={"message " + message.type}>{message.text}</div>}
            {mode === 'login' && (
              <div className="portal-switch" style={{ marginTop: '12px' }}>
                <button type="button" onClick={function () { setMode('reset'); setMessage(null); }}>Forgot password?</button>
              </div>
            )}
          </form>
          )}

          <div className="portal-switch" style={{ paddingBottom: '10px' }}>
            {isOfficer
              ? <>Not an officer? <button onClick={function () { setPortal('citizen'); setMessage(null); window.history.pushState({}, '', '/'); }}>Go to citizen portal</button></>
              : null}
          </div>
          <div className="portal-switch" style={{ paddingBottom: '20px' }}>
            <button onClick={onReviews}>See community reviews</button>
          </div>
        </div>
      </div>
      <p className="emergency-note">
        This is a prototype demonstration. No data submitted here is monitored by real authorities at this stage.
        <br />
        <button className="help-link-inline" onClick={onHelp} style={{ marginTop: '6px' }}>View Help Center and Guidelines</button>
      </p>
      <EmergencyFab onOpen={onEmergency} />
    </>
  );
}

function ComplaintForm(props) {
  var token = props.token;
  var onSubmitted = props.onSubmitted;

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
    window.__locTimer = setTimeout(function () {
      var url = "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=" + encodeURIComponent(value);
      fetch(url)
        .then(function (res) { return res.json(); })
        .then(function (data) {
          setSuggestions(data);
          setShowSuggestions(true);
        })
        .catch(function () { setSuggestions([]); });
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
      function (pos) {
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        var url = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon;
        fetch(url)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            var address = data.display_name || (lat.toFixed(5) + ", " + lon.toFixed(5));
            setLocation(address);
            setLocationMessage({ type: 'success', text: 'Current location added.' });
          })
          .catch(function () {
            setLocation(lat.toFixed(5) + ", " + lon.toFixed(5));
            setLocationMessage({ type: 'success', text: 'Coordinates added (address lookup unavailable).' });
          })
          .finally(function () { setLocating(false); });
      },
      function () {
        setLocating(false);
        setLocationMessage({ type: 'error', text: 'Could not access location. Please allow location permission or enter it manually.' });
      }
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    fetch(API + "/api/complaints", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ category: category, description: description, incident_location: location, danger_flag: danger, contact_phone: phone })
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          setMessage({ type: 'error', text: result.data.error || 'Something went wrong.' });
          setLoading(false);
          return;
        }

        var complaintId = result.data.complaint.id;

        if (file) {
          var formData = new FormData();
          formData.append('file', file);
          return fetch(API + "/api/evidence/" + complaintId, {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token },
            body: formData
          }).then(function () {
            setMessage({ type: 'success', text: 'Complaint submitted successfully.' });
            setCategory(''); setDescription(''); setLocation(''); setDanger(false); setPhone(''); setFile(null);
            onSubmitted();
            setLoading(false);
          });
        } else {
          setMessage({ type: 'success', text: 'Complaint submitted successfully.' });
          setCategory(''); setDescription(''); setLocation(''); setDanger(false); setPhone(''); setFile(null);
          onSubmitted();
          setLoading(false);
        }
      })
      .catch(function () {
        setMessage({ type: 'error', text: 'Could not reach the server.' });
        setLoading(false);
      });
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Report an issue</h3>
        <p>Describe what happened. You can attach a photo, video, or document as evidence.</p>
      </div>
      <form className="panel-body" onSubmit={handleSubmit}>
        <div className="danger-check">
          <input type="checkbox" id="danger" checked={danger} onChange={function (e) { setDanger(e.target.checked); }} />
          <label htmlFor="danger">I am currently in immediate danger</label>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={function (e) { setCategory(e.target.value); }} required>
            <option value="">Select a category</option>
            {CATEGORIES.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
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
                onChange={function (e) { handleLocationInput(e.target.value); }}
                onFocus={function () { if (suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={function () { setTimeout(function () { setShowSuggestions(false); }, 150); }}
                autoComplete="off"
                style={{ width: '100%' }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '5px', marginTop: '4px', boxShadow: '0 4px 16px rgba(20,41,61,0.12)', zIndex: 10, maxHeight: '220px', overflowY: 'auto' }}>
                  {suggestions.map(function (s, i) {
                    return (
                      <div
                        key={i}
                        onMouseDown={function () { selectSuggestion(s); }}
                        style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none' }}
                        onMouseEnter={function (e) { e.currentTarget.style.background = '#f4f6f8'; }}
                        onMouseLeave={function (e) { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {s.display_name}
                      </div>
                    );
                  })}
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
          {locationMessage && <div className={"message " + locationMessage.type} style={{ marginTop: '8px' }}>{locationMessage.text}</div>}
        </div>

        <div className="field">
          <label htmlFor="phone">Contact phone number</label>
          <input id="phone" type="tel" placeholder="e.g. +91 98765 43210" value={phone} onChange={function (e) { setPhone(e.target.value); }} />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" placeholder="Describe what happened, when, and who is involved." value={description} onChange={function (e) { setDescription(e.target.value); }} required />
        </div>

        <div className="field">
          <label>Evidence (optional)</label>
          <label className="file-input-wrap">
            <input type="file" accept="image/*,video/*,application/pdf" onChange={function (e) { setFile(e.target.files[0]); }} />
            {file ? 'Change file' : 'Click to attach photo, video, or PDF (max 50MB)'}
          </label>
          {file && <div className="file-name">Attached: {file.name}</div>}
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit complaint'}
        </button>

        {message && <div className={"message " + message.type}>{message.text}</div>}
      </form>
    </div>
  );
}

function ComplaintList(props) {
  var token = props.token;
  var refreshKey = props.refreshKey;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  function fetchComplaints() {
    setLoading(true);
    fetch(API + "/api/complaints", { headers: { Authorization: 'Bearer ' + token } })
      .then(function (res) { return res.json(); })
      .then(function (data) { setComplaints(data.complaints || []); })
      .catch(function (err) { console.error(err); })
      .finally(function () { setLoading(false); });
  }

  useEffect(function () { fetchComplaints(); }, [refreshKey]);

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
          {complaints.map(function (c) {
            var dateStr = new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <div key={c.id} className={"complaint-card" + (c.danger_flag ? " danger" : "")}>
                <div className="complaint-top">
                  <span className="complaint-category">{c.category}</span>
                  <span className={"status-badge status-" + c.status.replace(/ /g, '-')}>{c.status}</span>
                </div>
                <div className="complaint-desc">{c.description}</div>
                <div className="complaint-meta">
                  {c.incident_location ? (c.incident_location + " | ") : ""}
                  {dateStr}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfilePage(props) {
  var token = props.token;
  var onUpdated = props.onUpdated;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', village: '', current_location: '', home_state: '' });

  function loadProfile() {
    setLoading(true);
    fetch(API + "/api/profile", { headers: { Authorization: 'Bearer ' + token } })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setProfile(data.profile);
        setForm({
          name: data.profile.name || '',
          phone: data.profile.phone || '',
          village: data.profile.village || '',
          current_location: data.profile.current_location || '',
          home_state: data.profile.home_state || ''
        });
      })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }

  useEffect(function () { loadProfile(); }, []);

  function handleChange(e) {
    var u = Object.assign({}, form);
    u[e.target.name] = e.target.value;
    setForm(u);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    fetch(API + "/api/profile", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(form)
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) {
          setMsg({ type: 'error', text: result.data.error });
        } else {
          setMsg({ type: 'success', text: 'Profile updated.' });
          setProfile(result.data.profile);
          if (onUpdated) onUpdated(result.data.profile);
        }
      })
      .catch(function () { setMsg({ type: 'error', text: 'Could not reach the server.' }); })
      .finally(function () { setSaving(false); });
  }

  function handlePicUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    var formData = new FormData();
    formData.append('file', file);
    fetch(API + "/api/profile/picture", {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: formData
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) {
          setMsg({ type: 'error', text: result.data.error });
        } else {
          var updatedProfile = Object.assign({}, profile, { profile_pic_url: result.data.profile_pic_url });
          setProfile(updatedProfile);
          if (onUpdated) onUpdated(updatedProfile);
          setMsg({ type: 'success', text: 'Profile picture updated.' });
        }
      })
      .catch(function () { setMsg({ type: 'error', text: 'Could not reach the server.' }); })
      .finally(function () { setUploading(false); });
  }

  if (loading) {
    return <div className="profile-page-wrap"><div className="empty-state">Loading profile...</div></div>;
  }

  var initials = (profile && profile.name) ? profile.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="profile-page-wrap">
      <div className="profile-pic-big">
        {profile && profile.profile_pic_url ? <img src={profile.profile_pic_url} alt="Profile" /> : initials}
      </div>
      <label className="profile-pic-upload-label">
        {uploading ? 'Uploading...' : 'Change profile picture'}
        <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handlePicUpload} disabled={uploading} />
      </label>

      <div className="panel">
        <div className="panel-header">
          <h3>My Profile</h3>
          <p>This information is shared with the officer reviewing your complaints.</p>
        </div>
        <form className="panel-body" onSubmit={handleSave}>
          <div className="field">
            <label htmlFor="pname">Full name</label>
            <input id="pname" name="name" type="text" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email address</label>
            <input type="email" value={(profile && profile.email) || ''} disabled style={{ background: '#f4f6f8', color: 'var(--text-muted)' }} />
          </div>
          <div className="field">
            <label htmlFor="pphone">Phone number</label>
            <input id="pphone" name="phone" type="tel" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="phome">Home state / region / country</label>
            <PlaceAutocomplete
              id="phome"
              value={form.home_state}
              onChange={function (v) { var u = Object.assign({}, form); u.home_state = v; setForm(u); }}
              placeholder="e.g. Andhra Pradesh, or your country"
            />
          </div>
          <div className="field">
            <label htmlFor="pvillage">Native village / hometown</label>
            <input id="pvillage" name="village" type="text" placeholder="e.g. your native village or town" value={form.village} onChange={handleChange} />
          </div>
          <div className="field">
            <label htmlFor="pcurrent">Current location (where you live now)</label>
            <input id="pcurrent" name="current_location" type="text" placeholder="e.g. city you are currently staying in" value={form.current_location} onChange={handleChange} />
          </div>
          <button className="submit-btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
          {msg && <div className={"message " + msg.type}>{msg.text}</div>}
        </form>
      </div>
    </div>
  );
}

function Sidebar(props) {
  var role = props.role;
  var name = props.name;
  var view = props.view;
  var onNavigate = props.onNavigate;
  var onEmergency = props.onEmergency;
  var onSignOut = props.onSignOut;
  var profilePic = props.profilePic;

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-row">
          {role === 'citizen' && (
            <div className="profile-circle" onClick={function () { onNavigate('profile'); }}>
              {profilePic ? <img src={profilePic} alt="Profile" /> : (name ? name.charAt(0).toUpperCase() : '?')}
            </div>
          )}
          <div>
            <div className="sidebar-brand-title">Citizen Support Platform</div>
            <div className="sidebar-user">{name}{role === 'officer' ? ' (Officer)' : ''}</div>
          </div>
        </div>
      </div>
      <div className="sidebar-nav">
        <button className={"sidebar-link" + (view === 'dashboard' ? ' active' : '')} onClick={function () { onNavigate('dashboard'); }}>
          {role === 'officer' ? 'Complaints Dashboard' : 'Report an Issue'}
        </button>
        {role === 'citizen' && (
          <button className={"sidebar-link" + (view === 'profile' ? ' active' : '')} onClick={function () { onNavigate('profile'); }}>
            My Profile
          </button>
        )}
        <button className={"sidebar-link" + (view === 'reviews' ? ' active' : '')} onClick={function () { onNavigate('reviews'); }}>
          Community Reviews
        </button>
        <button className={"sidebar-link" + (view === 'help' ? ' active' : '')} onClick={function () { onNavigate('help'); }}>
          Help Center
        </button>
      </div>
      <button className="sidebar-emergency-link" onClick={onEmergency}>Emergency Help</button>
      <div className="sidebar-footer">
        <button className="sidebar-signout" onClick={onSignOut}>Sign out</button>
      </div>
    </div>
  );
}

function Dashboard(props) {
  var token = props.token;
  var user = props.user;
  var onLogout = props.onLogout;
  var onEmergency = props.onEmergency;
  var onHelp = props.onHelp;
  var onReviews = props.onReviews;

  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <>
      <div className="disclaimer-strip">
        In an emergency, contact local emergency services directly. This platform is a non-emergency follow-up channel.
      </div>
      <div className="dashboard-wrap">
        <div className="dashboard-grid">
          <ComplaintForm token={token} onSubmitted={function () { setRefreshKey(refreshKey + 1); }} />
          <ComplaintList token={token} refreshKey={refreshKey} />
        </div>
      </div>
    </>
  );
}

function OfficerComplaintCard(props) {
  var complaint = props.complaint;
  var token = props.token;
  var onUpdated = props.onUpdated;

  const [status, setStatus] = useState(complaint.status);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  function loadEvidence() {
    if (showEvidence) {
      setShowEvidence(false);
      return;
    }
    setLoadingEvidence(true);
    fetch(API + "/api/officer/dashboard/complaints/" + complaint.id + "/evidence", {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        setEvidence(data.evidence || []);
        setShowEvidence(true);
      })
      .catch(function () { setEvidence([]); setShowEvidence(true); })
      .finally(function () { setLoadingEvidence(false); });
  }

  function handleUpdate() {
    setUpdating(true);
    setMsg(null);
    fetch(API + "/api/officer/dashboard/complaints/" + complaint.id + "/status", {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ status: status })
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          setMsg({ type: 'error', text: result.data.error });
        } else {
          setMsg({ type: 'success', text: 'Status updated.' });
          onUpdated();
        }
      })
      .catch(function () {
        setMsg({ type: 'error', text: 'Could not reach the server.' });
      })
      .finally(function () {
        setUpdating(false);
      });
  }

  var dateStr = new Date(complaint.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={"complaint-card" + (complaint.danger_flag ? " danger" : "")}>
      <div className="complaint-top">
        <span className="complaint-category">{complaint.category}</span>
        <span className={"status-badge status-" + complaint.status.replace(/ /g, '-')}>{complaint.status}</span>
      </div>
      <div className="complaint-desc">{complaint.description}</div>
      <div className="complaint-meta">
        {complaint.incident_location ? (complaint.incident_location + " | ") : ""}
        {dateStr}
      </div>
      <div className="citizen-info">
        Reported by: {complaint.citizen_name} ({complaint.citizen_email}) | Home state: {complaint.home_state}
        {complaint.contact_phone ? (" | Phone: " + complaint.contact_phone) : ""}
      </div>
      <div className="status-update-row">
        <select className="status-select" value={status} onChange={function (e) { setStatus(e.target.value); }}>
          {VALID_STATUSES.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
        </select>
        <button className="status-update-btn" onClick={handleUpdate} disabled={updating || status === complaint.status}>
          {updating ? 'Updating...' : 'Update status'}
        </button>
        <button
          type="button"
          onClick={loadEvidence}
          disabled={loadingEvidence}
          style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: '5px', background: 'var(--white)', color: 'var(--navy)', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {loadingEvidence ? 'Loading...' : showEvidence ? 'Hide evidence' : 'View evidence'}
        </button>
      </div>

      {showEvidence && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
          {(!evidence || evidence.length === 0) && (
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No evidence attached to this complaint.</div>
          )}
          {evidence && evidence.map(function (ev) {
            if (!ev.signed_url) {
              return <div key={ev.id} style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{ev.file_name} (could not load)</div>;
            }
            if (ev.file_type && ev.file_type.indexOf('image') === 0) {
              return (
                <div key={ev.id} style={{ marginBottom: '10px' }}>
                  <img src={ev.signed_url} alt={ev.file_name} style={{ maxWidth: '100%', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              );
            }
            if (ev.file_type && ev.file_type.indexOf('video') === 0) {
              return (
                <div key={ev.id} style={{ marginBottom: '10px' }}>
                  <video controls style={{ maxWidth: '100%', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <source src={ev.signed_url} type={ev.file_type} />
                  </video>
                </div>
              );
            }
            return (
              <div key={ev.id} style={{ marginBottom: '8px' }}>
                <a href={ev.signed_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--green-dark)', fontWeight: 600 }}>
                  Open {ev.file_name}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {msg && <div className={"message " + msg.type} style={{ marginTop: '8px' }}>{msg.text}</div>}
    </div>
  );
}

function OfficerDashboard(props) {
  var token = props.token;
  var officer = props.officer;
  var onLogout = props.onLogout;
  var onEmergency = props.onEmergency;
  var onHelp = props.onHelp;
  var onReviews = props.onReviews;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  function fetchComplaints() {
    setLoading(true);
    fetch(API + "/api/officer/dashboard/complaints", { headers: { Authorization: 'Bearer ' + token } })
      .then(function (res) { return res.json(); })
      .then(function (data) { setComplaints(data.complaints || []); })
      .catch(function (err) { console.error(err); })
      .finally(function () { setLoading(false); });
  }

  useEffect(function () { fetchComplaints(); }, [refreshKey]);

  return (
    <>
      <div className="disclaimer-strip">
        {officer && officer.department} - Jurisdiction: {officer && officer.jurisdiction_state}
      </div>
      <div className="dashboard-wrap">
        <div className="panel">
          <div className="panel-header">
            <h3>Complaints in your jurisdiction</h3>
            <p>Showing complaints from citizens whose home state is {officer && officer.jurisdiction_state}. Danger flags are shown first.</p>
          </div>
          <div className="panel-body">
            <div className="complaint-list">
              {loading && <div className="empty-state">Loading...</div>}
              {!loading && complaints.length === 0 && <div className="empty-state">No complaints in your jurisdiction yet.</div>}
              {complaints.map(function (c) {
                return <OfficerComplaintCard key={c.id} complaint={c} token={token} onUpdated={function () { setRefreshKey(refreshKey + 1); }} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(function () {
    var stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [officerToken, setOfficerToken] = useState(localStorage.getItem('officerToken'));
  const [officer, setOfficer] = useState(function () {
    var stored = localStorage.getItem('officer');
    return stored ? JSON.parse(stored) : null;
  });
  const [showEmergency, setShowEmergency] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

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

  if (showEmergency) {
    return <EmergencyPage onBack={function () { setShowEmergency(false); }} />;
  }

  var isLoggedIn = !!token || !!officerToken;

  if (!isLoggedIn) {
    if (showHelp) {
      return <HelpCenterPage onBack={function () { setShowHelp(false); }} />;
    }
    if (showReviews) {
      return <ReviewsPage onBack={function () { setShowReviews(false); }} isLoggedIn={false} token={null} />;
    }
    return <AuthPage onLogin={handleLogin} onOfficerLogin={handleOfficerLogin} onEmergency={function () { setShowEmergency(true); }} onHelp={function () { setShowHelp(true); }} onReviews={function () { setShowReviews(true); }} />;
  }

  var role = officerToken ? 'officer' : 'citizen';
  var displayName = officerToken ? ((officer && officer.name) || 'Officer') : ((user && user.name) || 'Citizen');
  var activeView = showReviews ? 'reviews' : (showHelp ? 'help' : (showProfile ? 'profile' : 'dashboard'));

  function navigate(view) {
    setShowReviews(view === 'reviews');
    setShowHelp(view === 'help');
    setShowProfile(view === 'profile');
  }

  function handleAnySignOut() {
    if (officerToken) { handleOfficerLogout(); } else { handleLogout(); }
    setShowReviews(false);
    setShowHelp(false);
  }

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        name={displayName}
        view={activeView}
        onNavigate={navigate}
        onEmergency={function () { setShowEmergency(true); }}
        onSignOut={handleAnySignOut}
        profilePic={profilePic}
      />
      <div className="app-main">
        {activeView === 'reviews' && <ReviewsPage onBack={function () { navigate('dashboard'); }} isLoggedIn={true} token={token} />}
        {activeView === 'help' && <HelpCenterPage onBack={function () { navigate('dashboard'); }} />}
        {activeView === 'profile' && <ProfilePage token={token} onUpdated={function (p) { setProfilePic(p.profile_pic_url); }} />}
        {activeView === 'dashboard' && role === 'officer' && (
          <OfficerDashboard token={officerToken} officer={officer} onLogout={handleAnySignOut} onEmergency={function () { setShowEmergency(true); }} />
        )}
        {activeView === 'dashboard' && role === 'citizen' && (
          <Dashboard token={token} user={user} onLogout={handleAnySignOut} onEmergency={function () { setShowEmergency(true); }} />
        )}
      </div>
    </div>
  );
}


















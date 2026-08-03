import { useState } from 'react'
import { API_BASE_URL } from '../config'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function NotifyForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!EMAIL_RE.test(email)) {
      setStatus('error')
      setMessage('That does not look like a valid email.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(`${API_BASE_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message || 'Something drifted off course.')
      }

      setStatus('success')
      setMessage(data.message || "You're on the list. See you out there.")
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Something drifted off course. Try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="notify-form__success" role="status">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7.5 12.5 10.5 15.5 16.5 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{message}</span>
      </div>
    )
  }

  return (
    <form className="notify-form" onSubmit={handleSubmit} noValidate>
      <div className="notify-form__field">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          required
        />
        <button type="submit" disabled={status === 'loading'}>
          <span>{status === 'loading' ? 'Sending…' : 'Notify Me'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12h16M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {status === 'error' && (
        <p className="notify-form__error" role="alert">
          {message}
        </p>
      )}
    </form>
  )
}

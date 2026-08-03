import Starfield from './components/Starfield'
import CountdownTimer from './components/CountdownTimer'
import NotifyForm from './components/NotifyForm'
import './App.css'

const SOCIALS = [
  {
    name: 'Instagram',
    href: '#',
    path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10.5 2.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  {
    name: 'X',
    href: '#',
    path: 'M3 3h5.6l4 5.6L17.3 3H21l-7 8.2L21.5 21h-5.6l-4.4-6.1L6 21H2.3l7.5-8.7L3 3Z',
  },
  {
    name: 'GitHub',
    href: '#',
    path: 'M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.26-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.9-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.66.64.7 1.03 1.6 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z',
  },
]

function App() {
  return (
    <div className="page">
      <Starfield />
      <div className="nebula nebula--one" aria-hidden="true" />
      <div className="nebula nebula--two" aria-hidden="true" />
      <div className="nebula nebula--three" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <main className="content">
        <div className="planet-orbit" aria-hidden="true">
          <div className="planet">
            <div className="planet__ring" />
          </div>
        </div>

        <div className="brand fade-in" style={{ '--delay': '0.05s' }}>
          <span className="brand__mark">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2 14.2 9.8 22 12 14.2 14.2 12 22 9.8 14.2 2 12 9.8 9.8 12 2Z" fill="currentColor" />
            </svg>
          </span>
          <span className="brand__name">SLEDJE</span>
        </div>

        <p className="eyebrow fade-in" style={{ '--delay': '0.15s' }}>
          Launching from somewhere in the Milky Way
        </p>

        <h1 className="headline fade-in" style={{ '--delay': '0.25s' }}>
          <span className="headline__gradient">Coming</span>
          <span className="headline__gradient headline__gradient--alt">Soon</span>
        </h1>

        <p className="tagline fade-in" style={{ '--delay': '0.35s' }}>
          We're building something quietly enormous. A new corner of the
          universe is almost ready for visitors.
        </p>

        <blockquote className="quote fade-in" style={{ '--delay': '0.45s' }}>
          <span className="quote__mark" aria-hidden="true">“</span>
          <p>A Speck of Dust</p>
          <cite>— every beginning, from far enough away</cite>
        </blockquote>

        <div className="fade-in" style={{ '--delay': '0.55s' }}>
          <CountdownTimer />
        </div>

        <div className="fade-in notify-wrap" style={{ '--delay': '0.65s' }}>
          <NotifyForm />
          <p className="notify-hint">Be the first to know when we launch. No spam, ever.</p>
        </div>

        <div className="socials fade-in" style={{ '--delay': '0.75s' }}>
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              aria-label={s.name}
              className="socials__link"
              target="_blank"
              rel="noreferrer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={s.path} fill="currentColor" />
              </svg>
            </a>
          ))}
        </div>

        <footer className="footer fade-in" style={{ '--delay': '0.85s' }}>
          <p>&copy; {new Date().getFullYear()} Sledje. All rights reserved.</p>
        </footer>
      </main>
    </div>
  )
}

export default App
